import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { activeStreams } from "../list/route";

export const createStreamProcedure = publicProcedure
  .input(
    z.object({
      channelName: z.string(),
      hostId: z.string(),
      hostName: z.string(),
      battleType: z.enum(["dancing", "singing"]),
      title: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
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
    };

    activeStreams.set(input.channelName, stream);
    
    return { success: true, stream };
  });