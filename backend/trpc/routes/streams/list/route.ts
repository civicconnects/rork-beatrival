import { publicProcedure } from "@/backend/trpc/create-context";

// Shared storage with create route
export const activeStreams = new Map<string, any>();

// Cleanup inactive streams (older than 1 hour)
const cleanupInactiveStreams = () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  let cleanedCount = 0;
  
  for (const [channelName, stream] of activeStreams.entries()) {
    if (stream.lastActivity && stream.lastActivity < oneHourAgo) {
      activeStreams.delete(channelName);
      cleanedCount++;
      console.log(`🧹 Cleaned up inactive stream: ${channelName}`);
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} inactive streams`);
  }
};

// Run cleanup every 30 minutes
setInterval(cleanupInactiveStreams, 30 * 60 * 1000);

export const listStreamsProcedure = publicProcedure.query(async () => {
  // Clean up before listing
  cleanupInactiveStreams();
  
  const streams = Array.from(activeStreams.values())
    .filter(s => s.isLive)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    
  console.log(`📋 Listed ${streams.length} active streams`);
  return { streams };
});