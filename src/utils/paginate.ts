import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function paginate<T>(
  model: any,
  page: number,
  perPage: number,
  options?: object
): Promise<{ data: T[]; meta: { currentPage: number; lastPage: number; perPage: number; totalItems: number } }> {
  const totalItems = await model.count(options && (options as any).where ? { where: (options as any).where } : undefined);
  const lastPage = Math.ceil(totalItems / perPage);

  const data = await model.findMany({
    skip: (page - 1) * perPage,
    take: perPage,
    ...(options ?? {}),
  });

  return {
    data,
    meta: {
      currentPage: page,
      lastPage,
      perPage,
      totalItems,
    },
  };
}
