import { getAllAnnouncements } from "@/features/announcements/actions";
import AnnouncementAdminPanel from "@/features/announcements/components/AnnouncementAdminPanel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "إدارة الإعلانات - لوحة التحكم",
  description: "إدارة شريط الإعلانات العلوي للموقع",
};

export default async function AnnouncementsAdminPage() {
  const announcements = await getAllAnnouncements();

  return (
    <div className="pb-10">
      <AnnouncementAdminPanel initialAnnouncements={announcements} />
    </div>
  );
}
