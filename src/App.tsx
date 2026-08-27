import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthBootstrap } from './features/auth/AuthBootstrap';
import { PublicOnly, RequireAuth } from './features/auth/guards';
import { LoginPage } from './features/auth/LoginPage';
import { ProfilePage } from './features/profile/ProfilePage';

function App() {
  return (
    <>
      <AuthBootstrap />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
