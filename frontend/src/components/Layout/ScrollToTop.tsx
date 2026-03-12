import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // useLocation gives us the current URL pathname (e.g., '/movies', '/search')
  const { pathname } = useLocation();

  useEffect(() => {
    // Whenever the pathname changes, instantly scroll to x: 0, y: 0
    window.scrollTo(0, 0);
  }, [pathname]); // This effect runs every time the URL changes

  // This component doesn't render any UI
  return null;
};

export default ScrollToTop;