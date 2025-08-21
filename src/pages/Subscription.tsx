import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  Check, 
  Download, 
  Calendar,
  Crown,
  Zap,
  AlertCircle,
  Loader2
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
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
    setupRealtimeSubscriptions();
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch available plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (plansError) throw plansError;
      
      // Transform the data to match our interface
      const transformedPlans = (plansData || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features.map(f => String(f)) : []
      }));
      setPlans(transformedPlans);

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
    if (!user) return;
    
    try {
      setActionLoading(true);
      
      // Create subscription
      const currentDate = new Date();
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
      
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          current_period_start: currentDate.toISOString(),
          current_period_end: nextMonth.toISOString(),
          payment_method: 'Credit Card'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully subscribed to plan",
      });
      
      fetchSubscriptionData();
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe to plan",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Subscriptions</h1>
      </div>
      
      {/* Current Active Plan */}
      {currentSubscription && (
        <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Current Active Plan
              </CardTitle>
              {getStatusBadge(currentSubscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan Name</p>
                <p className="font-semibold text-lg">{currentSubscription.plan.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-semibold text-lg">
                  ₹{currentSubscription.plan.price} / Month
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Renewal Date</p>
                <p className="font-semibold">{formatDate(currentSubscription.current_period_end)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-semibold">{currentSubscription.payment_method || 'Not set'}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-4">
              {currentSubscription.status === 'active' && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" disabled={actionLoading}>
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
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
                  
                  {invoices.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleDownloadInvoice(invoices[0].id)}
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
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${
              currentSubscription?.plan_id === plan.id 
                ? 'border-2 border-primary shadow-lg' 
                : 'hover:shadow-lg transition-shadow'
            }`}>
              {currentSubscription?.plan_id === plan.id && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Crown className="h-3 w-3 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {plan.name === 'Growth' ? (
                      <Zap className="h-5 w-5 text-primary" />
                    ) : (
                      <Crown className="h-5 w-5 text-muted-foreground" />
                    )}
                    {plan.name}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold">₹{plan.price}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4">
                  {currentSubscription?.plan_id === plan.id ? (
                    <Button disabled className="w-full">
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={actionLoading || !!currentSubscription}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <>
                          {currentSubscription ? 'Upgrade to' : 'Get Started'}
                          {plan.name === 'Growth' && <Zap className="h-4 w-4 ml-2" />}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Invoices */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.invoice_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">₹{invoice.amount}</p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Subscription;