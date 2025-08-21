import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Key, Webhook, Globe, Shield, Lock, ExternalLink, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentSettings {
  id?: string;
  razorpay_webhook_uri: string;
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
  const [settings, setSettings] = useState<PaymentSettings>({
    razorpay_webhook_uri: 'https://ibaqunlwzzoonbsnajbk.supabase.co/functions/v1/razorpay-webhook',
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

  const getStatusBadge = () => {
    if (settings.is_active) {
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

      {/* Security Notice */}
      <Alert className="border-success">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>🔐 Security Enhanced:</strong> Payment credentials are now securely managed via environment variables. 
          This protects your sensitive API keys from potential database breaches.
        </AlertDescription>
      </Alert>

      <Card className="border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Razorpay Configuration
          </CardTitle>
          <CardDescription>
            Configure your Razorpay settings and manage secure credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Secure Credentials Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-success" />
              <Label className="text-base font-medium">Secure Credentials Management</Label>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Razorpay API credentials are securely managed via environment secrets.</strong></p>
                  <p>Your credentials are stored in:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code>RAZORPAY_KEY_ID</code> - Your Razorpay API Key ID</li>
                    <li><code>RAZORPAY_KEY_SECRET</code> - Your Razorpay API Secret</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2">
                    These credentials are encrypted and only accessible to your edge functions.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://supabase.com/dashboard/project/ibaqunlwzzoonbsnajbk/settings/functions', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Secrets
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://dashboard.razorpay.com/app/keys', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Razorpay Dashboard
              </Button>
            </div>
          </div>

          <Separator />

          {/* Webhook Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Webhook Configuration</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhook_uri">Webhook URI</Label>
              <Input
                id="webhook_uri"
                value={settings.razorpay_webhook_uri}
                onChange={(e) => handleInputChange('razorpay_webhook_uri', e.target.value)}
                placeholder="https://your-domain.com/functions/v1/razorpay-webhook"
              />
              <p className="text-sm text-muted-foreground">
                Configure this URL in your Razorpay webhook settings
              </p>
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
            <p className="text-sm text-muted-foreground">
              Default Razorpay API endpoint (usually no need to change)
            </p>
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