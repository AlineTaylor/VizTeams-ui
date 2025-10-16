import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '../../../../shared/shared.module';
import { PicsumService } from '../../../core/services/picsum.service';
import { PageEvent } from '@angular/material/paginator';
import { MemberService } from '../../../core/services/member.service';
import { TeamService } from '../../../core/services/team.service';
import { MEMBER_TITLE_OPTIONS } from '../../../../shared/titles.constants';

interface AddMemberData {
  teamId: string;
  member?: any;
  teams: { _id?: string; teamName: string }[];
}

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.css'],
})
export class AddMemberDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);
  private picsumService = inject(PicsumService);
  private memberService = inject(MemberService);
  private teamService = inject(TeamService);
  data = inject<AddMemberData>(MAT_DIALOG_DATA);

  // ✅ Signals
  photos = signal<any[]>([]);
  page = signal(0);
  pageSize = 12;
  totalPhotos = signal(0);
  selectedAvatar = signal<string>('');

  // ✅ Detect Edit Mode
  isEditMode = computed(() => !!this.data?.member);

  // ✅ Form setup
  form = this.fb.group({
    teamId: [this.data?.teamId || '', Validators.required],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    title: ['', Validators.required],
    avatarUrl: [''],
  });

  titleOptions = MEMBER_TITLE_OPTIONS;

  ngOnInit() {
    this.loadPhotos();

    // ✅ Prefill values if editing an existing member
    if (this.isEditMode()) {
      const member = this.data.member;
      const [firstName, lastName] = (member.name || '').split(' ');
      this.form.patchValue({
        firstName,
        lastName,
        title: member.title || '',
        avatarUrl: member.avatarUrl || '',
      });
      this.selectedAvatar.set(member.avatarUrl || '');
    }
  }

  // ✅ Load Picsum images
  loadPhotos() {
    this.picsumService.getPhotos().subscribe({
      next: (res) => {
        this.totalPhotos.set(res.length);
        const start = this.page() * this.pageSize;
        this.photos.set(res.slice(start, start + this.pageSize));
      },
      error: (err) => console.error('Error fetching Picsum photos:', err),
    });
  }

  onPageChange(event: PageEvent) {
    this.page.set(event.pageIndex);
    this.pageSize = event.pageSize;
    this.loadPhotos();
  }

  selectAvatar(photoUrl: string) {
    this.selectedAvatar.set(photoUrl);
    this.form.patchValue({ avatarUrl: photoUrl });
  }

  getSelectedAvatar() {
    return this.selectedAvatar() || this.form.value.avatarUrl || '';
  }

  // ✅ Unified Submit for Add / Edit
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, lastName, title, teamId } = this.form.value;
    const avatarUrl = this.getSelectedAvatar();

    const member = {
      firstName: firstName!.trim(),
      lastName: lastName!.trim(),
      title: title!,
      avatarUrl: avatarUrl.trim(),
    };

    if (this.isEditMode()) {
      // ✅ Persist member update to backend
      const memberId = this.data.member._id!;
      this.memberService.updateMember(teamId!, memberId, member).subscribe({
        next: (res) => {
          console.log('✅ Member updated on backend:', res);
          this.teamService.loadTeams(); // reload teams to reflect update
          this.dialogRef.close(res);
        },
        error: (err) => {
          console.error('❌ Failed to update member:', err);
        },
      });
    } else {
      // ✅ Add new member
      this.memberService.addMember(teamId!, member).subscribe({
        next: (res) => {
          console.log('✅ Member added:', res);
          this.teamService.loadTeams();
          this.dialogRef.close(res);
        },
        error: (err) => {
          console.error('❌ Failed to add member:', err);
        },
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
