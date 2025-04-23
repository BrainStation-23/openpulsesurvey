
import { Outlet, useLocation } from "react-router-dom";
import TopNav from "../navigation/TopNav";
import Footer from "./Footer";

const MainLayout = () => {
  const location = useLocation();
  // Hide TopNav only on the landing page "/"
  const hideNav = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && <TopNav />}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
