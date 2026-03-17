import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function ProposalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
           {children}
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
