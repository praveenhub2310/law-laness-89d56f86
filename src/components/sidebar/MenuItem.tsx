
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { 
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MenuItemProps {
  item: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    subItems?: Array<{
      title: string;
      path: string;
      icon?: React.ComponentType<{ className?: string }>;
    }>;
  };
  expandedItems: string[];
  toggleExpanded: (title: string) => void;
}

const MenuItem = ({ item, expandedItems, toggleExpanded }: MenuItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  
  const isParentActive = (item: any) => {
    if (item.subItems && item.subItems.length > 0) {
      return item.subItems.some((subItem: any) => location.pathname === subItem.path);
    }
    return false;
  };

  // Handle items with sub-items
  if (item.subItems && item.subItems.length > 0) {
    return (
      <SidebarMenuItem>
        <Collapsible open={expandedItems.includes(item.title)}>
          <CollapsibleTrigger
            onClick={() => toggleExpanded(item.title)}
            className={`flex items-center w-full px-4 py-3 text-sm rounded-md transition-colors ${
              isActive(item.path) || isParentActive(item)
                ? 'bg-blue-700 text-white' 
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
              <item.icon className="h-4 w-4" />
            </div>
            <span className="flex-1 text-left truncate">{item.title}</span>
            {expandedItems.includes(item.title) ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.subItems.map((subItem) => (
              <SidebarMenuButton
                key={subItem.title}
                onClick={() => navigate(subItem.path)}
                className={`flex items-center w-full py-2.5 text-sm rounded-md transition-colors ml-8 ${
                  isActive(subItem.path) 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
                  {subItem.icon && <subItem.icon className="h-4 w-4" />}
                </div>
                <span className="truncate">{subItem.title}</span>
              </SidebarMenuButton>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  }

  // Handle single menu items
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => navigate(item.path)}
        className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
          isActive(item.path) 
            ? 'bg-blue-700 text-white' 
            : 'text-blue-100 hover:bg-blue-700 hover:text-white'
        }`}
      >
        <div className="flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
          <item.icon className="h-4 w-4" />
        </div>
        <span className="truncate">{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default MenuItem;
