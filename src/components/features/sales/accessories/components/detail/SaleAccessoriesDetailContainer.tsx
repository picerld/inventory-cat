import { statusBadge, toNumber } from "~/lib/utils";
import type { SaleAccessoriesFull, SaleAccessoriesItem } from "~/types/sale";
import { SaleAccessoriesDetailHeader } from "./attributes/SaleAccessoriesDetailHeader";
import { SaleAccessoriesHeaderInformation } from "../../../finished-good/components/detail/attributes/SaleAccessoriesHeaderInformation";
import { SaleAccessoriesMainContentContainer } from "./SaleAccessoriesMainContentContainer";

type SaleAccessoriesDetailContainerProps = {
  data: SaleAccessoriesFull;
  items: SaleAccessoriesItem[];
};

export const SaleAccessoriesDetailContainer = ({
  data,
  items,
}: SaleAccessoriesDetailContainerProps) => {
  const totalRevenue = items.reduce(
    (acc, it) => acc + toNumber(it.qty) * toNumber(it.unitPrice),
    0,
  );

  const badge = statusBadge(data.status);

  return (
    <div className="space-y-6 pb-8">
      <SaleAccessoriesDetailHeader data={data} />

      <SaleAccessoriesHeaderInformation
        data={data}
        items={items}
        totalRevenue={totalRevenue}
        badge={badge}
      />

      <SaleAccessoriesMainContentContainer data={data} items={items} />
    </div>
  );
};
