import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

export default function MainLayout() {
  const { pathname } = useLocation();

  return (
    /* Changed min-h-screen to h-screen, added flex col */
    <div className="h-screen flex flex-col bg-main text-text-main font-sans transition-colors duration-300">
      
      {/* Header stays fixed at the top */}
      <header className="flex-none">
        <Navbar />
      </header>
      
      {/* 1. flex-1: Takes up the remaining space
        2. overflow-y-auto: The scrollbar lives HERE now, not on the window
        3. key={pathname}: Forces React to destroy and recreate this container 
           every time the URL changes, naturally resetting the scroll to 0.
      */}
      <main key={pathname} className="flex-1 overflow-y-auto pt-16">
        <Outlet />
        <Footer /> {/* Footer moved inside the scrollable area so it stays at the bottom of the content */}
      </main>

    </div>
  );
}