export interface Invitation {
  id: number;
  token: string;
  status: 'pending' | 'used' | 'expired';
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface InvitationFilters {
  estado?: 'pending' | 'used' | 'expired' | '';
  fecha_desde?: string;
  fecha_hasta?: string;
  page: number;
  limit: number;
}

export interface InvitationResponse {
  data: Invitation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GenerateInvitationResponse {
  invitationLink: string;
  token: string;
  expires_at: string;
}
