import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    user: User;
    token: TokenData;
  };
}

export interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: string;
}