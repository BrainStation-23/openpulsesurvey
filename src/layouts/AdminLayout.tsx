
import { ReactNode } from "react";
import { MainNav } from "@/components/MainNav";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      <MainNav items={[]} />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};
