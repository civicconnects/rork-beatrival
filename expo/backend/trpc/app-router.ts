import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { generateTokenProcedure } from "./routes/agora/generate-token/route";
import { createStreamProcedure } from "./routes/streams/create/route";
import { listStreamsProcedure } from "./routes/streams/list/route";
import { endStreamProcedure } from "./routes/streams/end/route";
import { joinStreamProcedure } from "./routes/streams/join/route";
import { leaveStreamProcedure } from "./routes/streams/leave/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  agora: createTRPCRouter({
    generateToken: generateTokenProcedure,
  }),
  streams: createTRPCRouter({
    create: createStreamProcedure,
    list: listStreamsProcedure,
    end: endStreamProcedure,
    join: joinStreamProcedure,
    leave: leaveStreamProcedure,
  }),
});

export type AppRouter = typeof appRouter;