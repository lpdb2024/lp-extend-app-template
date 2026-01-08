export class UserData {
  uid?: string;
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  active: boolean;
  created_by: string;
  updated_by: string;
  created_at: number;
  updated_at: number;
  isLPA?: boolean;
} 

export class UsersDocument {
  static collectionName = 'users';
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  active: boolean;
  created_by: string;
  updated_by: string;
  created_at: number;
  updated_at: number;
}

export class CredentialsDocument {
  static collectionName = 'credentials';
  account_id: string;
  [key: string]: any
}
