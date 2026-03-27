import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import MainLayout from "../layouts/MainLayout";
// import ProtectedRoutes from "./ProtectedRoutes";
// import AdminRoutes from "./AdminRoutes";

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

import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>

        {/* --- Public Auth Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* --- Main App Routes --- */}
        <Route element={<MainLayout />}>

          {/* Publicly accessible pages */}
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv" element={<TVShows />} />
          <Route path="/search" element={<Search />} />
          <Route path="/details/:type/:id" element={<Details />} />

          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/admin/add" element={<AddMedia />} />
          <Route path="/admin/edit/:type/:id" element={<EditMedia />} />

          {/* User must be logged in to view Favorites
          <Route element={<ProtectedRoutes />}>
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          User must be logged in AND an admin
          <Route element={<AdminRoutes />}>
            <Route path="/admin/add" element={<AddMedia />} />
            <Route path="/admin/edit/:type/:id" element={<EditMedia />} />
          </Route> */}

        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </Suspense>
  );
}