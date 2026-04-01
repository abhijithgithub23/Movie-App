import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../features/auth/authSlice";
import { fetchFavorites } from "../features/favorites/favoritesSlice"; 
import type { AppDispatch, RootState } from "../store/store";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoutes from "./ProtectedRoutes";
import AdminRoutes from "./AdminRoutes";
import LoadingSpinner from "../components/ui/LoadingSpinner";

/* Lazy loaded pages */
const Home = lazy(() => import("../pages/Home"));
const Movies = lazy(() => import("../pages/Movies"));
const TVShows = lazy(() => import("../pages/TVShows"));
const Search = lazy(() => import("../pages/Search"));
const Details = lazy(() => import("../pages/Details"));
const Favorites = lazy(() => import("../pages/Favorites"));
const AddMedia = lazy(() => import("../pages/AddMedia"));
const EditMedia = lazy(() => import("../pages/EditMedia"));
const NotFound = lazy(() => import("../pages/NotFound"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const SignupPage = lazy(() => import("../pages/SignupPage"));

export default function AppRoutes() {
  const dispatch = useDispatch<AppDispatch>();
  const { status, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFavorites());
    }
  }, [isAuthenticated, dispatch]);

  // THE FIX: Block the render if status is 'idle' OR 'loading'
  // This prevents ProtectedRoutes from prematurely kicking the user out before checkAuth runs!
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* --- Public Auth Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* --- Main App Routes --- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv" element={<TVShows />} />
          <Route path="/search" element={<Search />} />
          <Route path="/details/:type/:id" element={<Details />} />

          {/* --- PROTECTED ROUTES (Must be logged in) --- */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* --- ADMIN ROUTES (Must be logged in AND an Admin) --- */}
          <Route element={<AdminRoutes />}>
            <Route path="/admin/add" element={<AddMedia />} />
            <Route path="/admin/edit/:type/:id" element={<EditMedia />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}