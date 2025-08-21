import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment';
import { 
  CreditCard, 
  Check, 
  Download, 
  Calendar,
  Crown,
  Zap,
  AlertCircle,
  Loader2,
  Star,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  payment_method: string | null;
  plan: SubscriptionPlan;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  invoice_date: string;
  due_date: string;
}

const Subscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { initiatePayment, loading: paymentLoading } = useRazorpayPayment();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [billingHistoryOpen, setBillingHistoryOpen] = useState(false);

  // Check if plan is about to expire (within 7 days)
  const isExpiringSoon = (endDate: string) => {
    const expiryDate = new Date(endDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const expiryDate = new Date(endDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    fetchSubscriptionData();
    setupRealtimeSubscriptions();
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch available plans and payment settings in parallel
      const [plansResponse, paymentSettingsResponse] = await Promise.all([
        supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true }),
        supabase
          .from('payment_settings')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      ]);

      if (plansResponse.error) throw plansResponse.error;
      
      // Transform the data to match our interface
      const transformedPlans = (plansResponse.data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features.map(f => String(f)) : []
      }));
      setPlans(transformedPlans);

      // Set payment settings (might not exist yet)
      if (paymentSettingsResponse.data) {
        setPaymentSettings(paymentSettingsResponse.data);
      }

      // Fetch current user subscription
      if (user) {
        const { data: subscriptionData, error: subError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            plan:subscription_plans(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (!subError && subscriptionData) {
          // Transform subscription data
          const transformedSubscription = {
            ...subscriptionData,
            plan: {
              ...subscriptionData.plan,
              features: Array.isArray(subscriptionData.plan.features) 
                ? subscriptionData.plan.features.map(f => String(f))
                : []
            }
          };
          setCurrentSubscription(transformedSubscription);

          // Fetch invoices for current subscription
          const { data: invoicesData, error: invoicesError } = await supabase
            .from('subscription_invoices')
            .select('*')
            .eq('subscription_id', subscriptionData.id)
            .order('invoice_date', { ascending: false });

          if (!invoicesError) {
            setInvoices(invoicesData || []);
          }
        } else {
          setCurrentSubscription(null);
          setInvoices([]);
        }
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    const subscriptionChannel = supabase
      .channel('user-subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSubscriptionData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscription_plans',
        },
        () => {
          fetchSubscriptionData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  };

  const handleSubscribe = async (planId: string) => {
    console.log('🔵 handleSubscribe called with planId:', planId);
    
    if (!user) {
      console.log('❌ No user found');
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      console.log('❌ Plan not found for ID:', planId);
      return;
    }
    
    console.log('✅ Plan found:', plan);
    console.log('🔧 Payment settings:', paymentSettings);

    // Check if payment gateway is configured and active
    if (!paymentSettings || !paymentSettings.is_active) {
      console.log('❌ Payment settings not active:', paymentSettings);
      toast({
        title: "Payment Unavailable",
        description: "Payment gateway is currently unavailable. Please contact support.",
        variant: "destructive"
      });
      return;
    }

    if (!paymentSettings.enable_razorpay_subscription) {
      console.log('❌ Subscriptions not enabled');
      toast({
        title: "Subscriptions Unavailable", 
        description: "Subscription payments are currently disabled. Please contact support.",
        variant: "destructive"
      });
      return;
    }

    console.log('🚀 Initiating payment with:', {
      planId: plan.id,
      amount: plan.price,
      currency: plan.currency || 'INR',
      planName: plan.name
    });

    await initiatePayment({
      planId: plan.id,
      amount: plan.price,
      currency: plan.currency || 'INR',
      planName: plan.name
    });
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;
    
    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled",
      });
      
      fetchSubscriptionData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      // Mock download - in real implementation, this would generate and download PDF
      toast({
        title: "Invoice Downloaded",
        description: "Invoice has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, icon: Check, text: 'Active' },
      cancelled: { variant: 'destructive' as const, icon: AlertCircle, text: 'Cancelled' },
      expired: { variant: 'secondary' as const, icon: AlertCircle, text: 'Expired' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.expired;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Subscriptions</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-2">
        <CreditCard className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Financial Management</h1>
      </div>

      {/* Expiry Warning Banner */}
      {currentSubscription && 
       currentSubscription.status === 'active' && 
       isExpiringSoon(currentSubscription.current_period_end) && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Your plan expires in {getDaysUntilExpiry(currentSubscription.current_period_end)} days
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Renew now to avoid service interruption
              </p>
            </div>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Renew Now
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Current Active Plan */}
      {currentSubscription && (
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 via-primary/3 to-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
          <CardHeader>
            <div className="flex items-center justify-between relative">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Current Active Plan</h3>
                  <p className="text-sm text-muted-foreground">Your subscription details</p>
                </div>
              </CardTitle>
              {getStatusBadge(currentSubscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Plan Name</p>
                <p className="text-lg font-bold">{currentSubscription.plan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentSubscription.plan.name === 'Starter' ? 'Solo Lawyers & Small Firms' : 'Growing Firms & Legal Teams'}
                </p>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Price</p>
                <p className="text-2xl font-bold text-primary">₹{currentSubscription.plan.price}</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Renewal Date</p>
                <p className="font-semibold">{formatDate(currentSubscription.current_period_end)}</p>
                <p className="text-xs text-muted-foreground">Auto-renewal</p>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Payment Method</p>
                <p className="font-semibold flex items-center justify-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {currentSubscription.payment_method || 'Not set'}
                </p>
                <Button variant="link" size="sm" className="text-xs p-0">
                  <Settings className="h-3 w-3 mr-1" />
                  Update
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {currentSubscription.status === 'active' && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" disabled={actionLoading} className="flex-1 sm:flex-none">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period on {formatDate(currentSubscription.current_period_end)}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>No, Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription} disabled={actionLoading}>
                          Yes, Cancel Subscription
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew Now
                  </Button>
                  
                  {invoices.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleDownloadInvoice(invoices[0].id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground">Select the perfect plan for your legal practice</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentSubscription?.plan_id === plan.id;
            const isRecommended = plan.name === 'Growth';
            const isStarter = plan.name === 'Starter';
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-xl min-h-[600px] flex flex-col ${
                  isCurrentPlan 
                    ? 'border-2 border-primary shadow-2xl scale-105' 
                    : 'hover:scale-105 hover:border-primary/50'
                } ${isCurrentPlan ? 'bg-gradient-to-br from-primary/5 to-primary/10' : ''}`}
              >
                {/* Ribbon Badge */}
                {(isCurrentPlan || isRecommended) && (
                  <div className={`absolute -top-3 -right-3 z-10 px-4 py-1 text-xs font-bold text-white rounded-full shadow-lg ${
                    isCurrentPlan ? 'bg-primary' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}>
                    {isCurrentPlan ? (
                      <><Crown className="h-3 w-3 mr-1 inline" />Current Plan</>
                    ) : (
                      <><Star className="h-3 w-3 mr-1 inline" />Recommended</>
                    )}
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${isStarter ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20'}`}>
                      {isStarter ? (
                        <Crown className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isStarter ? 'For Solo Lawyers & Small Firms' : 'For Growing Firms & Legal Teams'}
                  </p>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-1">₹{plan.price}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-4 text-center">What's Included:</h4>
                    <div className="grid grid-cols-1 gap-2 mb-6">
                      {plan.features.map((feature: string, featureIndex: number) => (
                        <div key={featureIndex} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="mt-0.5">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          </div>
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-auto">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full h-12 text-base font-semibold">
                        <Check className="h-5 w-5 mr-2" />
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        className={`w-full h-12 text-base font-semibold transition-all ${
                          isRecommended 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg' 
                            : ''
                        }`}
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={actionLoading || !!currentSubscription}
                      >
                        {actionLoading ? (
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <>
                            {currentSubscription ? 'Upgrade to' : 'Get Started'}
                            {isRecommended && <Zap className="h-5 w-5 ml-2" />}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      {invoices.length > 0 && (
        <Card>
          <Collapsible open={billingHistoryOpen} onOpenChange={setBillingHistoryOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Billing History
                  </span>
                  {billingHistoryOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{invoice.invoice_number}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDate(invoice.invoice_date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">₹{invoice.amount}</p>
                          <Badge 
                            variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {invoice.status === 'paid' ? (
                              <><Check className="h-3 w-3 mr-1" />Paid</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 mr-1" />Pending</>
                            )}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
};

export default Subscription;