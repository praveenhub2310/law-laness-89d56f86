
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const AccountsManagement = () => {
  const initialAccountsData = [
    {
      id: "ACC-001",
      username: "sarah.wilson",
      fullName: "Sarah Wilson",
      email: "s.wilson@akralegal.com",
      role: "Senior Partner",
      department: "Litigation",
      permissions: "Full Access",
      status: "Active",
      lastLogin: "2024-01-12 09:30 AM",
      createdDate: "2019-03-15",
      createdBy: "System Admin",
      twoFactorEnabled: true,
      loginAttempts: 0
    },
    {
      id: "ACC-002",
      username: "john.davis",
      fullName: "John Davis",
      email: "j.davis@akralegal.com",
      role: "Associate",
      department: "Family Law",
      permissions: "Standard Access",
      status: "Active",
      lastLogin: "2024-01-11 02:15 PM",
      createdDate: "2021-08-22",
      createdBy: "Sarah Wilson",
      twoFactorEnabled: true,
      loginAttempts: 0
    },
    {
      id: "ACC-003",
      username: "emily.brown",
      fullName: "Emily Brown",
      email: "e.brown@akralegal.com",
      role: "Paralegal",
      department: "Research",
      permissions: "Limited Access",
      status: "Active",
      lastLogin: "2024-01-10 11:45 AM",
      createdDate: "2020-11-10",
      createdBy: "John Davis",
      twoFactorEnabled: false,
      loginAttempts: 1
    },
    {
      id: "ACC-004",
      username: "michael.johnson",
      fullName: "Michael Johnson",
      email: "m.johnson@akralegal.com",
      role: "Office Manager",
      department: "Administration",
      permissions: "Administrative Access",
      status: "Suspended",
      lastLogin: "2024-01-05 04:20 PM",
      createdDate: "2018-05-01",
      createdBy: "System Admin",
      twoFactorEnabled: true,
      loginAttempts: 3
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialAccountsData,
    entityName: 'Account'
  });

  const columns = [
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      filterable: true,
      className: 'min-w-[120px]'
    },
    {
      key: 'fullName',
      label: 'Full Name',
      sortable: true,
      filterable: true,
      className: 'min-w-[150px]'
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      className: 'min-w-[200px] hidden sm:table-cell'
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      filterable: true,
      filterOptions: ['Senior Partner', 'Associate', 'Paralegal', 'Office Manager'],
      className: 'min-w-[140px]',
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">{value}</Badge>
      )
    },
    {
      key: 'permissions',
      label: 'Permissions',
      sortable: true,
      filterable: true,
      filterOptions: ['Full Access', 'Administrative Access', 'Standard Access', 'Limited Access'],
      className: 'min-w-[150px] hidden md:table-cell',
      render: (value: string) => {
        const colors = {
          'Full Access': 'bg-red-100 text-red-800',
          'Administrative Access': 'bg-purple-100 text-purple-800',
          'Standard Access': 'bg-blue-100 text-blue-800',
          'Limited Access': 'bg-yellow-100 text-yellow-800'
        };
        return (
          <Badge className={`${colors[value as keyof typeof colors]} text-xs`}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active', 'Suspended', 'Inactive', 'Pending'],
      className: 'min-w-[100px]',
      render: (value: string) => {
        const colors = {
          'Active': 'bg-green-100 text-green-800',
          'Suspended': 'bg-red-100 text-red-800',
          'Inactive': 'bg-gray-100 text-gray-800',
          'Pending': 'bg-yellow-100 text-yellow-800'
        };
        return (
          <Badge className={`${colors[value as keyof typeof colors]} text-xs`}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      filterable: true,
      className: 'min-w-[150px] hidden lg:table-cell'
    },
    {
      key: 'twoFactorEnabled',
      label: '2FA',
      sortable: true,
      filterable: true,
      className: 'min-w-[80px] hidden lg:table-cell',
      render: (value: boolean) => (
        <Badge className={`${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs`}>
          {value ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    },
    {
      key: 'loginAttempts',
      label: 'Failed Logins',
      sortable: true,
      filterable: true,
      className: 'min-w-[120px] hidden xl:table-cell',
      render: (value: number) => (
        <Badge className={`${value > 2 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} text-xs`}>
          {value}
        </Badge>
      )
    }
  ];

  const fields = [
    { key: 'username', label: 'Username', type: 'text' as const, required: true },
    { key: 'fullName', label: 'Full Name', type: 'text' as const, required: true },
    { key: 'email', label: 'Email', type: 'email' as const, required: true },
    { 
      key: 'role', 
      label: 'Role', 
      type: 'select' as const,
      options: ['Senior Partner', 'Associate', 'Paralegal', 'Office Manager'],
      required: true 
    },
    { 
      key: 'department', 
      label: 'Department', 
      type: 'select' as const,
      options: ['Litigation', 'Family Law', 'Research', 'Administration'],
      required: true 
    },
    { 
      key: 'permissions', 
      label: 'Permissions', 
      type: 'select' as const,
      options: ['Full Access', 'Administrative Access', 'Standard Access', 'Limited Access'],
      required: true 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Active', 'Suspended', 'Inactive', 'Pending'],
      required: true 
    },
    { key: 'createdDate', label: 'Created Date', type: 'date' as const },
    { key: 'createdBy', label: 'Created By', type: 'text' as const },
    { key: 'twoFactorEnabled', label: 'Two Factor Authentication', type: 'select' as const, options: ['true', 'false'] },
    { key: 'loginAttempts', label: 'Failed Login Attempts', type: 'number' as const }
  ];

  return (
    <div className="p-3 sm:p-6">
      <DataTable
        title="User Accounts Management"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search accounts by username, name, or email..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Account"
        className="overflow-x-auto"
      />
    </div>
  );
};

export default AccountsManagement;
