import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";

export const metadata: Metadata = {
  title: "Qabile Admin",
  description: "Admin panel foundation for Qabile",
};

// Applies the stored theme before hydration so returning light-mode visitors don't
// see a flash of the (default) dark theme. Kept in sync with use-theme.tsx's STORAGE_KEY.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('qabile_admin_theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>
          <AuthProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
