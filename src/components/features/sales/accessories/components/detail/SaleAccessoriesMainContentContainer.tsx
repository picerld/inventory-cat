import { toNumber } from "~/lib/utils";
import type { SaleAccessoriesFull, SaleAccessoriesItem } from "~/types/sale";
import { SaleAccessoriesDetailContent } from "./content/SaleAccessoriesDetailContent";
import { SaleAccessoriesDetailSummary } from "./content/SaleAccessoriesDetailSummary";

type SaleAccessoriesMainContentContainerProps = {
  data: SaleAccessoriesFull;
  items: SaleAccessoriesItem[];
};

export const SaleAccessoriesMainContentContainer = ({
  data,
  items,
}: SaleAccessoriesMainContentContainerProps) => {
  const totalQty = items.reduce((acc, it) => acc + toNumber(it.qty), 0);
  const totalRevenue = items.reduce(
    (acc, it) => acc + toNumber(it.qty) * toNumber(it.unitPrice),
    0,
  );

  const totalCost = items.reduce((acc, it) => {
    const qty = toNumber(it.qty);
    const costPrice = toNumber(
      (it as any)?.costPrice ?? (it as any)?.accessory?.costPrice ?? 0,
    );
    return acc + qty * costPrice;
  }, 0);

  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalCost ? (totalProfit / totalCost) * 100 : 0;
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <SaleAccessoriesDetailContent data={data} items={data.items} />

      <SaleAccessoriesDetailSummary
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
