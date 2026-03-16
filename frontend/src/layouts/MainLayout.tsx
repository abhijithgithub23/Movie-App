import { Outlet } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-main text-text-main font-sans transition-colors duration-300">
      
      <Navbar />

      <main className="pt-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}