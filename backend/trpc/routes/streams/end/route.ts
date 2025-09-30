import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { activeStreams } from "../list/route";

export const endStreamProcedure = publicProcedure
  .input(
    z.object({
      channelName: z.string().min(1, "Channel name is required"),
      hostId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const stream = activeStreams.get(input.channelName);
      
      if (stream) {
        // Mark stream as ended
        stream.isLive = false;
        stream.endedAt = new Date().toISOString();
        stream.lastActivity = new Date().toISOString();
        
        // Remove from active streams
        activeStreams.delete(input.channelName);
        
        console.log(`📺 Stream ended: ${input.channelName}, final viewer count: ${stream.viewerCount}`);
        return { success: true, stream };
      }
      
      console.log(`⚠️ Attempted to end non-existent stream: ${input.channelName}`);
      return { success: true }; // Return success even if stream doesn't exist to avoid errors
    } catch (error) {
      console.error('Failed to end stream:', error);
      return { success: false, error: `Failed to end stream: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  });