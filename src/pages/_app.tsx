import { type AppType } from "next/app";
import { Poppins } from "next/font/google";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ThemeProvider } from "~/components/ui/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { SidebarProvider } from "~/context/SidebarContext";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <div className={poppins.className}>
          <Component {...pageProps} />
          <Toaster />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
