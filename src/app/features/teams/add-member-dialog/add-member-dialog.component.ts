import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '../../../../shared/shared.module';
import { PicsumService } from '../../../core/services/picsum.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MemberService } from '../../../core/services/member.service';

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

  // ✅ Added debug logging for selected photo + form sync
  selectPhoto(url: string): void {
    this.selectedPhoto.set(url);
    this.form.patchValue({ avatarUrl: url }, { emitEvent: true });
    console.log('🖼️ Selected photo URL:', url);
    console.log('📋 Form avatarUrl value:', this.form.value.avatarUrl);
  }

  handlePageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
  }

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
    const avatarUrl = value.avatarUrl?.trim() || this.getSelectedAvatar();

    // 🧩 Debug log chain
    console.log('🚀 Submitting form data:', value);
    console.log('👤 Member name:', name);
    console.log('🖼️ Final avatar URL being sent:', avatarUrl);

    const member = {
      name,
      title: value.title,
      avatarUrl,
    };

    console.log('📦 Full member object before API call:', member);

    this.memberService.addMember(value.teamId!, member).subscribe({
      next: (res: any) => {
        const updatedTeam = res.team || res;
        console.log('✅ Member saved successfully! Updated team:', updatedTeam);
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
