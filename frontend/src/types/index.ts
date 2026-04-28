export interface Monitor {
  id: string | number;
  user_id?: string | number;
  name: string;
  url: string;
  path?: string | null;
  method: "GET" | "HEAD" | "POST";
  body?: string | null;
  interval_mins: number;
  is_active: boolean;
  last_status: "up" | "down" | "unknown" | null;
  last_checked?: string | null;
  last_response_time?: number | null;
  uptime_pct?: string | number | null;
  notify_down: boolean;
  notify_up: boolean;
  incident_start?: string | null;
  created_at: string;
  history?: CheckHistory[];
}

export interface CheckHistory {
  id: string | number;
  monitor_id: string | number;
  status: "up" | "down";
  response_time?: number | null;
  error_msg?: string | null;
  checked_at: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  whatsapp?: string;
  is_verified: boolean;
  is_admin: boolean;
  is_superadmin: boolean;
  is_disabled: boolean;
  avatar?: string | null;
  monitor_limit?: number;
  monitor_count?: number;
  notify_down?: boolean;
  notify_up?: boolean;
  created_at: string;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedMessages {
  messages: ContactMessage[];
  total: number;
  unread: number;
  page: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used?: string | null;
  is_active: boolean;
  created_at: string;
}
