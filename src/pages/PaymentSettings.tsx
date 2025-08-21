import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Eye, EyeOff, Key, Webhook, Globe, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentSettings {
  id?: string;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  razorpay_webhook_uri: string;
  razorpay_webhook_secret: string;
  razorpay_base_uri: string;
  enable_razorpay_prepaid: boolean;
  enable_razorpay_subscription: boolean;
  is_active: boolean;
  updated_at?: string;
}

const PaymentSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    keySecret: false,
    webhookSecret: false
  });
  const [settings, setSettings] = useState<PaymentSettings>({
    razorpay_key_id: '',
    razorpay_key_secret: '',
    razorpay_webhook_uri: '',
    razorpay_webhook_secret: '',
    razorpay_base_uri: 'https://api.razorpay.com/v1/',
    enable_razorpay_prepaid: true,
    enable_razorpay_subscription: true,
    is_active: false
  });

  useEffect(() => {
    fetchPaymentSettings();
    
    // Set up realtime subscription for payment settings
    const channel = supabase
      .channel('payment-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_settings'
        },
        (payload) => {
          console.log('Payment settings changed:', payload);
          fetchPaymentSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      console.error('Error fetching payment settings:', error);
      toast({
        title: "Error",
        description: "Failed to load payment settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('User not authenticated');

      const dataToSave = {
        ...settings,
        updated_by: currentUser.user.id
      };

      let result;
      if (settings.id) {
        // Update existing settings
        result = await supabase
          .from('payment_settings')
          .update(dataToSave)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Create new settings
        result = await supabase
          .from('payment_settings')
          .insert([dataToSave])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setSettings(result.data);
      toast({
        title: "Success",
        description: "Payment settings saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving payment settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save payment settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof PaymentSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSecretVisibility = (field: 'keySecret' | 'webhookSecret') => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getStatusBadge = () => {
    if (settings.is_active && settings.razorpay_key_id && settings.razorpay_key_secret) {
      return <Badge className="bg-success text-success-foreground">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
          <p className="text-muted-foreground">
            Configure Razorpay payment gateway for subscription and transaction processing
          </p>
        </div>
        {getStatusBadge()}
      </div>

      <Card className="border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Razorpay Configuration
          </CardTitle>
          <CardDescription>
            Configure your Razorpay API credentials and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key_id">Razorpay Key ID</Label>
              <Input
                id="key_id"
                placeholder="rzp_test_..."
                value={settings.razorpay_key_id}
                onChange={(e) => handleInputChange('razorpay_key_id', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="key_secret">Razorpay Key Secret</Label>
              <div className="relative">
                <Input
                  id="key_secret"
                  type={showSecrets.keySecret ? 'text' : 'password'}
                  placeholder="Enter secret key"
                  value={settings.razorpay_key_secret}
                  onChange={(e) => handleInputChange('razorpay_key_secret', e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => toggleSecretVisibility('keySecret')}
                >
                  {showSecrets.keySecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Webhook Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Webhook Configuration</Label>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="webhook_uri">Webhook URI</Label>
                <Input
                  id="webhook_uri"
                  placeholder="https://your-domain.com/api/razorpay-webhook"
                  value={settings.razorpay_webhook_uri}
                  onChange={(e) => handleInputChange('razorpay_webhook_uri', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook_secret">Webhook Secret</Label>
                <div className="relative">
                  <Input
                    id="webhook_secret"
                    type={showSecrets.webhookSecret ? 'text' : 'password'}
                    placeholder="Enter webhook secret"
                    value={settings.razorpay_webhook_secret}
                    onChange={(e) => handleInputChange('razorpay_webhook_secret', e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => toggleSecretVisibility('webhookSecret')}
                  >
                    {showSecrets.webhookSecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Base URI */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <Label htmlFor="base_uri">Razorpay Base URI</Label>
            </div>
            <Input
              id="base_uri"
              value={settings.razorpay_base_uri}
              onChange={(e) => handleInputChange('razorpay_base_uri', e.target.value)}
            />
          </div>

          <Separator />

          {/* Feature Toggles */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Feature Settings</Label>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable_prepaid">Enable Razorpay Prepaid</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow one-time payments through Razorpay
                  </p>
                </div>
                <Switch
                  id="enable_prepaid"
                  checked={settings.enable_razorpay_prepaid}
                  onCheckedChange={(checked) => handleInputChange('enable_razorpay_prepaid', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable_subscription">Enable Razorpay Subscription</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow recurring subscription payments
                  </p>
                </div>
                <Switch
                  id="enable_subscription"
                  checked={settings.enable_razorpay_subscription}
                  onCheckedChange={(checked) => handleInputChange('enable_razorpay_subscription', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Gateway Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable/disable the payment gateway
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={settings.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {settings.updated_at && (
            <>Last updated: {new Date(settings.updated_at).toLocaleString()}</>
          )}
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="lg"
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentSettings;