
import React from 'react';
import { SidebarFooter } from '@/components/ui/sidebar';

const AppSidebarFooter = () => {
  return (
    <SidebarFooter className="p-4 border-t border-blue-600/20">
      <div className="text-xs text-blue-100">
        <p className="text-white">© 2025 Lawlanes</p>
        <p className="text-blue-200">Version 1.0.0</p>
      </div>
    </SidebarFooter>
  );
};

export default AppSidebarFooter;
