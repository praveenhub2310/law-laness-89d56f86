import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const HumanResources = () => {
  const initialEmployeesData = [
    {
      id: "EMP-001",
      employeeId: "LAW-001",
      firstName: "Sarah",
      lastName: "Wilson",
      position: "Senior Partner",
      department: "Litigation",
      email: "s.wilson@akralegal.com",
      phone: "+1-555-0101",
      hireDate: "2019-03-15",
      status: "Active",
      salary: "$150,000",
      specialization: "Corporate Law",
      barNumber: "BAR-NY-12345",
      experience: "12 years"
    },
    {
      id: "EMP-002",
      employeeId: "LAW-002",
      firstName: "John",
      lastName: "Davis",
      position: "Associate",
      department: "Family Law",
      email: "j.davis@akralegal.com",
      phone: "+1-555-0102",
      hireDate: "2021-08-22",
      status: "Active",
      salary: "$95,000",
      specialization: "Family Law",
      barNumber: "BAR-NY-23456",
      experience: "5 years"
    },
    {
      id: "EMP-003",
      employeeId: "PAR-001",
      firstName: "Emily",
      lastName: "Brown",
      position: "Paralegal",
      department: "Research",
      email: "e.brown@akralegal.com",
      phone: "+1-555-0103",
      hireDate: "2020-11-10",
      status: "Active",
      salary: "$55,000",
      specialization: "Legal Research",
      barNumber: "N/A",
      experience: "8 years"
    },
    {
      id: "EMP-004",
      employeeId: "ADM-001",
      firstName: "Michael",
      lastName: "Johnson",
      position: "Office Manager",
      department: "Administration",
      email: "m.johnson@akralegal.com",
      phone: "+1-555-0104",
      hireDate: "2018-05-01",
      status: "On Leave",
      salary: "$65,000",
      specialization: "Office Management",
      barNumber: "N/A",
      experience: "15 years"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialEmployeesData,
    entityName: 'Employee'
  });

  const columns = [
    {
      key: 'employeeId',
      label: 'Employee ID',
      sortable: true,
      filterable: true,
      className: 'min-w-[120px]'
    },
    {
      key: 'firstName',
      label: 'First Name',
      sortable: true,
      filterable: true,
      className: 'min-w-[120px]'
    },
    {
      key: 'lastName',
      label: 'Last Name',
      sortable: true,
      filterable: true,
      className: 'min-w-[120px] hidden sm:table-cell'
    },
    {
      key: 'position',
      label: 'Position',
      sortable: true,
      filterable: true,
      filterOptions: ['Senior Partner', 'Associate', 'Paralegal', 'Office Manager'],
      className: 'min-w-[140px]',
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">{value}</Badge>
      )
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      filterable: true,
      filterOptions: ['Litigation', 'Family Law', 'Research', 'Administration'],
      className: 'min-w-[130px] hidden md:table-cell',
      render: (value: string) => {
        const colors = {
          'Litigation': 'bg-blue-100 text-blue-800',
          'Family Law': 'bg-green-100 text-green-800',
          'Research': 'bg-purple-100 text-purple-800',
          'Administration': 'bg-orange-100 text-orange-800'
        };
        return (
          <Badge className={`${colors[value as keyof typeof colors]} text-xs`}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      className: 'min-w-[200px] hidden lg:table-cell'
    },
    {
      key: 'hireDate',
      label: 'Hire Date',
      sortable: true,
      filterable: true,
      className: 'min-w-[110px] hidden lg:table-cell'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active', 'On Leave', 'Terminated', 'Retired'],
      className: 'min-w-[100px]',
      render: (value: string) => {
        const colors = {
          'Active': 'bg-green-100 text-green-800',
          'On Leave': 'bg-yellow-100 text-yellow-800',
          'Terminated': 'bg-red-100 text-red-800',
          'Retired': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={`${colors[value as keyof typeof colors]} text-xs`}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'specialization',
      label: 'Specialization',
      sortable: true,
      filterable: true,
      className: 'min-w-[150px] hidden xl:table-cell'
    },
    {
      key: 'experience',
      label: 'Experience',
      sortable: true,
      filterable: true,
      className: 'min-w-[110px] hidden xl:table-cell'
    }
  ];

  const fields = [
    { key: 'employeeId', label: 'Employee ID', type: 'text' as const, required: true },
    { key: 'firstName', label: 'First Name', type: 'text' as const, required: true },
    { key: 'lastName', label: 'Last Name', type: 'text' as const, required: true },
    { 
      key: 'position', 
      label: 'Position', 
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
    { key: 'email', label: 'Email', type: 'email' as const, required: true },
    { key: 'phone', label: 'Phone', type: 'tel' as const, required: true },
    { key: 'hireDate', label: 'Hire Date', type: 'date' as const, required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Active', 'On Leave', 'Terminated', 'Retired'],
      required: true 
    },
    { key: 'salary', label: 'Salary', type: 'text' as const },
    { key: 'specialization', label: 'Specialization', type: 'text' as const },
    { key: 'barNumber', label: 'Bar Number', type: 'text' as const },
    { key: 'experience', label: 'Experience', type: 'text' as const }
  ];

  return (
    <div className="p-3 sm:p-6">
      <DataTable
        title="Human Resources Management"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search employees by name, position, or department..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Employee"
        className="overflow-x-auto"
      />
    </div>
  );
};

export default HumanResources;
