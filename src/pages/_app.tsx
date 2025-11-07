import { type AppType } from "next/app";
import { Poppins } from "next/font/google";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ThemeProvider } from "~/components/ui/theme-provider";
import { Toaster } from "~/components/ui/sonner";

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
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className={poppins.className}>
        <Component {...pageProps} />
        <Toaster />
      </div>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
