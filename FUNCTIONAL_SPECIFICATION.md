# Legal Practice Management System - Functional Specification Document

## Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Access Levels](#user-roles--access-levels)
3. [Core Modules & Features](#core-modules--features)
4. [Role-Specific Functionality](#role-specific-functionality)
5. [Technical Architecture](#technical-architecture)
6. [Database Schema](#database-schema)
7. [Integration Features](#integration-features)
8. [Security & Compliance](#security--compliance)

---

## System Overview

### Application Purpose
A comprehensive legal practice management system designed to streamline law firm operations, case management, client relations, and administrative tasks across multiple user roles.

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Storage**: Supabase Storage with Cloud Integration
- **Payment Processing**: Razorpay Integration
- **Document Management**: Google Drive & OneDrive Integration
- **AI Features**: Document Analysis, Case Summary, Compliance Checking

---

## User Roles & Access Levels

### 1. Super Admin
- **Primary Function**: System administration and oversight
- **Access Level**: Full system access across all modules
- **Key Responsibilities**: User management, system configuration, security oversight

### 2. Advocate (Individual Lawyer)
- **Primary Function**: Individual legal practice management
- **Access Level**: Personal case management and client interaction
- **Key Responsibilities**: Case handling, client communication, time tracking

### 3. Company (Law Firm)
- **Primary Function**: Law firm management and oversight
- **Access Level**: Team management and firm-wide operations
- **Key Responsibilities**: Team coordination, bulk operations, firm analytics

### 4. Client
- **Primary Function**: Access to personal case information
- **Access Level**: Limited to own case data and lawyer communication
- **Key Responsibilities**: Document submission, case status monitoring

---

## Core Modules & Features

### 1. Authentication & User Management
- **Multi-role authentication system**
- **Profile management with role-specific data**
- **Security event logging**
- **Session management**

### 2. Dashboard System
- **Role-specific dashboards**
- **Real-time data updates**
- **Key metrics and KPIs**
- **Quick access to frequently used features**

### 3. Case Management
- **Case creation and tracking**
- **Status management (active, draft, closed, pending)**
- **Case assignment and delegation**
- **Case updates and history tracking**
- **Bulk case operations**

### 4. Document Management
- **Document upload and storage**
- **Version control**
- **Category-based organization**
- **Cloud storage integration (Google Drive, OneDrive)**
- **Document sharing and permissions**
- **E-signature functionality**

### 5. Calendar & Scheduling
- **Court calendar management**
- **Hearing scheduling**
- **Meeting management**
- **Appointment tracking**
- **Cause list integration**

### 6. Financial Management
- **Invoice generation and management**
- **Transaction tracking**
- **Expense management**
- **Payment processing (Razorpay)**
- **Trust accounting**
- **Subscription management**

### 7. Time Tracking
- **Time entry and tracking**
- **Project-based time allocation**
- **Billable hours calculation**
- **Productivity analytics**

### 8. Communication
- **Client messaging system**
- **Meeting recordings**
- **Client communication logs**
- **Notification system**

### 9. AI-Powered Tools
- **Document analysis**
- **Case summary generation**
- **Compliance checking**
- **Scenario guidance**
- **Translation services**

### 10. Reporting & Analytics
- **Case analytics**
- **Financial reports**
- **Time tracking reports**
- **System usage analytics**
- **Performance metrics**

---

## Role-Specific Functionality

### Super Admin Features

#### System Administration
- **User Management**: Create, modify, and delete user accounts
- **Role Assignment**: Assign and modify user roles
- **System Settings**: Configure system-wide settings
- **Security Center**: Monitor security events and system access
- **System Logs**: View comprehensive system activity logs
- **Database Management**: Backup and maintenance operations

#### Advanced Management
- **Project Management**: Oversee all cases across the system
- **Agency Management**: Manage external agencies and partnerships
- **Claims Management**: Handle system-wide claims and disputes
- **Payment Settings**: Configure payment gateways and methods
- **Subscription Plans**: Manage subscription tiers and features

#### AI Tools (Admin Level)
- **Case Analyzer**: Advanced case analysis across all cases
- **Compliance Monitor**: System-wide compliance checking
- **Case Summary**: Generate summaries for any case in the system

#### Reporting & Analytics
- **System Reports**: Comprehensive system usage and performance reports
- **Financial Analytics**: System-wide financial performance metrics
- **User Activity Reports**: Track user engagement and system utilization

### Advocate (Individual Lawyer) Features

#### Document Management
- **Templates**: Access to legal document templates
- **Document Analysis**: AI-powered document review and analysis
- **Drafting & Translation**: Document creation and translation tools
- **E-Sign Documents**: Electronic signature management for client documents

#### Case Management
- **My Cases**: Personal case portfolio management
- **Meeting Recordings**: Record and manage client meetings
- **Case Status Tracking**: Monitor and update case progress

#### Client Relations
- **My Clients**: Client portfolio and relationship management
- **Client Communication**: Direct messaging and meeting scheduling

#### Court Management
- **Court Calendar**: Personal court schedule management
- **View Hearings**: Upcoming hearing tracker and management

#### AI Tools (Advocate Level)
- **Case Analyzer**: AI-powered analysis of personal cases
- **Compliance**: Compliance checking for individual cases
- **Case Summary**: Generate case summaries for personal cases
- **Scenario Guidance**: AI guidance for legal scenarios

#### Financial Management
- **Subscriptions**: Personal subscription management
- **Transactions**: Personal transaction history
- **Invoices**: Client billing and invoice management
- **Expenses**: Personal expense tracking and management

#### Productivity Tools
- **Fee Calculator**: Court fee and legal fee calculations
- **Time Tracker**: Personal time tracking and billable hours
- **Cloud Storage**: Personal cloud storage integration

### Company (Law Firm) Features

#### Team Management
- **Manage Cases**: Oversee all firm cases
- **Assign Lawyers**: Allocate cases to team members
- **Team Management**: Manage firm personnel and roles
- **Bulk Case Updates**: Mass updates to multiple cases

#### Client Operations
- **Client Intake Forms**: Standardized client onboarding
- **Reports & Analytics**: Firm-wide performance analytics
- **Subscription Plan**: Firm subscription management

#### Financial Operations
- **Trust Accounting**: Client trust fund management
- **Payroll**: Employee payroll management
- **Financial Reporting**: Firm financial analysis

#### Advanced Tools
- **AI Scenario Guidance**: Firm-wide AI guidance system
- **Firm Recordings**: Centralized meeting recording management
- **Excel Data Upload**: Bulk data import capabilities
- **Translation Tools**: Firm-wide translation services

#### Court Management
- **Cause List**: Court cause list management and tracking

### Client Features

#### Case Access
- **My Cases**: View assigned cases and their progress
- **Case Status Updates**: Real-time updates on case developments
- **My Lawyer**: Information about assigned legal representation

#### Communication
- **Meeting Access**: Access to scheduled meetings and recordings
- **Hearings**: View upcoming court hearings and schedules

#### Document Management
- **Document Upload**: Submit documents to assigned cases
- **Document Translation**: Translation services for submitted documents
- **E-Sign Documents**: Sign legal documents electronically

#### Cloud Integration
- **Cloud Storage**: Personal document storage and access

---

## Technical Architecture

### Frontend Architecture
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development environment
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **React Router**: Client-side routing with role-based access control
- **TanStack Query**: Data fetching and caching

### Backend Architecture
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Relational database with advanced features
- **Row Level Security (RLS)**: Database-level security policies
- **Real-time Subscriptions**: Live data updates
- **Edge Functions**: Serverless functions for custom logic

### Authentication & Security
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permission system
- **Row Level Security**: Database-level data protection
- **Security Event Logging**: Comprehensive audit trail

---

## Database Schema

### Core Tables

#### Users & Authentication
- **profiles**: User profile information with role-based access
- **advocates**: Lawyer-specific information (bar number, specialization, rates)
- **clients**: Client-specific information (preferences, emergency contacts)
- **companies**: Law firm information (registration, address, description)

#### Case Management
- **projects**: Case/project information with status tracking
- **case_updates**: Case update history and client communications
- **documents**: Document metadata with cloud storage references
- **court_calendar**: Court dates and hearing schedules
- **hearings**: Detailed hearing information and outcomes

#### Financial Management
- **invoices**: Client billing and invoice management
- **transactions**: Payment processing and transaction history
- **expenses**: Expense tracking and categorization
- **subscription_plans**: Available subscription tiers
- **user_subscriptions**: Individual subscription tracking
- **subscription_invoices**: Subscription billing history

#### System Management
- **templates**: Legal document templates
- **time_tracker**: Time entry and tracking
- **meeting_recordings**: Meeting audio/video recordings
- **system_logs**: System activity and audit logs
- **security_events**: Security-related events and monitoring
- **system_settings**: Configurable system parameters

#### Specialized Features
- **cause_list**: Court cause list entries
- **cause_list_uploads**: Cause list file upload tracking
- **e_sign_documents**: Electronic signature document management
- **sync_status**: Data synchronization status tracking
- **system_backups**: System backup management

---

## Integration Features

### Cloud Storage Integration
- **Google Drive**: Document storage and sharing
- **OneDrive**: Alternative cloud storage option
- **Automatic Sync**: Real-time document synchronization
- **Permission Management**: Access control for shared documents

### Payment Processing
- **Razorpay Integration**: Secure payment processing
- **Subscription Management**: Automated billing cycles
- **Invoice Generation**: Automated invoice creation
- **Payment Tracking**: Real-time payment status updates

### AI Services
- **AI Model**: Google Flan-T5-Large via Hugging Face Inference API
- **Edge Function**: `ai-legal-assistant` - Handles all AI-powered legal analysis
- **Document Analysis**: Intelligent document processing
- **Case Summary**: Automated case summary generation
- **Compliance Checking**: Legal compliance verification
- **Translation Services**: Multi-language document translation
- **Scenario Guidance**: AI-powered legal scenario recommendations

### Analytics & Tracking
- **Microsoft Clarity**: User behavior analytics and session recording
  - Project ID: `ui6g5d67dv`
  - Heatmaps, session recordings, and user journey tracking

### Court System Integration
- **Cause List Processing**: Automated court schedule parsing
- **Calendar Synchronization**: Court date integration
- **Hearing Management**: Automated hearing updates

---

## Security & Compliance

### Data Protection
- **Encryption**: End-to-end data encryption
- **Secure Storage**: Encrypted database storage
- **Access Controls**: Role-based data access
- **Audit Trails**: Comprehensive activity logging

### Legal Compliance
- **Confidentiality**: Client-attorney privilege protection
- **Data Retention**: Configurable data retention policies
- **Backup Systems**: Automated backup and recovery
- **Security Monitoring**: Real-time security event detection

### User Security
- **Multi-factor Authentication**: Enhanced login security
- **Session Management**: Secure session handling
- **Password Policies**: Enforced password requirements
- **Account Lockout**: Automated threat protection

---

## System Capabilities Summary

### Multi-tenancy Support
- Supports individual lawyers, law firms, and clients
- Role-based access control with granular permissions
- Scalable architecture for growing organizations

### Real-time Features
- Live data updates across all modules
- Real-time notifications and alerts
- Collaborative document editing capabilities

### Mobile Responsiveness
- Fully responsive design for all device types
- Touch-optimized interface for mobile usage
- Offline capability for critical features

### Scalability & Performance
- Cloud-native architecture with auto-scaling
- Optimized database queries with caching
- CDN integration for global performance

### Customization Options
- Configurable workflows and processes
- Custom fields and data structures
- Branding and white-label capabilities

---

## Recent Updates

### December 2024
- **AI Model Update**: Switched to Google Flan-T5-Large model for improved availability and reliability
- **Analytics Integration**: Added Microsoft Clarity for user behavior analytics (Project ID: `ui6g5d67dv`)
- **Edge Function**: Updated `ai-legal-assistant` with improved error handling and logging

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | Dec 23, 2024 | Added AI model details, Microsoft Clarity integration, version history |
| 1.0.0 | Initial | Initial FSD creation |

---

*Last Updated: December 23, 2024*

*This functional specification document covers all implemented features and modules across all user roles in the Legal Practice Management System.*