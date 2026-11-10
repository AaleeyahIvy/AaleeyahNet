import type { Metadata } from "next";
import AdminPanel from "./AdminPanel";

export const metadata: Metadata = {
  title: "Admin · Aaleeyah.net",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}
