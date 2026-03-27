// import type { ReactNode } from 'react';
// import { useAuth0 } from '@auth0/auth0-react';
// import { Navigate } from 'react-router-dom';

// interface Props {
//   children: ReactNode;
//   requireAdmin?: boolean;
// }

// export const AuthGuard = ({ children, requireAdmin = false }: Props) => {
//   const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();
  
//   if (isLoading) return <div className="text-white flex justify-center items-center h-screen">Loading...</div>;
  
//   if (!isAuthenticated) {
//     loginWithRedirect();
//     return null;
//   }

//   if (requireAdmin && user?.email !== 'abhijithksd23@gmail.com') {
//     // console.log(user,'use')
    
//     return <Navigate to="/" replace />;
//   }

//   return <>{children}</>; 
// };