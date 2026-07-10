export interface AdminUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}
