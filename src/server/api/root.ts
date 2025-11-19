import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "./routers/auth";
import { supplierRouter } from "./routers/supplier";
import { rawMaterialRouter } from "./routers/raw-material";
import { userRouter } from "./routers/user";
import { semiFinishedGoodRouter } from "./routers/semi-finished-good";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  supplier: supplierRouter,
  rawMaterial: rawMaterialRouter,
  semiFinishedGood: semiFinishedGoodRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
