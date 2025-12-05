
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';
import logo from '@/assets/lawlanes_logo.png';

const AppSidebarHeader = () => {
  return (
    <SidebarHeader className="p-4 border-b border-blue-600/20">
      <div className="flex items-center justify-center">
        <img 
          src={logo} 
          alt="Lawlanes Logo" 
          className="h-10 object-contain"
        />
      </div>
    </SidebarHeader>
  );
};

export default AppSidebarHeader;
