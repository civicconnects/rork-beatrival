import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { generateTokenProcedure } from "./routes/agora/generate-token/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  agora: createTRPCRouter({
    generateToken: generateTokenProcedure,
  }),
});

export type AppRouter = typeof appRouter;