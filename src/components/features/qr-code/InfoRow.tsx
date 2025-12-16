import { Separator } from "~/components/ui/separator";

export const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <div className="flex items-center justify-between py-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
    <Separator />
  </>
);
