
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QueryClient from './QueryClient';
import Index from './pages/Index';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import RoleGuard from './components/RoleGuard';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRouter from './components/DashboardRouter';
import AdminDashboard from './pages/AdminDashboard';
import FirmDashboard from './pages/FirmDashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import CaseAnalyser from './pages/ai-tools/CaseAnalyser';
import Compliance from './pages/ai-tools/Compliance';
import CaseSummary from './pages/ai-tools/CaseSummary';
import ProjectsManagement from './pages/projects/ProjectsManagement';
import AllCases from './pages/projects/AllCases';
import ActiveCases from './pages/projects/ActiveCases';
import ClosedCases from './pages/projects/ClosedCases';
import Hearings from './pages/appointments/Hearings';
import Meetings from './pages/appointments/Meetings';
import CourtDates from './pages/appointments/CourtDates';
import Agencies from './pages/Agencies';
import Documents from './pages/Documents';
import ImportantLinks from './pages/ImportantLinks';
import Invoices from './pages/Invoices';
import Messages from './pages/Messages';
import Parties from './pages/Parties';
import Transactions from './pages/Transactions';
import HumanResources from './pages/HumanResources';
import AccountsManagement from './pages/AccountsManagement';
import ManageClaims from './pages/ManageClaims';
import SystemLog from './pages/SystemLog';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MyCases from './pages/MyCases';
import AssignedCases from './pages/AssignedCases';
import CloudStorage from './pages/CloudStorage';
import TeamManagement from './pages/TeamManagement';

