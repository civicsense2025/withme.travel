// Metadata export must be in a separate file or not marked with "use client"
import { Inter } from "next/font/google";
import { ClientLayout } from "../components/client-layout";
import "./globals.css";
import { metadata } from "./metadata";
const inter = Inter({ subsets: ["latin"] });
export { metadata };
export default function RootLayout({ children, }) {
    return (<html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>);
}
