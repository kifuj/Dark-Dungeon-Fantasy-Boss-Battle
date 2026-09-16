import { Navigate, Route, Routes } from 'react-router-dom';
import { ProfileProvider, RequireProfile } from './lib/profile.tsx';
import { Login } from './pages/Login.tsx';
import { Menu } from './pages/Menu.tsx';
import { Placeholder } from './pages/Placeholder.tsx';
import { SoloRun } from './pages/SoloRun.tsx';
import { Title } from './pages/Title.tsx';

export default function App() {
  return (
    <ProfileProvider>
      <Routes>
        <Route path="/" element={<Title />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/solo" element={<SoloRun />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/multi"
          element={
            <RequireProfile>
              <Placeholder title="Multijoueur" />
            </RequireProfile>
          }
        />
        <Route path="/classement" element={<Placeholder title="Classement" />} />
        <Route path="/credits" element={<Placeholder title="Crédits" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProfileProvider>
  );
}
