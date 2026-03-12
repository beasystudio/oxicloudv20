export interface Project {
  id: string;
  user_id: string;
  project_number: string;
  name: string;
  status: string;
  office: string | null;
  code: string | null;
  client_contact: string | null;
  project_type: string | null;
  overview: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  project_id: string;
  firm_name: string;
  contact_person: string;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  contact_type: string;
  address: string | null;
  correspondence_notes: string | null;
  company_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  phase_name: string;
  is_completed: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}
