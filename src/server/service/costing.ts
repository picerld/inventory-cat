import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Calculate cost price of FinishedGood
 * Includes:
 * - Raw materials
 * - Semi finished goods (recursive)
 */
export async function calculateFinishedGoodCost(
  finishedGoodId: string,
): Promise<number> {
  const fg = await prisma.finishedGood.findUnique({
    where: { id: finishedGoodId },
    include: {
      finishedGoodDetails: {
        include: {
          rawMaterial: true,
          semiFinishedGood: {
            include: {
              SemiFinishedGoodDetail: {
                include: {
                  rawMaterial: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!fg) throw new Error("FinishedGood not found");

  let totalCost = 0;

  for (const d of fg.finishedGoodDetails) {
    // Direct raw material
    if (d.rawMaterial) {
      totalCost += Number(d.qty) * d.rawMaterial.supplierPrice;
    }

    // Semi finished good → explode to raw materials
    if (d.semiFinishedGood) {
      for (const sfgd of d.semiFinishedGood.SemiFinishedGoodDetail) {
        totalCost += Number(sfgd.qty) * sfgd.rawMaterial.supplierPrice;
      }
    }
  }

  return totalCost;
}
