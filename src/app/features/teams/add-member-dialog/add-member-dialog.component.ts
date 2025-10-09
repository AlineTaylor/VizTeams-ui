import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '../../../../shared/shared.module';
import { PicsumService } from '../../../core/services/picsum.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MemberService } from '../../../core/services/member.service';

/** Dialog data passed in when opening Add Member dialog */
interface AddMemberData {
  teamId: string;
  teams: { _id?: string; teamName: string }[];
}

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, CommonModule, MatPaginatorModule],
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.css'],
})
export class AddMemberDialogComponent implements OnInit {
  // 🔧 Dependencies
  private fb = inject(FormBuilder);
  private picsumService = inject(PicsumService);
  private memberService = inject(MemberService);

  dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);
  data = inject<AddMemberData>(MAT_DIALOG_DATA);

  // 📋 Title dropdown options
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

  photos = signal<any[]>([]);
  selectedPhoto = signal<string | null>(null);
  currentPage = signal(0);
  readonly pageSize = 5;

  pagedPhotos = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.photos().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.picsumService.getPhotos().subscribe({
      next: (photos) => {
        console.log('📸 Picsum API Response:', photos);
        console.log('✅ Total photos:', photos.length);
        this.photos.set(photos);
      },
      error: (err) => console.error('❌ Error fetching Picsum photos:', err),
    });
  }

  selectPhoto(url: string): void {
    this.selectedPhoto.set(url);
    this.form.patchValue({ avatarUrl: url });
  }

  handlePageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
  }

  // ✅ Use Picsum images only, fallback to first photo
  getSelectedAvatar(): string {
    return this.selectedPhoto() || this.photos()[0]?.download_url || '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const value = this.form.value;
    const name = `${value.firstName!.trim()} ${value.lastName!.trim()}`.trim();

    const member = {
      name,
      title: value.title,
      avatarUrl: value.avatarUrl?.trim() || this.getSelectedAvatar(),
    };

    this.memberService.addMember(value.teamId!, member).subscribe({
      next: (res: any) => {
        const updatedTeam = res.team || res;
        console.log('✅ Member saved:', updatedTeam);

        this.dialogRef.close(updatedTeam);
        this.submitting = false;
      },
      error: (err) => {
        console.error('❌ Error saving member:', err);
        this.submitting = false;
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
