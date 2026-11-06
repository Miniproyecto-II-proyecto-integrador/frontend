import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
          <Route path="/panel" element={<Panel />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/salas/:id" element={<Sala />} />

          {/* Rutas de apoyo */}
          <Route path="/ayuda" element={<Ayuda />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
