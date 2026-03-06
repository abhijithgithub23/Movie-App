import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthGuard } from './components/Layout/AuthGuard';
import Navbar from './components/Layout/Navbar';

// Page Imports
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
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <Navbar />
        <main className="p-4 md:p-8 container mx-auto">
          <Routes>
            {/* Standard Protected Routes */}
            <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
            <Route path="/movies" element={<AuthGuard><Movies /></AuthGuard>} />
            <Route path="/tv" element={<AuthGuard><TVShows /></AuthGuard>} />
            <Route path="/search" element={<AuthGuard><Search /></AuthGuard>} />
            <Route path="/favorites" element={<AuthGuard><Favorites /></AuthGuard>} />
            <Route path="/details/:type/:id" element={<AuthGuard><Details /></AuthGuard>} />

            {/* Admin Only Routes */}
            <Route 
              path="/admin/add" 
              element={<AuthGuard requireAdmin={true}><AddMedia /></AuthGuard>} 
            />
           <Route path="/admin/edit/:type/:id" element={<AuthGuard requireAdmin={true}><EditMedia /></AuthGuard>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;