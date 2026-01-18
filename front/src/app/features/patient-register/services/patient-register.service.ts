import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TokenValidation,
  PatientRegistration,
  RegistrationResponse,
} from '../models/patient-register.model';

@Injectable({
  providedIn: 'root',
})
export class PatientRegisterService {
  private http = inject(HttpClient);

  private readonly invitationsUrl = '/invitations';
  private readonly patientsUrl = '/patients';

  private get httpOptions() {
    return {
      headers: new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
      responseType: 'json' as const,
    };
  }

  validateToken(token: string): Observable<TokenValidation> {
    return this.http.get<TokenValidation>(
      `${this.invitationsUrl}/validate/${token}`,
      this.httpOptions
    );
  }

  registerPatient(
    token: string,
    data: PatientRegistration
  ): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(
      `${this.patientsUrl}/register/${token}`,
      data,
      this.httpOptions
    );
  }
}
