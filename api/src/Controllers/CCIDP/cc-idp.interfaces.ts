import { UserData } from '../users/users.interfaces';

export class LpToken {
  static collectionName = 'lp_tokens';
  accountId: string;
  access_token?: string;
  cbOrg: string;
  cbToken: string;
  id: string;
  uid: string;
  token: string;
  accessToken?: string;
  userData: UserData;
}
