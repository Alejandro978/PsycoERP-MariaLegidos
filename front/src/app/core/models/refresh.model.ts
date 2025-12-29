import { TokenData } from './login.model';

export interface RefreshResponse {
  message: string;
  data: TokenData;
}