import CourtCalendar from './pages/CourtCalendar';
import TimeTracker from './pages/TimeTracker';
import ExpenseTracker from './pages/ExpenseTracker';
import Profile from './pages/Profile';
import CaseAssignment from './pages/CaseAssignment';
import ClientIntake from './pages/ClientIntake';
import TrustAccounting from './pages/TrustAccounting';
import Payroll from './pages/Payroll';
import Analytics from './pages/Analytics';
import Subscription from './pages/Subscription';
import UserManagement from './pages/UserManagement';
import SystemSettings from './pages/SystemSettings';
import SecurityCenter from './pages/SecurityCenter';
import DatabaseManagement from './pages/DatabaseManagement';
import InvoicesPayments from './pages/InvoicesPayments';
import DocumentUpload from './pages/DocumentUpload';
import ESign from './pages/ESign';
import AssignedAdvocate from './pages/AssignedAdvocate';
import AiScenarioGuidance from './pages/AiScenarioGuidance';
import CourtCauseList from './pages/CourtCauseList';
import DraftingTool from './pages/DraftingTool';
import DocumentTranslation from './pages/DocumentTranslation';
import CourtFeeCalculator from './pages/CourtFeeCalculator';
import DocumentAnalysis from './pages/DocumentAnalysis';
import ViewHearings from './pages/ViewHearings';
import MeetingRecordings from './pages/MeetingRecordings';
import ExcelUpload from './pages/ExcelUpload';
import DraftingTranslation from './pages/DraftingTranslation';
import BulkCaseUpdates from './pages/BulkCaseUpdates';
import FirmAiScenario from './pages/FirmAiScenario';
import ClientCaseStatus from './pages/ClientCaseStatus';
import ClientHearings from './pages/ClientHearings';
import ClientMeetings from './pages/ClientMeetings';
import CaseDetails from './pages/CaseDetails';
import Schedule from './pages/Schedule';

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Dashboard Routes with Layout - Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
          
          {/* Role-specific dashboard routes */}
          <Route path="/admin-dashboard" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><AdminDashboard /></DashboardLayout></RoleGuard>} />
          <Route path="/firm-dashboard" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><FirmDashboard /></DashboardLayout></RoleGuard>} />
          <Route path="/lawyer-dashboard" element={<RoleGuard allowedRoles={['advocate']}><DashboardLayout><LawyerDashboard /></DashboardLayout></RoleGuard>} />
          <Route path="/client-dashboard" element={<RoleGuard allowedRoles={['client']}><DashboardLayout><ClientDashboard /></DashboardLayout></RoleGuard>} />
          
          {/* Super Admin Routes */}
          <Route path="/ai-tools/case-analyser" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><CaseAnalyser /></DashboardLayout></RoleGuard>} />
          <Route path="/ai-tools/compliance" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><Compliance /></DashboardLayout></RoleGuard>} />
          <Route path="/ai-tools/case-summary" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><CaseSummary /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/projects" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><ProjectsManagement /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/projects/cases" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><AllCases /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/projects/active" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><ActiveCases /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/projects/closed" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><ClosedCases /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/appointments/hearings" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><Hearings /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/appointments/meetings" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><Meetings /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/appointments/court" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><CourtDates /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/agencies" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><Agencies /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/documents" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><Documents /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/links" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><ImportantLinks /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/invoices" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><Invoices /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/messages" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><Messages /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/parties" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><Parties /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/transactions" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><Transactions /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/hr" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><HumanResources /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/accounts" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><AccountsManagement /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/claims" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><ManageClaims /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/logs" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><SystemLog /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/reports" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><Reports /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/settings" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><Settings /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/ai-scenario" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><AiScenarioGuidance /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/cause-list" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><CourtCauseList /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/drafting-tool" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><DraftingTool /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/translation" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><DocumentTranslation /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/fee-calculator" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><CourtFeeCalculator /></DashboardLayout></RoleGuard>} />
          
          {/* Admin Module Routes */}
          <Route path="/user-management" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><UserManagement /></DashboardLayout></RoleGuard>} />
          <Route path="/system-settings" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><SystemSettings /></DashboardLayout></RoleGuard>} />
          <Route path="/system-log" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><SystemLog /></DashboardLayout></RoleGuard>} />
          <Route path="/analytics" element={<RoleGuard allowedRoles={['super_admin', 'company']}><DashboardLayout><Analytics /></DashboardLayout></RoleGuard>} />
          <Route path="/security-center" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><SecurityCenter /></DashboardLayout></RoleGuard>} />
          <Route path="/database-management" element={<RoleGuard allowedRoles={['super_admin']}><DashboardLayout><DatabaseManagement /></DashboardLayout></RoleGuard>} />
          
          {/* Lawyer/Advocate Routes */}
          <Route path="/dashboard/my-cases" element={<RoleGuard allowedRoles={['advocate', 'client']}><DashboardLayout><MyCases /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/court-calendar" element={<RoleGuard allowedRoles={['advocate']}><DashboardLayout><CourtCalendar /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/time-logs" element={<RoleGuard allowedRoles={['advocate']}><DashboardLayout><TimeTracker /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/expense-tracker" element={<RoleGuard allowedRoles={['advocate']}><DashboardLayout><ExpenseTracker /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/profile" element={<RoleGuard allowedRoles={['advocate', 'client', 'company']}><DashboardLayout><Profile /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/document-analysis" element={<RoleGuard allowedRoles={['advocate']}><DashboardLayout><DocumentAnalysis /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/hearings" element={<RoleGuard allowedRoles={['advocate']}><DashboardLayout><ViewHearings /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/recordings" element={<RoleGuard allowedRoles={['advocate']}><DashboardLayout><MeetingRecordings /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/excel-upload" element={<RoleGuard allowedRoles={['advocate']}><DashboardLayout><ExcelUpload /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/drafting-translation" element={<RoleGuard allowedRoles={['advocate']}><DashboardLayout><DraftingTranslation /></DashboardLayout></RoleGuard>} />
          
          {/* Law Firm/Company Routes */}
          <Route path="/dashboard/assigned-cases" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><AssignedCases /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/case-assignment" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><CaseAssignment /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/client-intake" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><ClientIntake /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/trust-accounting" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><TrustAccounting /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/payroll" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><Payroll /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/team-management" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><TeamManagement /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/analytics" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><Analytics /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/subscription" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><Subscription /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/bulk-updates" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><BulkCaseUpdates /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/firm-ai-scenario" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><FirmAiScenario /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/firm-recordings" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><MeetingRecordings /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/firm-excel" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><ExcelUpload /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/firm-translation" element={<RoleGuard allowedRoles={['company']}><DashboardLayout><DocumentTranslation /></DashboardLayout></RoleGuard>} />
          
          {/* Client Routes */}
          <Route path="/dashboard/payments" element={<RoleGuard allowedRoles={['client']}><DashboardLayout><InvoicesPayments /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/document-upload" element={<RoleGuard allowedRoles={['client']}><DashboardLayout><DocumentUpload /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/e-sign" element={<RoleGuard allowedRoles={['client']}><DashboardLayout><ESign /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/assigned-advocate" element={<RoleGuard allowedRoles={['client']}><DashboardLayout><AssignedAdvocate /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/case-status" element={<RoleGuard allowedRoles={['client']}><DashboardLayout><ClientCaseStatus /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/client-hearings" element={<RoleGuard allowedRoles={['client']}><DashboardLayout><ClientHearings /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/client-meetings" element={<RoleGuard allowedRoles={['client']}><DashboardLayout><ClientMeetings /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/client-excel" element={<RoleGuard allowedRoles={['client']}><DashboardLayout><ExcelUpload /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/client-translation" element={<RoleGuard allowedRoles={['client']}><DashboardLayout><DocumentTranslation /></DashboardLayout></RoleGuard>} />
          <Route path="/dashboard/client-fee-calculator" element={<RoleGuard allowedRoles={['client']}><DashboardLayout><CourtFeeCalculator /></DashboardLayout></RoleGuard>} />
          
          {/* Cloud Storage - Available to all authenticated users */}
          <Route path="/cloud-storage" element={<ProtectedRoute><DashboardLayout><CloudStorage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/case-details/:id" element={<ProtectedRoute><DashboardLayout><CaseDetails /></DashboardLayout></ProtectedRoute>} />
          <Route path="/schedule/:caseId" element={<ProtectedRoute><DashboardLayout><Schedule /></DashboardLayout></ProtectedRoute>} />
          
          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
