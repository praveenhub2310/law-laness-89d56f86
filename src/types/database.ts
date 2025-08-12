// Database type definitions for better type safety

export interface Project {
  id: string;
  case_number: string;
  title: string;
  description?: string;
  client_id?: string;
  lawyer_id?: string;
  status: 'active' | 'draft' | 'closed' | 'pending';
  start_date?: string;
  end_date?: string;
  budget?: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'super_admin' | 'advocate' | 'company' | 'client';
  company_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Advocate {
  id: string;
  bar_number?: string;
  specialization?: string[];
  experience_years?: number;
  hourly_rate?: number;
  availability_status?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  client_type?: string;
  preferred_contact_method?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  company_name: string;
  registration_number?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  filename: string;
  title: string;
  category?: string;
  file_type?: string;
  file_size?: string;
  case_id?: string;
  uploaded_by?: string;
  status: 'active' | 'archived' | 'deleted';
  confidential?: boolean;
  upload_date?: string;
  last_modified?: string;
  created_at: string;
  version?: string;
  cloud_provider?: string;
  cloud_file_id?: string;
}