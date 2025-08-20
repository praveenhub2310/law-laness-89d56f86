
import React, { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import AppSidebarHeader from './sidebar/SidebarHeader';
import AppSidebarFooter from './sidebar/SidebarFooter';
import MenuContent from './sidebar/MenuContent';

const AppSidebar = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-gradient-to-b from-blue-900 to-blue-800 [&::-webkit-scrollbar]:hidden hover:[&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-600/50 [&::-webkit-scrollbar-thumb]:rounded-full">
      <AppSidebarHeader />
      <MenuContent 
        expandedItems={expandedItems}
        toggleExpanded={toggleExpanded}
      />
      <AppSidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
