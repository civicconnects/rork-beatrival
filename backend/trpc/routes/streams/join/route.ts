import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { activeStreams } from "../list/route";

export const joinStreamProcedure = publicProcedure
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
        stream.viewerCount = Math.max(0, (stream.viewerCount || 0) + 1);
        stream.lastActivity = new Date().toISOString();
        
        console.log(`👥 Viewer joined stream ${input.channelName}, total viewers: ${stream.viewerCount}`);
        return { success: true, stream };
      }
      
      console.log(`❌ Stream not found or not live: ${input.channelName}`);
      return { success: false, error: "Stream not found or not live" };
    } catch (error) {
      console.error('Failed to join stream:', error);
      return { success: false, error: `Failed to join stream: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  });