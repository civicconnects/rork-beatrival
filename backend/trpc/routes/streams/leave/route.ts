import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { activeStreams } from "../list/route";

export const leaveStreamProcedure = publicProcedure
  .input(
    z.object({
      channelName: z.string().min(1, "Channel name is required"),
      viewerId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const stream = activeStreams.get(input.channelName);
      
      if (stream && stream.isLive) {
        stream.viewerCount = Math.max(0, (stream.viewerCount || 0) - 1);
        stream.lastActivity = new Date().toISOString();
        
        console.log(`👋 Viewer left stream ${input.channelName}, remaining viewers: ${stream.viewerCount}`);
        return { success: true, stream };
      }
      
      console.log(`⚠️ Attempted to leave non-existent stream: ${input.channelName}`);
      return { success: true }; // Return success even if stream doesn't exist
    } catch (error) {
      console.error('Failed to leave stream:', error);
      return { success: false, error: `Failed to leave stream: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  });