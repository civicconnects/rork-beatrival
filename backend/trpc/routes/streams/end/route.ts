import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { activeStreams } from "../list/route";

export const endStreamProcedure = publicProcedure
  .input(
    z.object({
      channelName: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const stream = activeStreams.get(input.channelName);
    
    if (stream) {
      stream.isLive = false;
      stream.endedAt = new Date().toISOString();
      activeStreams.delete(input.channelName);
      return { success: true };
    }
    
    return { success: false, error: "Stream not found" };
  });