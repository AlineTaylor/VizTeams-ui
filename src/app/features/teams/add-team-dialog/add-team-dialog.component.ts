import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-add-team-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './add-team-dialog.component.html',
  styleUrl: './add-team-dialog.component.css',
})
export class AddTeamDialogComponent {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  constructor(private dialogRef: MatDialogRef<AddTeamDialogComponent>) {}

  save() {
    if (this.form.valid) {
      this.dialogRef.close({ name: this.form.value.name });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
