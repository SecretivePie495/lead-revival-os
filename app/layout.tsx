import "./globals.css";
import Shell from "./components/Shell";
import ThemeProvider from "./components/ThemeProvider";
import Script from "next/script";
import { headers } from "next/headers";

export const metadata = {
  title: "Lead Revival OS — UTG Labs",
  description: "Pipeline revival dashboard for UTG Labs",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";
  const isPortalRoute = pathname.startsWith("/portal");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Prevent flash of wrong theme on load */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');var safe=(t==='light'||t==='dark')?t:'dark';document.documentElement.setAttribute('data-theme',safe)}catch(e){}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {isPortalRoute ? children : <Shell>{children}</Shell>}
        </ThemeProvider>
      </body>
    </html>
  );
}
