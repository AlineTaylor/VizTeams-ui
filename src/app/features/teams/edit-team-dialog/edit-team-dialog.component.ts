import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../../shared/shared.module';

interface EditTeamData { id: string; teamName: string; description: string }

@Component({
  selector: 'app-edit-team-dialog',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './edit-team-dialog.component.html',
  styleUrl: './edit-team-dialog.component.css'
})
export class EditTeamDialogComponent {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<EditTeamDialogComponent>);
  data = inject<EditTeamData>(MAT_DIALOG_DATA);

  form = this.fb.group({
    teamName: [this.data.teamName || '', [Validators.required, Validators.minLength(2)]],
    description: [this.data.description || '']
  });

  cancel() { this.ref.close(); }
  submit() {
    if (this.form.invalid) return;
    this.ref.close({ id: this.data.id, ...this.form.value });
  }
}
