export type AppRole = 'admin' | 'alumni' | 'student' | 'faculty';
export type MentorshipStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  graduation_year?: number;
  department?: string;
  phone?: string;
  linkedin_url?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

// Public profile without sensitive PII (email, phone)
export interface ProfilePublic {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  graduation_year?: number;
  department?: string;
  linkedin_url?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface AlumniDetails {
  id: string;
  user_id: string;
  current_company?: string;
  job_title?: string;
  industry?: string;
  years_of_experience: number;
  skills: string[];
  is_mentor_available: boolean;
  mentorship_areas: string[];
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface MentorshipRequest {
  id: string;
  student_id: string;
  alumni_id: string;
  message?: string;
  status: MentorshipStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  event_type: string;
  created_by?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
}

export interface AlumniWithProfile extends AlumniDetails {
  profiles: ProfilePublic;
}
