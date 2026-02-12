import type { SaleFinishedGoodFull, SaleFinishedGoodItem } from "~/types/sale";
import { SaleFinishedGoodDetailHeader } from "./attributes/SaleFinishedGoodDetailHeader";
import { SaleFinishedGoodHeaderInformation } from "./attributes/SaleFinishedGoodHeaderInformation";
import { SaleFinishedGoodMainContentContainer } from "./SaleFinishedGoodMainContentContainer";
import { statusBadge, toNumber } from "~/lib/utils";

type SaleFinishedGoodDetailContainerProps = {
  data: SaleFinishedGoodFull;
  items: SaleFinishedGoodItem[];
};

export const SaleFinishedGoodDetailContainer = ({
  data,
  items,
}: SaleFinishedGoodDetailContainerProps) => {
  const totalRevenue = items.reduce(
    (acc, it) => acc + toNumber(it.qty) * toNumber(it.unitPrice),
    0,
  );

  const badge = statusBadge(data.status);

  return (
    <div className="space-y-6 pb-8">
      <SaleFinishedGoodDetailHeader data={data} />

      <SaleFinishedGoodHeaderInformation
        data={data}
        items={items}
        totalRevenue={totalRevenue}
        badge={badge}
      />

      <SaleFinishedGoodMainContentContainer data={data} items={items} />
    </div>
  );
};
