import React, { useState, useEffect } from 'react';
import { Banknote } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'email' | 'tel' | 'case_select';
  options?: string[] | { label: string; value: any }[];
  required?: boolean;
  readonly?: boolean;
}

const Payroll = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [employees, setEmployees] = useState<Array<{ label: string; value: string }>>([]);

  const { data: payrollData, loading, addItem, updateItem, deleteItem } = useSupabaseData({
    table: 'payroll',
    orderBy: { column: 'created_at', ascending: false },
    realtime: true,
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data: employeesData, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('role', ['advocate', 'company']);

        if (error) throw error;

        const employeeOptions = employeesData?.map(emp => ({
          label: `${emp.first_name || ''} ${emp.last_name || ''} (${emp.email})`.trim(),
          value: emp.id
        })) || [];

        setEmployees(employeeOptions);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees data');
      }
    };

    fetchEmployees();
  }, []);

  const fields: FieldConfig[] = [
    { key: 'employee_id', label: 'Employee', type: 'select', options: employees, required: true },
    { key: 'pay_period_start', label: 'Pay Period Start', type: 'date', required: true },
    { key: 'pay_period_end', label: 'Pay Period End', type: 'date', required: true },
    { key: 'salary_amount', label: 'Salary Amount', type: 'number', required: true },
    { key: 'bonus_amount', label: 'Bonus Amount', type: 'number', required: false },
    { key: 'deductions', label: 'Deductions', type: 'number', required: false },
    { key: 'net_amount', label: 'Net Amount', type: 'number', required: true },
    { key: 'payment_date', label: 'Payment Date', type: 'date', required: false },
    { key: 'payment_method', label: 'Payment Method', type: 'select', options: ['bank_transfer', 'check', 'cash', 'direct_deposit'], required: false },
    { key: 'payment_status', label: 'Payment Status', type: 'select', options: ['pending', 'processing', 'paid', 'failed'], required: true },
    { key: 'notes', label: 'Notes', type: 'textarea', required: false },
  ];

  const handleAdd = async (data: any) => {
    // Calculate net amount if not provided
    const salary = parseFloat(data.salary_amount) || 0;
    const bonus = parseFloat(data.bonus_amount) || 0;
    const deductions = parseFloat(data.deductions) || 0;
    const netAmount = salary + bonus - deductions;

    await addItem({
      ...data,
      net_amount: netAmount,
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUpdate = async (id: string, data: any) => {
    // Recalculate net amount if relevant fields changed
    if (data.salary_amount !== undefined || data.bonus_amount !== undefined || data.deductions !== undefined) {
      const currentRecord = payrollData.find((p: any) => p.id === id);
      const salary = parseFloat(data.salary_amount ?? currentRecord?.salary_amount) || 0;
      const bonus = parseFloat(data.bonus_amount ?? currentRecord?.bonus_amount) || 0;
      const deductions = parseFloat(data.deductions ?? currentRecord?.deductions) || 0;
      data.net_amount = salary + bonus - deductions;
    }

    await updateItem(id, data);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    setRefreshTrigger(prev => prev + 1);
  };

  // Enrich payroll data with employee names
  const enrichedPayrollData = payrollData.map((payroll: any) => {
    const employee = employees.find(e => e.value === payroll.employee_id);
    return {
      ...payroll,
      employee_name: employee?.label || 'Unknown',
      pay_period: `${payroll.pay_period_start ? format(new Date(payroll.pay_period_start), 'MM/dd/yy') : ''} - ${payroll.pay_period_end ? format(new Date(payroll.pay_period_end), 'MM/dd/yy') : ''}`,
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Banknote className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Payroll Management</h1>
      </div>
      
      <DataTable
        title="Employee Payroll"
        data={enrichedPayrollData}
        columns={[
          { key: 'employee_name', label: 'Employee', sortable: true },
          { key: 'pay_period', label: 'Pay Period' },
          { key: 'salary_amount', label: 'Salary', render: (value) => `$${parseFloat(value).toFixed(2)}` },
          { key: 'net_amount', label: 'Net Pay', render: (value) => `$${parseFloat(value).toFixed(2)}`, sortable: true },
          { key: 'payment_status', label: 'Status', filterable: true, filterOptions: ['pending', 'processing', 'paid', 'failed'] },
          { key: 'payment_date', label: 'Payment Date', render: (value) => value ? format(new Date(value), 'MM/dd/yyyy') : 'N/A' },
        ]}
        fields={fields}
        onAdd={handleAdd}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        loading={loading}
        searchPlaceholder="Search payroll..."
        entityName="payroll entry"
      />
    </div>
  );
};

export default Payroll;