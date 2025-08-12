
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';
import { Briefcase } from 'lucide-react';

const AppSidebarHeader = () => {
  return (
    <SidebarHeader className="p-4 border-b border-blue-600/20">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 legal-gradient rounded-lg flex items-center justify-center flex-shrink-0">
          <Briefcase className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white truncate">Akra Legal</h2>
          <p className="text-xs text-blue-100 truncate">Case Management</p>
        </div>
      </div>
    </SidebarHeader>
  );
};

export default AppSidebarHeader;
