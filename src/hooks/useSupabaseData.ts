import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface UseSupabaseDataConfig {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  realtime?: boolean;
}

export const useSupabaseData = <T extends Record<string, any>>({
  table,
  select = '*',
  filters = {},
  orderBy,
  realtime = false
}: UseSupabaseDataConfig) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table as any).select(select);

      // Apply filters
      Object.entries(filters).forEach(([column, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(column, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setData((result as unknown as T[]) || []);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch data';
      setError(errorMessage);
      console.error(`Error fetching data from ${table}:`, err);
    } finally {
      setLoading(false);
    }
  }, [table, select, filters, orderBy, user]);

  const addItem = useCallback(async (newItem: any) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data: result, error } = await supabase
        .from(table as any)
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;

      setData(prev => [result as unknown as T, ...prev]);
      toast({
        title: 'Success',
        description: 'Item added successfully.',
      });

      return { data: result, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to add item';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { data: null, error: errorMessage };
    }
  }, [table, user, toast]);

  const updateItem = useCallback(async (id: string, updates: any) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data: result, error } = await supabase
        .from(table as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setData(prev => prev.map(item => 
        (item as any).id === id ? result as unknown as T : item
      ));

      toast({
        title: 'Success',
        description: 'Item updated successfully.',
      });

      return { data: result, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update item';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { data: null, error: errorMessage };
    }
  }, [table, user, toast]);

  const deleteItem = useCallback(async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from(table as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setData(prev => prev.filter(item => (item as any).id !== id));
      
      toast({
        title: 'Success',
        description: 'Item deleted successfully.',
      });

      return { error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete item';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { error: errorMessage };
    }
  }, [table, user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!realtime || !user) return;

    const channel = supabase
      .channel(`schema-db-changes-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtime, table, user, fetchData]);

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refetch: fetchData
  };
};