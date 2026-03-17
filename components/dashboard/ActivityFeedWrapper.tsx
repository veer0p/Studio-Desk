import { getRecentActivity } from "@/lib/dashboard-server";
import { ActivityFeed } from "./ActivityFeed";

export async function ActivityFeedWrapper({ studioId }: { studioId: string }) {
  const activities = await getRecentActivity(studioId);
  
  return <ActivityFeed activities={activities || []} />;
}
