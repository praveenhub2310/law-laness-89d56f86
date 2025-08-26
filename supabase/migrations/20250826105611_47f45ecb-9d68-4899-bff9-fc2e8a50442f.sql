-- Insert 3 sample transactions for testing
INSERT INTO public.transactions (
  transaction_type,
  amount,
  currency,
  method,
  status,
  payment_gateway_id,
  description,
  client_id,
  processed_by
) VALUES 
(
  'payment',
  5250.00,
  'USD',
  'card',
  'completed',
  'pay_12345abc',
  'Legal consultation fee - Initial meeting and case evaluation',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'expense',
  450.00,
  'USD',
  'bank_transfer',
  'completed',
  'exp_67890def',
  'Court filing fees for case documentation',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'refund',
  1200.00,
  'USD',
  'upi',
  'pending',
  'ref_11223ghi',
  'Partial refund for overpayment on retainer fee',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
);