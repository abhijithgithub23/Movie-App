import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ScrollToTop from "./components/Layout/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>

      <ScrollToTop />

      <Toaster containerStyle={{ zIndex: 999999 }} />

      <AppRoutes />

    </Router>
  );
}

export default App;