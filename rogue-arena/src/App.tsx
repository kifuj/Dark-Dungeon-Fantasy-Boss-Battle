import { Navigate, Route, Routes } from 'react-router-dom';
import { PhaserGame } from './game/PhaserGame.tsx';
import { Menu } from './pages/Menu.tsx';
import { Placeholder } from './pages/Placeholder.tsx';
import { Title } from './pages/Title.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Title />} />
      <Route path="/menu" element={<Menu />} />
      <Route
        path="/solo"
        element={
          <Placeholder title="Solo">
            <PhaserGame />
          </Placeholder>
        }
      />
      <Route path="/multi" element={<Placeholder title="Multijoueur" />} />
      <Route path="/classement" element={<Placeholder title="Classement" />} />
      <Route path="/credits" element={<Placeholder title="Crédits" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
