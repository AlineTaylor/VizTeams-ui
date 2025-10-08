import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '../../../../shared/shared.module';

interface AddMemberData {
  teamId: string;
}

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.css'
})
export class AddMemberDialogComponent {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);
  data = inject<AddMemberData>(MAT_DIALOG_DATA);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    title: ['', [Validators.required, Validators.minLength(2)]],
    avatarUrl: ['']
  });

  submitting = false;

  submit() {
    if (this.form.invalid) return;
    this.submitting = true;
    // Simulate slight delay / hook for future async avatar validation
    const value = this.form.value;
    this.dialogRef.close({
      teamId: this.data.teamId,
      member: {
        name: value.name!.trim(),
        title: value.title!.trim(),
        avatarUrl: value.avatarUrl?.trim() || undefined
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
