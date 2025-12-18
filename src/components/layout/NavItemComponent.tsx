import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";

export interface INavItem {
  name: string;
  href: string;
  active: boolean;
  children?: INavItem[];
}

const NavItemComponent: React.FC<{
  item: INavItem;
  isMobile?: boolean;
  expandedItems: Set<string>;
  toggleExpanded: (name: string) => void;
}> = ({ item, isMobile = false, expandedItems, toggleExpanded }) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.name);

  if (!hasChildren) {
    return (
      <Link key={item.name} href={item.href} className="group">
        <div
          className={`mx-2 my-0.5 flex items-center rounded-md px-3 py-2.5 text-sm transition-colors ${
            item.active
              ? "bg-sidebar-accent font-semibold"
              : "text-foreground hover:text-foreground hover:bg-accent font-medium"
          }`}
        >
          {item.name}
        </div>
      </Link>
    );
  }

  return (
    <div key={item.name}>
      <div
        className={`group mx-2 my-0.5 flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors ${
          item.active
            ? "bg-sidebar-accent font-semibold"
            : "text-foreground hover:text-foreground hover:bg-accent font-medium"
        }`}
        onClick={() => toggleExpanded(item.name)}
      >
        <span>{item.name}</span>
        {isExpanded ? (
          <ChevronDown className="size-4" strokeWidth={2} />
        ) : (
          <ChevronRight className="size-4" strokeWidth={2} />
        )}
      </div>
      {isExpanded && (
        <div className="mb-1 ml-2">
          {item.children!.map((child) => (
            <Link key={child.name} href={child.href} className="group">
              <div
                className={`mx-2 my-0.5 flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                  child.active
                    ? "bg-sidebar-accent font-semibold"
                    : "text-foreground hover:text-foreground hover:bg-accent/50 font-medium"
                }`}
              >
                {child.name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavItemComponent;
