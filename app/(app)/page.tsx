import { requireUser } from "@/lib/auth/dal";
import { DashboardContent } from "./_components/dashboard-content";

export default async function DashboardPage() {
  const user = await requireUser();
  return <DashboardContent name={user.name} />;
}
