// src/components/profile/ProfileTab.tsx
import { ProfileForm } from "./ProfileForm";

interface ProfileTabProps {
  initialData: any;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ initialData }) => {
  return <ProfileForm initialData={initialData} />;
};