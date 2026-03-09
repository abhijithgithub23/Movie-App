import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './auth0/AuthGuard';
import Navbar from './components/Layout/Navbar';

// Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Search from './pages/Search';
import Details from './pages/Details';
import Favorites from './pages/Favorites';
import AddMedia from './pages/AddMedia';
import EditMedia from './pages/EditMedia';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans">
        <Navbar />

        {/* pt-16 prevents navbar overlap */}
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
            <Route path="/movies" element={<AuthGuard><Movies /></AuthGuard>} />
            <Route path="/tv" element={<AuthGuard><TVShows /></AuthGuard>} />
            <Route path="/search" element={<AuthGuard><Search /></AuthGuard>} />
            <Route path="/favorites" element={<AuthGuard><Favorites /></AuthGuard>} />
            <Route path="/details/:type/:id" element={<AuthGuard><Details /></AuthGuard>} />

            <Route
              path="/admin/add"
              element={<AuthGuard requireAdmin={true}><AddMedia /></AuthGuard>}
            />

            <Route
              path="/admin/edit/:type/:id"
              element={<AuthGuard requireAdmin={true}><EditMedia /></AuthGuard>}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;