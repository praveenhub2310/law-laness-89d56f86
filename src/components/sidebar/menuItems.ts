
import { 
  Home,
  Briefcase, 
  Building2, 
  Calendar, 
  FileText, 
  Link, 
  Receipt, 
  MessageSquare, 
  Users, 
  CreditCard, 
  User, 
  Settings,
  BarChart3,
  Activity,
  Shield,
  Bot,
  Search,
  FileSearch,
  Clock,
  DollarSign,
  UserCheck,
  FileUp,
  PenTool,
  UserPlus,
  Calculator,
  Banknote,
  Cloud,
  FileSignature
} from 'lucide-react';

export interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: string[]; // Roles that can see this item
  subItems?: Array<{
    title: string;
    path: string;
    icon?: React.ComponentType<{ className?: string }>;
    roles: string[];
  }>;
}

export const menuItems: MenuItem[] = [
  // Dashboard - available to all roles
  {
    title: "Dashboard",
    icon: Home,
    path: "/dashboard",
    roles: ["super_admin", "company", "advocate", "client"]
  },
  
  // Super Admin exclusive items
  {
    title: "AI Tools",
    icon: Bot,
    path: "/ai-tools",
    roles: ["super_admin"],
    subItems: [
      { title: "Case Analyser", path: "/ai-tools/case-analyser", icon: Search, roles: ["super_admin"] },
      { title: "Compliance", path: "/ai-tools/compliance", icon: Shield, roles: ["super_admin"] },
      { title: "Case Summary", path: "/ai-tools/case-summary", icon: FileSearch, roles: ["super_admin"] }
    ]
  },
  {
    title: "Projects Management",
    icon: Briefcase,
    path: "/dashboard/projects",
    roles: ["super_admin"],
    subItems: [
      { title: "All Cases", path: "/dashboard/projects/cases", roles: ["super_admin"] },
      { title: "Active Cases", path: "/dashboard/projects/active", roles: ["super_admin"] },
      { title: "Closed Cases", path: "/dashboard/projects/closed", roles: ["super_admin"] }
    ]
  },
  {
    title: "Agencies",
    icon: Building2,
    path: "/dashboard/agencies",
    roles: ["super_admin"]
  },
  {
    title: "Appointments",
    icon: Calendar,
    path: "/dashboard/appointments",
    roles: ["super_admin"],
    subItems: [
      { title: "Hearings", path: "/dashboard/appointments/hearings", roles: ["super_admin"] },
      { title: "Meetings", path: "/dashboard/appointments/meetings", roles: ["super_admin"] },
      { title: "Court Dates", path: "/dashboard/appointments/court", roles: ["super_admin"] }
    ]
  },
  {
    title: "Documents Management",
    icon: FileText,
    path: "/dashboard/documents",
    roles: ["super_admin"]
  },
  {
    title: "Important Links",
    icon: Link,
    path: "/dashboard/links",
    roles: ["super_admin"]
  },
  {
    title: "Invoices",
    icon: Receipt,
    path: "/dashboard/invoices",
    roles: ["super_admin"]
  },
  {
    title: "Messages",
    icon: MessageSquare,
    path: "/dashboard/messages",
    roles: ["super_admin"]
  },
  {
    title: "Manage Parties",
    icon: Users,
    path: "/dashboard/parties",
    roles: ["super_admin"]
  },
  {
    title: "Transactions",
    icon: CreditCard,
    path: "/dashboard/transactions",
    roles: ["super_admin"]
  },
  {
    title: "Human Resources",
    icon: User,
    path: "/dashboard/hr",
    roles: ["super_admin"]
  },
  {
    title: "Accounts Management",
    icon: Settings,
    path: "/dashboard/accounts",
    roles: ["super_admin"]
  },
  {
    title: "Manage Claims",
    icon: Shield,
    path: "/dashboard/claims",
    roles: ["super_admin"]
  },
  {
    title: "System Log",
    icon: Activity,
    path: "/dashboard/logs",
    roles: ["super_admin"]
  },
  {
    title: "Reports",
    icon: BarChart3,
    path: "/dashboard/reports",
    roles: ["super_admin"]
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
    roles: ["super_admin"]
  },
  {
    title: "AI Scenario Guidance",
    icon: Bot,
    path: "/dashboard/ai-scenario",
    roles: ["super_admin"]
  },
  {
    title: "Court Cause List",
    icon: Calendar,
    path: "/dashboard/cause-list",
    roles: ["super_admin"]
  },
  {
    title: "Drafting Tool",
    icon: PenTool,
    path: "/dashboard/drafting-tool",
    roles: ["super_admin"]
  },
  {
    title: "Document Translation",
    icon: FileText,
    path: "/dashboard/translation",
    roles: ["super_admin"]
  },
  {
    title: "Court Fee Calculator",
    icon: Calculator,
    path: "/dashboard/fee-calculator",
    roles: ["super_admin"]
  },

  // Lawyer/Advocate specific items - rearranged as requested
  {
    title: "Documents Management",
    icon: FileText,
    path: "/dashboard/documents-management",
    roles: ["advocate"],
    subItems: [
      { title: "Document Analysis", path: "/dashboard/document-analysis", icon: FileSearch, roles: ["advocate"] },
      { title: "Docs Upload", path: "/dashboard/excel-upload", icon: FileUp, roles: ["advocate"] }
    ]
  },
  {
    title: "Cases",
    icon: Briefcase,
    path: "/dashboard/cases",
    roles: ["advocate"],
    subItems: [
      { title: "My Cases", path: "/dashboard/my-cases", icon: Briefcase, roles: ["advocate"] },
      { title: "Meeting Recordings", path: "/dashboard/recordings", icon: FileText, roles: ["advocate"] }
    ]
  },
  {
    title: "Court",
    icon: Calendar,
    path: "/dashboard/court",
    roles: ["advocate"],
    subItems: [
      { title: "Calendar", path: "/dashboard/court-calendar", icon: Calendar, roles: ["advocate"] },
      { title: "View Hearings", path: "/dashboard/hearings", icon: Calendar, roles: ["advocate"] }
    ]
  },
  {
    title: "Drafting & Translation",
    icon: PenTool,
    path: "/dashboard/drafting-translation",
    roles: ["advocate"]
  },
  {
    title: "Cloud Storage",
    icon: Cloud,
    path: "/dashboard/cloud-storage",
    roles: ["advocate"]
  },
  {
    title: "Time Tracker",
    icon: Clock,
    path: "/dashboard/time-logs",
    roles: ["advocate"]
  },
  {
    title: "Expenses",
    icon: DollarSign,
    path: "/dashboard/expense-tracker",
    roles: ["advocate"]
  },

  // Law Firm/Company specific items
  {
    title: "Manage Cases",
    icon: Briefcase,
    path: "/dashboard/assigned-cases",
    roles: ["company"]
  },
  {
    title: "Assign Lawyers",
    icon: UserPlus,
    path: "/dashboard/case-assignment",
    roles: ["company"]
  },
  {
    title: "Client Intake Forms",
    icon: FileUp,
    path: "/dashboard/client-intake",
    roles: ["company"]
  },
  {
    title: "Trust Accounting",
    icon: Calculator,
    path: "/dashboard/trust-accounting",
    roles: ["company"]
  },
  {
    title: "Payroll",
    icon: Banknote,
    path: "/dashboard/payroll",
    roles: ["company"]
  },
  {
    title: "Team Management",
    icon: Users,
    path: "/dashboard/team-management",
    roles: ["company"]
  },
  {
    title: "Reports & Analytics",
    icon: BarChart3,
    path: "/dashboard/analytics",
    roles: ["company"]
  },
  {
    title: "Subscription Plan",
    icon: CreditCard,
    path: "/dashboard/subscription",
    roles: ["company"]
  },
  {
    title: "Bulk Case Updates",
    icon: FileUp,
    path: "/dashboard/bulk-updates",
    roles: ["company"]
  },
  {
    title: "AI Scenario Guidance",
    icon: Bot,
    path: "/dashboard/firm-ai-scenario",
    roles: ["company"]
  },
  {
    title: "Firm Recordings",
    icon: FileText,
    path: "/dashboard/firm-recordings",
    roles: ["company"]
  },
  {
    title: "Excel Data Upload",
    icon: FileUp,
    path: "/dashboard/firm-excel",
    roles: ["company"]
  },
  {
    title: "Translation Tools",
    icon: FileText,
    path: "/dashboard/firm-translation",
    roles: ["company"]
  },

  // Client specific items - rearranged as requested
  {
    title: "My Cases",
    icon: Briefcase,
    path: "/dashboard/my-cases",
    roles: ["client"]
  },
  {
    title: "My Lawyer",
    icon: UserCheck,
    path: "/dashboard/assigned-advocate",
    roles: ["client"]
  },
  {
    title: "Meeting Access",
    icon: FileText,
    path: "/dashboard/client-meetings",
    roles: ["client"]
  },
  {
    title: "Hearings",
    icon: Calendar,
    path: "/dashboard/client-hearings",
    roles: ["client"]
  },
  {
    title: "Case Status Updates",
    icon: Activity,
    path: "/dashboard/case-status",
    roles: ["client"]
  },
  {
    title: "Document Upload",
    icon: FileUp,
    path: "/dashboard/document-upload",
    roles: ["client"]
  },
  {
    title: "Document Translation",
    icon: FileText,
    path: "/dashboard/client-translation",
    roles: ["client"]
  },
  {
    title: "Fee Calculation",
    icon: Calculator,
    path: "/dashboard/client-fee-calculator",
    roles: ["client"]
  },
  {
    title: "E-Sign Documents",
    icon: FileSignature,
    path: "/dashboard/e-sign",
    roles: ["client"]
  },

  // Cloud Storage - available to all roles
  {
    title: "Cloud Storage",
    icon: Cloud,
    path: "/dashboard/cloud-storage",
    roles: ["super_admin", "company", "advocate", "client"]
  }
];
