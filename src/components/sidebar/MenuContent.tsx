
import React from 'react';
import { 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu
} from '@/components/ui/sidebar';
import MenuItem from './MenuItem';
import { menuItems } from './menuItems';
import { useAuth } from '@/contexts/AuthContext';

interface MenuContentProps {
  expandedItems: string[];
  toggleExpanded: (title: string) => void;
}

const MenuContent = ({ expandedItems, toggleExpanded }: MenuContentProps) => {
  // Get user role from auth context
  const { userProfile } = useAuth();
  const userRole = userProfile?.role || 'client';

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    const hasAccess = item.roles.includes(userRole);
    console.log(`Item: ${item.title}, User Role: ${userRole}, Has Access: ${hasAccess}`); // Debug log
    return hasAccess;
  }).map(item => ({
    ...item,
    subItems: item.subItems?.filter(subItem => 
      subItem.roles.includes(userRole)
    )
  }));

  console.log('Filtered menu items count:', filteredMenuItems.length); // Debug log
  console.log('Filtered menu items:', filteredMenuItems.map(item => item.title)); // Debug log

  // Show fallback if no items are available
  if (filteredMenuItems.length === 0) {
    return (
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="p-4 text-center text-blue-100">
              <p className="text-sm">No menu items available</p>
              <p className="text-xs mt-2 opacity-75">Role: {userRole}</p>
              <p className="text-xs mt-1 opacity-75">Please check your permissions</p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  return (
    <SidebarContent className="p-2">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {filteredMenuItems.map((item) => (
              <MenuItem
                key={item.title}
                item={item}
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
};

export default MenuContent;
