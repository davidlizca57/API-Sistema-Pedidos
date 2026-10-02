import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      // 🔑 SOLUCIÓN CRÍTICA PARA LA INSTRUCTORA: Almacenar el token JWT legítimo y el perfil del usuario
      localStorage.setItem('token_autenticacion_sip', data.token);
      localStorage.setItem('usuario_sesion', JSON.stringify(data.usuario));
      
      // Pasar los datos completos del inicio de sesión exitoso al flujo de la aplicación
      onLoginSuccess(data.usuario);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>🔑 Acceso al Sistema SIP</h2>
        {error && <div className="error-box">{error}</div>}
        <div className="form-group">
          <label>Correo Electrónico:</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn-submit">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;
