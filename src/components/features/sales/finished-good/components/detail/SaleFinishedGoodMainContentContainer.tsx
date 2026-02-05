import type { SaleFinishedGoodFull, SaleFinishedGoodItem } from "~/types/sale";
import { SaleFinishedGoodDetailContent } from "./content/SaleFinishedGoodDetailContent";
import { SaleFinishedGoodDetailSummary } from "./content/SaleFinishedGoodDetailSummary";
import { toNumber } from "~/lib/utils";

type SaleFinishedGoodMainContentContainerProps = {
  data: SaleFinishedGoodFull;
  items: SaleFinishedGoodItem[];
};

export const SaleFinishedGoodMainContentContainer = ({
  data,
  items,
}: SaleFinishedGoodMainContentContainerProps) => {
  const totalQty = items.reduce((acc, it) => acc + toNumber(it.qty), 0);
  const totalRevenue = items.reduce(
    (acc, it) => acc + toNumber(it.qty) * toNumber(it.unitPrice),
    0,
  );

  const totalCost = items.reduce((acc, it) => {
    const qty = toNumber(it.qty);
    const costPrice = toNumber(
      (it as any)?.costPrice ?? (it as any)?.finishedGood?.costPrice ?? 0,
    );
    return acc + qty * costPrice;
  }, 0);

  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalCost ? (totalProfit / totalCost) * 100 : 0;
  
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <SaleFinishedGoodDetailContent data={data} items={data.items} />

      <SaleFinishedGoodDetailSummary
        data={data}
        items={items}
        totalQty={totalQty}
        totalRevenue={totalRevenue}
        totalCost={totalCost}
        totalProfit={totalProfit}
        profitMargin={profitMargin}
      />
    </div>
  );
};
