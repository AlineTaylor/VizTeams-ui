export interface TeamMember {
  _id?: string;
  name: string;
  title: string;
  avatarUrl?: string;
}

export interface Team {
  _id?: string;
  teamName: string;
  description: string;
  members: TeamMember[];
}
