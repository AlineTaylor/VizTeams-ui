import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '../../../../shared/shared.module';

interface AddMemberData {
  teamId: string;
  teams: { _id?: string; teamName: string }[];
}

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.css',
})
export class AddMemberDialogComponent {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);
  data = inject<AddMemberData>(MAT_DIALOG_DATA);

  titleOptions: string[] = [
    'Software Engineer',
    'Senior Software Engineer',
    'Product Manager',
    'UX Designer',
    'QA Engineer',
  ];

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    title: ['', [Validators.required]],
    teamId: [this.data.teamId, [Validators.required]],
    avatarUrl: [''],
  });

  submitting = false;

  submit() {
    if (this.form.invalid) return;
    this.submitting = true;
    const value = this.form.value;
    const name = `${value.firstName!.trim()} ${value.lastName!.trim()}`.trim();
    this.dialogRef.close({
      teamId: value.teamId,
      member: {
        name,
        title: value.title,
        avatarUrl: value.avatarUrl?.trim() || undefined,
      },
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
