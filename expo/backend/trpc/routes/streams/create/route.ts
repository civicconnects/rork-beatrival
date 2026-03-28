import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { activeStreams } from "../list/route";

export const createStreamProcedure = publicProcedure
  .input(
    z.object({
      channelName: z.string().min(1, "Channel name is required"),
      hostId: z.string().min(1, "Host ID is required"),
      hostName: z.string().min(1, "Host name is required"),
      battleType: z.enum(["dancing", "singing"]),
      title: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // Check if stream already exists
      const existingStream = activeStreams.get(input.channelName);
      if (existingStream && existingStream.isLive) {
        console.log(`Stream ${input.channelName} already exists and is live`);
        return { success: true, stream: existingStream };
      }
      
      const stream = {
        id: input.channelName,
        channelName: input.channelName,
        hostId: input.hostId,
        hostName: input.hostName,
        battleType: input.battleType,
        title: input.title || `${input.hostName}'s ${input.battleType} battle`,
        viewerCount: 0,
        startedAt: new Date().toISOString(),
        isLive: true,
        lastActivity: new Date().toISOString(),
      };

      activeStreams.set(input.channelName, stream);
      console.log(`✅ Stream created: ${input.channelName}`);
      
      return { success: true, stream };
    } catch (error) {
      console.error('Failed to create stream:', error);
      throw new Error(`Failed to create stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });