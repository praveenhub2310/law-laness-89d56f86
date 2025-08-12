
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, Calendar, AlertCircle, Clock, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OnlinePayments = () => {
  const { toast } = useToast();
  const [payments] = useState([
    {
      id: 1,
      invoice: 'INV-2024-001',
      case: 'Johnson vs Insurance',
      amount: 2500,
      dueDate: '2024-01-20',
      status: 'pending',
      description: 'Legal consultation and document preparation'
    },
    {
      id: 2,
      invoice: 'INV-2024-002',
      case: 'Smith Property Dispute',
      amount: 1800,
      dueDate: '2024-01-15',
      status: 'overdue',
      description: 'Court representation and filing fees'
    },
    {
      id: 3,
      invoice: 'INV-2023-045',
      case: 'Corporate Contract Review',
      amount: 3200,
      dueDate: '2023-12-28',
      status: 'paid',
      description: 'Contract review and legal advice'
    }
  ]);

  const handlePayment = (paymentId: number, amount: number) => {
    toast({
      title: "Payment Processing",
      description: `Redirecting to secure payment gateway for $${amount}...`,
    });
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
      });
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      paid: { color: 'bg-green-100 text-green-800', icon: Check }
    };
    const config = configs[status as keyof typeof configs];
    const Icon = config?.icon || Clock;
    
    return (
      <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium">Total Outstanding</h4>
              <p className="text-2xl font-bold text-green-600">$4,300</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h4 className="font-medium">Overdue</h4>
              <p className="text-2xl font-bold text-red-600">$1,800</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium">Due This Month</h4>
              <p className="text-2xl font-bold text-blue-600">$2,500</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold">{payment.invoice}</h4>
                    <p className="text-sm text-gray-600">{payment.case}</p>
                    <p className="text-sm text-gray-500 mt-1">{payment.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">${payment.amount}</p>
                    <p className="text-sm text-gray-500">Due: {payment.dueDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {getStatusBadge(payment.status)}
                  
                  {payment.status !== 'paid' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toast({
                          title: "Invoice Downloaded",
                          description: "Invoice has been downloaded to your device.",
                        })}
                      >
                        Download Invoice
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handlePayment(payment.id, payment.amount)}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnlinePayments;
