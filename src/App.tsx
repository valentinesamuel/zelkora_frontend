import { Navigate, Route, Routes } from 'react-router-dom';

import { PublicOnly, RequireAuth } from './features/auth/guards';
import { LoginPage } from './features/auth/LoginPage';
import { ProfilePage } from './features/profile/ProfilePage';

function App() {
  return (
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
  );
}

export default App;
