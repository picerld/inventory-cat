import React, { forwardRef } from "react";
import { HeadMetaData } from "../meta/HeadMetaData";
import { cn } from "~/lib/utils";

type PageContainerProps = {
  withHeader?: boolean;
  withFooter?: boolean;
  isGuarded?: boolean;
};

export const PageContainer = forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & PageContainerProps
>(
  (
    {
      className,
      children,
      isGuarded = false,
      withHeader = true,
      withFooter = true,
      ...props
    },
    ref
  ) => {
    return (
      <div className="h-full w-full">
        <HeadMetaData />
        {/* {withHeader && <GuestNavbar />} */}
        <main
          ref={ref}
          className={cn("flex flex-col min-h-screen", className)}
          {...props}
        >
          {children}
        </main>
        {withFooter && (
          <footer className="flex min-h-16 border-t-2 p-4 mt-10">
            <p className="w-full text-center text-muted-foreground">
              &copy; {new Date().getFullYear()}. All rights reserved.
            </p>
          </footer>
        )}
      </div>
    );
  }
);

PageContainer.displayName = "PageContainer";
