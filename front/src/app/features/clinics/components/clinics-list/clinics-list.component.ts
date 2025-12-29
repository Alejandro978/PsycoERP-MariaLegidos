import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  TrackByFunction,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Clinic } from '../../models/clinic.model';
import { ClinicCardComponent } from '../clinic-card/clinic-card.component';

@Component({
  selector: 'app-clinics-list',
  standalone: true,
  templateUrl: './clinics-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ClinicCardComponent],
})
export class ClinicsListComponent {
  @Input({ required: true }) clinics!: Clinic[];
  @Input() trackByFn?: TrackByFunction<Clinic>;
  @Input() isDeletedView: boolean = false;

  @Output() onEdit = new EventEmitter<Clinic>();
  @Output() onDelete = new EventEmitter<Clinic>();
  @Output() onRestore = new EventEmitter<Clinic>();
}