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
          className={`flex items-center px-3 py-2.5 mx-2 my-0.5 rounded-md text-sm transition-colors ${
            item.active
              ? "bg-primary text-primary-foreground font-medium"
              : "text-foreground hover:text-foreground hover:bg-accent font-normal"
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
        className={`flex items-center justify-between px-3 py-2.5 mx-2 my-0.5 rounded-md text-sm cursor-pointer transition-colors group ${
          item.active
            ? "bg-accent text-accent-foreground font-medium"
            : "text-foreground hover:text-foreground hover:bg-accent"
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
        <div className="ml-2 mb-1">
          {item.children!.map((child) => (
            <Link key={child.name} href={child.href} className="group">
              <div
                className={`flex items-center px-3 py-2 mx-2 my-0.5 rounded-md text-sm transition-colors ${
                  child.active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-foreground hover:text-foreground hover:bg-accent/50"
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