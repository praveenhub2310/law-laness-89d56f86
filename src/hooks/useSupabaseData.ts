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
        console.error(`Supabase error for table ${table}:`, fetchError);
        setError(fetchError.message);
        setData([]);
        return;
      }

      setData((result as unknown as T[]) || []);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch data';
      setError(errorMessage);
      setData([]);
      console.error(`Error fetching data from ${table}:`, err);
    } finally {
      setLoading(false);
    }
  }, [table, select, JSON.stringify(filters), JSON.stringify(orderBy), user]);

  const addItem = useCallback(async (newItem: any) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      // Clean and validate data before insertion
      const cleanedItem = { ...newItem };
      
      // Handle time format validation if hearing_time exists
      if (cleanedItem.hearing_time && !/^\d{2}:\d{2}$/.test(cleanedItem.hearing_time)) {
        throw new Error('Hearing time must be in HH:MM format');
      }
      
      // Ensure required fields for hearings table
      if (table === 'hearings') {
        if (!cleanedItem.title?.trim()) throw new Error('Hearing title is required');
        if (!cleanedItem.hearing_number?.trim()) throw new Error('Hearing number is required');
        if (!cleanedItem.hearing_date) throw new Error('Hearing date is required');
        if (!cleanedItem.court_name?.trim()) throw new Error('Court name is required');
        if (!cleanedItem.status?.trim()) throw new Error('Status is required');
        if (!cleanedItem.case_id?.trim()) throw new Error('Case ID is required');
        if (!cleanedItem.client_id?.trim()) throw new Error('Client ID is required');
      }

      const { data: result, error } = await supabase
        .from(table as any)
        .insert([cleanedItem])
        .select()
        .single();

      if (error) throw error;

      setData(prev => [result as unknown as T, ...prev]);
      toast({
        title: 'Success',
        description: 'Hearing saved successfully.',
      });

      return { data: result, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to save hearing, please try again';
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
      // Clean and validate data before update
      const cleanedUpdates = { ...updates };
      
      // Handle time format validation if hearing_time exists
      if (cleanedUpdates.hearing_time && !/^\d{2}:\d{2}$/.test(cleanedUpdates.hearing_time)) {
        throw new Error('Hearing time must be in HH:MM format');
      }
      
      // Ensure required fields for hearings table
      if (table === 'hearings') {
        if (cleanedUpdates.title !== undefined && !cleanedUpdates.title?.trim()) {
          throw new Error('Hearing title is required');
        }
        if (cleanedUpdates.hearing_number !== undefined && !cleanedUpdates.hearing_number?.trim()) {
          throw new Error('Hearing number is required');
        }
        if (cleanedUpdates.hearing_date !== undefined && !cleanedUpdates.hearing_date) {
          throw new Error('Hearing date is required');
        }
        if (cleanedUpdates.court_name !== undefined && !cleanedUpdates.court_name?.trim()) {
          throw new Error('Court name is required');
        }
        if (cleanedUpdates.status !== undefined && !cleanedUpdates.status?.trim()) {
          throw new Error('Status is required');
        }
      }

      const { data: result, error } = await supabase
        .from(table as any)
        .update(cleanedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setData(prev => prev.map(item => 
        (item as any).id === id ? result as unknown as T : item
      ));

      toast({
        title: 'Success',
        description: 'Hearing updated successfully.',
      });

      return { data: result, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update hearing, please try again';
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
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 100); // Small delay to prevent rapid successive calls

    return () => clearTimeout(timeoutId);
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