import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { activeStreams } from "../list/route";

export const joinStreamProcedure = publicProcedure
  .input(
    z.object({
      channelName: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const stream = activeStreams.get(input.channelName);
    
    if (stream) {
      stream.viewerCount = (stream.viewerCount || 0) + 1;
      return { success: true, stream };
    }
    
    return { success: false, error: "Stream not found" };
  });