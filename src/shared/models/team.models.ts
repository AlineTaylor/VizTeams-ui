// TODO Update to match provided dataset
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}
