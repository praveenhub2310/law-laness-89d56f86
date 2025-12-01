
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';
import logo from '@/assets/lawlanes_logo.png';

const AppSidebarHeader = () => {
  return (
    <SidebarHeader className="p-4 border-b border-blue-600/20">
      <div className="flex items-center space-x-3">
        <img 
          src={logo} 
          alt="Law Lanes Logo" 
          className="w-8 h-8 object-contain flex-shrink-0"
        />
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white truncate">Law Lanes</h2>
          <p className="text-xs text-blue-100 truncate">Case Management</p>
        </div>
      </div>
    </SidebarHeader>
  );
};

export default AppSidebarHeader;
