import { Inter, Dancing_Script } from "next/font/google";
import { Toaster } from "sonner";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-cursive" });

export default function ContractLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${dancingScript.variable}`}>
        <div className="min-h-screen bg-slate-50/50">
           {children}
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
