import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>

      <Toaster containerStyle={{ zIndex: 999999 }} />

      <AppRoutes />

    </Router>
  );
}

export default App;