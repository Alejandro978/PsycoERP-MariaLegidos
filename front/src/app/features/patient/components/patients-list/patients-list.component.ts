import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  TrackByFunction,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../../../shared/models/patient.model';
import { PatientCardComponent } from '../patient-card/patient-card.component';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  templateUrl: './patients-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PatientCardComponent],
})
export class PatientsListComponent {
  @Input({ required: true }) patients!: Patient[];
  @Input() trackByFn?: TrackByFunction<Patient>;
  @Input() isDeletedView: boolean = false;

  @Output() onEdit = new EventEmitter<Patient>();
  @Output() onDelete = new EventEmitter<Patient>();
  @Output() onRestore = new EventEmitter<Patient>();
  @Output() onViewDetail = new EventEmitter<Patient>();
}