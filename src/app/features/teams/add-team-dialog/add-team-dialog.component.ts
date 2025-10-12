import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-team-dialog',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './add-team-dialog.component.html',
  styleUrl: './add-team-dialog.component.css',
})
export class AddTeamDialogComponent {
  form = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl<string>(''), // NEW
  });

  constructor(private dialogRef: MatDialogRef<AddTeamDialogComponent>) {}

save() {
  if (!this.form.valid) {
    this.form.markAllAsTouched();
    return;
  }
  this.dialogRef.close({
    teamName: this.form.value.name,
    description: this.form.value.description ?? ''
  });
}

cancel() {
  this.dialogRef.close();
  }
}
