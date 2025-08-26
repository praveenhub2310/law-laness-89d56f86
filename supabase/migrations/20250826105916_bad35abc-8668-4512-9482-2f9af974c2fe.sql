-- Try with basic transaction types
INSERT INTO public.transactions (
  transaction_type,
  amount,
  currency,
  method,
  status,
  description
) VALUES 
('income', 5250.00, 'USD', 'card', 'pending', 'Legal consultation fee'),
('expense', 450.00, 'USD', 'bank_transfer', 'pending', 'Court filing fees'),
('transfer', 1200.00, 'USD', 'cash', 'pending', 'Retainer fee refund');