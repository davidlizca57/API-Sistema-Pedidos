import React, { useState } from 'react';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Historial from './pages/Historial';

function App() {
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario_sesion')) || null);
  const [vista, setVista] = useState('menu'); // 'menu' o 'historial'

  const cerrarSesion = () => {
    localStorage.removeItem('usuario_sesion');
    setUsuario(null);
  };

  if (!usuario) {
    return <Login onLoginSuccess={(user) => setUsuario(user)} />;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-text">
          <h1>SISTEMA INTELIGENTE DE PEDIDOS (SIP)</h1>
          <span>Bienvenido, {usuario.nombre} ({usuario.rol})</span>
        </div>
        <nav className="nav">
          <button className={`nav-link ${vista === 'menu' ? 'activo' : ''}`} onClick={() => setVista('menu')}>Menú</button>
          <button className={`nav-link ${vista === 'historial' ? 'activo' : ''}`} onClick={() => setVista('historial')}>Historial Pedidos</button>
          <button className="btn-cerrar" onClick={cerrarSesion}>Cerrar Sesión</button>
        </nav>
      </header>

      {vista === 'menu' ? <Menu usuario={usuario} /> : <Historial usuario={usuario} />}
    </div>
  );
}

export default App;
