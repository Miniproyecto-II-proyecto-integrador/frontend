import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Inicio from './pages/Inicio';
import Ingreso from './pages/Ingreso';
import Registro from './pages/Registro';
import ElegirUsuario from './pages/ElegirUsuario';
import Panel from './pages/Panel';
import Perfil from './pages/Perfil';
import Sala from './pages/Sala';
import Ayuda from './pages/Ayuda';
import NoEncontrada from './pages/NoEncontrada';
import PrivateRoute from './auth/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* El Layout envuelve todas las rutas para mantener la estructura común */}
        <Route element={<Layout />}>
          {/* Rutas públicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/ingreso" element={<Ingreso />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/nombre-de-usuario" element={<ElegirUsuario />} />

          {/* Rutas privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/panel" element={<Panel />} />
            <Route path="/dashboard" element={<Navigate to="/panel" replace />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/salas/:id" element={<Sala />} />
          </Route>

          {/* Rutas de apoyo */}
          <Route path="/ayuda" element={<Ayuda />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
