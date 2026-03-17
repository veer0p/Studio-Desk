import { getUpcomingShoots } from "@/lib/dashboard-server";
import { UpcomingShoots } from "./UpcomingShoots";

export async function UpcomingShootsWrapper({ studioId }: { studioId: string }) {
  const shoots = await getUpcomingShoots(studioId);
  
  return <UpcomingShoots shoots={shoots || []} />;
}
