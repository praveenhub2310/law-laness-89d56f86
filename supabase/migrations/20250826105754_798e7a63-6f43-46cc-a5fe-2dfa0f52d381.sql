-- Insert simple transactions with basic values
INSERT INTO public.transactions (
  amount,
  currency,
  method,
  status,
  description
) VALUES 
(5250.00, 'USD', 'card', 'pending', 'Legal consultation fee'),
(450.00, 'USD', 'bank_transfer', 'pending', 'Court filing fees'),
(1200.00, 'USD', 'cash', 'pending', 'Retainer fee refund');