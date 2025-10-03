import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { cn } from '../../lib/utils';

const inter = Inter({ subsets: ["latin"] });

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  return (
    <div className={cn("bg-background-light text-slate-900 antialiased dark:bg-background-dark", inter.className)}>
      <div className="pt-25">
        <div className="">{children}</div>
      </div>
    </div>
  );
}
