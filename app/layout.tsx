import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "./stack";
import "@/app/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="relative flex min-h-screen flex-col bg-muted/40 font-sans antialiased text-foreground">
        <StackProvider app={stackServerApp}>
          <StackTheme>{children}</StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
