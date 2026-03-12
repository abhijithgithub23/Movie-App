// Rename the import so it doesn't conflict with your component name
import { Toaster as HotToaster } from "react-hot-toast";

const Toaster = () => {
  return (
    <HotToaster 
      position="bottom-right"
      reverseOrder={false}
      containerStyle={{
        zIndex: 99999, // Ensures it sits above your Navbar and dark backgrounds
      }}
      toastOptions={{
        // Default options for all toasts
        className: "",
        style: {
          // Glassmorphism styling matching your Navbar
          background: "rgba(30, 30, 30, 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)", // For Safari support
          border: "1px solid rgba(255, 255, 255, 0.1)",
          color: "#fff",
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
        },
        // Specific styles for success toasts
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10B981", // Emerald green
            secondary: "#fff",
          },
        },
        // Specific styles for error toasts
        error: {
          duration: 4000,
          iconTheme: {
            primary: "#EF4444", // Red
            secondary: "#fff",
          },
        },
      }}
    />
  );
};

export default Toaster;