import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "./routers/auth";
import { supplierRouter } from "./routers/supplier";
import { rawMaterialRouter } from "./routers/raw-material";
import { userRouter } from "./routers/user";
import { semiFinishedGoodRouter } from "./routers/semi-finished-good";
import { gradeRouter } from "./routers/grade";
import { finishedGoodRouter } from "./routers/finished-good";
import { accessoriesRouter } from "./routers/accessories";

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
  finishedGood: finishedGoodRouter,
  paintGrade: gradeRouter,
  accessories: accessoriesRouter,
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
