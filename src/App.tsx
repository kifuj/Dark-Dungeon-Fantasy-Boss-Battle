import { Navigate, Route, Routes } from 'react-router-dom';
import { ProfileProvider, RequireProfile } from './lib/profile.tsx';
import { Credits } from './pages/Credits.tsx';
import { Guide } from './pages/Guide.tsx';
import { Leaderboard } from './pages/Leaderboard.tsx';
import { Login } from './pages/Login.tsx';
import { Menu } from './pages/Menu.tsx';
import { Multiplayer } from './pages/Multiplayer.tsx';
import { OnlineMatch } from './pages/OnlineMatch.tsx';
import { Room } from './pages/Room.tsx';
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
              <Multiplayer />
            </RequireProfile>
          }
        />
        <Route
          path="/salon/:roomId"
          element={
            <RequireProfile>
              <Room />
            </RequireProfile>
          }
        />
        <Route
          path="/match/:matchId"
          element={
            <RequireProfile>
              <OnlineMatch />
            </RequireProfile>
          }
        />
        <Route
          path="/classement"
          element={
            <RequireProfile>
              <Leaderboard />
            </RequireProfile>
          }
        />
        <Route path="/guide" element={<Guide />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProfileProvider>
  );
}
