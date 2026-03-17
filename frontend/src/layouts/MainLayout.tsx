import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

export default function MainLayout() {
  const { pathname } = useLocation();

  return (
    <div className="h-screen flex flex-col bg-main text-text-main font-sans transition-colors duration-300">
      
      <header className="flex-none">
        <Navbar />
      </header>
      
      <main key={pathname} className="flex-1 overflow-y-auto pt-16">
        <Outlet />
        <Footer /> 
      </main>

    </div>
  );
}