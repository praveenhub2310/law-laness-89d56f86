import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Scale, Building2, User, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

const roles = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Complete system access with advanced tools for case analysis and compliance management.',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'advocate',
    name: 'Lawyer/Advocate', 
    description: 'Case management, time tracking, document analysis, and client communication tools.',
    icon: Scale,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'company',
    name: 'Law Firm',
    description: 'Team management, case assignment, analytics, and firm-wide administration tools.',
    icon: Building2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'client',
    name: 'Client',
    description: 'View case status, communicate with advocates, upload documents, and track payments.',
    icon: User,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (roleId: string) => {
    navigate('/signup', { state: { selectedRole: roleId } });
  };

  return (
    <AuthLayout
      title="Choose Your Role"
      description="Select your role to personalize your Akralegal experience"
    >
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="mb-4 p-0 h-auto text-gray-600 hover:text-gray-800"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Button>

        <div className="grid gap-4">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card
                key={role.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20"
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${role.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${role.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm leading-relaxed">
                    {role.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AuthLayout>
  );
};

export default RoleSelection;