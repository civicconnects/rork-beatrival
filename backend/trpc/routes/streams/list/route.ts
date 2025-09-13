import { publicProcedure } from "@/backend/trpc/create-context";

// Shared storage with create route
export const activeStreams = new Map<string, any>();

export const listStreamsProcedure = publicProcedure.query(async () => {
  const streams = Array.from(activeStreams.values()).filter(s => s.isLive);
  return { streams };
});