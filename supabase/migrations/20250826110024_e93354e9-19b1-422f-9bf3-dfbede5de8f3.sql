-- Insert 3 sample transactions with correct constraint values
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
  'success',
  'pay_12345abc',
  'Legal consultation fee - Initial meeting and case evaluation',
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'adjustment',
  450.00,
  'USD',
  'bank_transfer',
  'success',
  'adj_67890def',
  'Court filing fees adjustment',
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