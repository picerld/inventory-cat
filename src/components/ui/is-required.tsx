import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export const IsRequired = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild className="cursor-pointer">
        <span className="text-destructive flex size-4 items-center justify-center rounded-full bg-secondary pt-1 text-center font-extrabold">
          *
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-secondary text-sm">Wajib Diisi!</p>
      </TooltipContent>
    </Tooltip>
  );
};
