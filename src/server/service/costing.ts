import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

  let totalCostBatch = 0;

  for (const d of fg.finishedGoodDetails) {
    if (d.rawMaterial) {
      totalCostBatch += Number(d.qty) * d.rawMaterial.supplierPrice;
    }

    if (d.semiFinishedGood) {
      for (const sfgd of d.semiFinishedGood.SemiFinishedGoodDetail) {
        totalCostBatch += Number(sfgd.qty) * sfgd.rawMaterial.supplierPrice;
      }
    }
  }

  const fgQty = Number(fg.qty ?? 0);
  if (!fgQty) return 0;

  const costPerUnit = totalCostBatch / fgQty;
  return Number.isFinite(costPerUnit) ? costPerUnit : 0;
}
