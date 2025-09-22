import React, { useState } from 'react';
import { CAREERS, INITIAL_USERS, PRECEPTOR_REGISTRATION_CODES } from '../constants';
import { Role, User } from '../types';
import { UserIcon, LockClosedIcon, ArrowLeftIcon, ShieldCheckIcon } from './Icons';

interface AuthFormProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState<'selection' | 'login' | 'register' | 'recover'>('selection');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [careerId, setCareerId] = useState(CAREERS[0].id);
  const [year, setYear] = useState(1);
  const [preceptorCode, setPreceptorCode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const triggerError = (message: string) => {
    setError(message);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleAlumnoPrototype = () => {
    const user = INITIAL_USERS.find(u => u.id === 101); // Juan Perez
    if (user) {
      onLogin(user);
    } else {
      triggerError("No se encontró el usuario prototipo de alumno.");
    }
  };

  const handlePreceptorPrototype = () => {
    const user = INITIAL_USERS.find(u => u.id === 1); // Carlos Gomez
    if (user) {
      onLogin(user);
    } else {
      triggerError("No se encontró el usuario prototipo de preceptor.");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = INITIAL_USERS.find(u => 
          (u.email.toLowerCase() === email.toLowerCase() || u.name.toLowerCase() === email.toLowerCase()) && 
          u.password === password &&
          u.role === role &&
          u.careerId === careerId &&
          (role === Role.PRECEPTOR || u.year === year)
      );

      if (!user) {
          throw new Error("Credenciales incorrectas. Verifique los datos ingresados.");
      }
      onLogin(user);
    } catch (err: any) {
      triggerError(err.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (!name || !email || !password) {
          throw new Error("Por favor, completa todos los campos.");
      }
      if (INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Este email ya está registrado.");
      }
      
      if (role === Role.PRECEPTOR) {
        if (!preceptorCode.trim() || !PRECEPTOR_REGISTRATION_CODES.includes(preceptorCode.trim())) {
          throw new Error("El código de preceptor no es válido.");
        }
      }

      const newUser: User = {
          id: Date.now(),
          name,
          email,
          password,
          role,
          careerId,
          year: role === Role.PRECEPTOR ? 1 : year,
      };
      onRegister(newUser);
    } catch (err: any) {
      triggerError(err.message);
    }
  };
  
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!recoveryEmail.trim()) {
        triggerError("Por favor, ingresa tu correo electrónico.");
        return;
    }
    // Simulate API call
    setTimeout(() => {
        setRecoverySent(true);
    }, 1000);
  };

  const selectedCareer = CAREERS.find(c => c.id === careerId);

  const renderSelectionScreen = () => (
     <div className="animate-fade-in-up">
        <div className="prototype-buttons animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <button type="button" onClick={handleAlumnoPrototype} className="prototype-button !py-4">
                <UserIcon className="w-6 h-6"/>
                <span className="text-lg">Prototipo Alumno</span>
            </button>
            <button type="button" onClick={handlePreceptorPrototype} className="prototype-button !py-4">
                <ShieldCheckIcon className="w-6 h-6"/>
                <span className="text-lg">Prototipo Preceptor</span>
            </button>
        </div>
        <div className="prototype-divider animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <span>o</span>
        </div>
        <div className="text-center animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
            <button type="button" onClick={() => setMode('login')} className="auth-link font-semibold" style={{color: 'var(--login-input-focus-border, #c09a58)'}}>
                Acceder manualmente
            </button>
        </div>
    </div>
  );

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-5">
      <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <input type="text" placeholder="Email o usuario" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required/>
          <UserIcon className="w-5 h-5 input-icon" />
      </div>
      <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required/>
          <LockClosedIcon className="w-5 h-5 input-icon" />
      </div>
      <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input-field">
              <option value={Role.STUDENT}>Alumno</option>
              <option value={Role.PRECEPTOR}>Preceptor</option>
          </select>
      </div>
      <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
          <select value={careerId} onChange={(e) => setCareerId(e.target.value)} className="input-field">
              {CAREERS.map(career => <option key={career.id} value={career.id}>{career.name}</option>)}
          </select>
      </div>
      {role === Role.STUDENT && (
        <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.7s' }}>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field">
                {selectedCareer?.years.map(y => <option key={y} value={y}>{y}° Año</option>)}
            </select>
        </div>
      )}
      <div className="animate-slide-in-up" style={{ animationDelay: '0.8s' }}>
          <button type="submit" className="auth-button">Iniciar Sesión</button>
      </div>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegisterSubmit} className="space-y-5">
      <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <input type="text" placeholder="Nombre Completo" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required/>
          <UserIcon className="w-5 h-5 input-icon" />
      </div>
      <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required/>
          <UserIcon className="w-5 h-5 input-icon" />
      </div>
      <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required/>
          <LockClosedIcon className="w-5 h-5 input-icon" />
      </div>
      <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input-field">
              <option value={Role.STUDENT}>Alumno</option>
              <option value={Role.PRECEPTOR}>Preceptor</option>
          </select>
      </div>
      {role === Role.PRECEPTOR && (
        <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
          <input type="text" placeholder="Código de Preceptor" value={preceptorCode} onChange={(e) => setPreceptorCode(e.target.value)} className="input-field" required/>
          <ShieldCheckIcon className="w-5 h-5 input-icon" />
        </div>
      )}
      <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.7s' }}>
          <select value={careerId} onChange={(e) => setCareerId(e.target.value)} className="input-field">
              {CAREERS.map(career => <option key={career.id} value={career.id}>{career.name}</option>)}
          </select>
      </div>
      {role === Role.STUDENT && (
        <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.8s' }}>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field">
                {selectedCareer?.years.map(y => <option key={y} value={y}>{y}° Año</option>)}
            </select>
        </div>
      )}
      <div className="animate-slide-in-up" style={{ animationDelay: '0.9s' }}>
          <button type="submit" className="auth-button">Registrarse</button>
      </div>
    </form>
  );

  const renderRecoverForm = () => {
    if (recoverySent) {
      return (
        <div className="text-center animate-fade-in">
            <h2 className="text-xl font-bold text-[--login-text-primary]">Revisa tu Correo</h2>
            <p className="text-[--login-text-secondary] mt-2 mb-6">Si tu email está registrado, recibirás un correo con las instrucciones para recuperar tu contraseña.</p>
            <button onClick={() => { setMode('login'); setRecoverySent(false); setRecoveryEmail(''); }} className="auth-button">Volver al Inicio</button>
        </div>
      );
    }
    return (
      <form onSubmit={handleRecoverySubmit} className="space-y-5">
        <div className="input-group animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <input type="email" placeholder="Ingresa tu email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} className="input-field" required/>
            <UserIcon className="w-5 h-5 input-icon" />
        </div>
        <div className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <button type="submit" className="auth-button">Enviar Instrucciones</button>
        </div>
        <div className="text-center pt-2 animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
            <button type="button" onClick={() => setMode('login')} className="auth-link flex items-center justify-center gap-2 mx-auto">
                <ArrowLeftIcon className="w-4 h-4"/> Volver al inicio
            </button>
        </div>
      </form>
    );
  };
  
  const getTitle = () => {
    if (mode === 'register') return 'Crear Cuenta';
    if (mode === 'recover') return 'Recuperar Contraseña';
    if (mode === 'selection') return 'Seleccionar Prototipo';
    return 'Bienvenido';
  };

  const getSubtitle = () => {
    if (mode === 'register') return 'Únete a nuestra comunidad estudiantil.';
    if (mode === 'recover') return 'Ingresa tu email para recibir instrucciones.';
    if (mode === 'selection') return 'Accede rápidamente para la presentación.';
    return 'Ingresa a tu cuenta para continuar.';
  };

  return (
    <div className="login-container">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
        <div className={`auth-card animate-fade-in-up ${isShaking ? 'animate-shake' : ''}`}>
            <h1 className="auth-title">{getTitle()}</h1>
            <p className="auth-subtitle">{getSubtitle()}</p>
            
            {error && <p className="bg-red-500/20 text-red-100 p-3 rounded-lg mb-6 text-center text-sm animate-fade-in">{error}</p>}
            
            {mode === 'selection' && renderSelectionScreen()}
            {mode === 'login' && renderLoginForm()}
            {mode === 'register' && renderRegisterForm()}
            {mode === 'recover' && renderRecoverForm()}
            
            {mode === 'login' && (
              <div className="text-center mt-4 animate-slide-in-up" style={{ animationDelay: '1.1s' }}>
                <button type="button" onClick={() => setMode('recover')} className="auth-link" style={{color: 'var(--login-input-focus-border, #c09a58)'}}>¿Olvidaste tu contraseña?</button>
              </div>
            )}

            {mode !== 'recover' && mode !== 'selection' && (
              <div className="auth-switch-link animate-slide-in-up" style={{ animationDelay: mode === 'login' ? '1.2s' : '1.0s' }}>
                  {mode === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                  <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Regístrate' : 'Inicia sesión'}</button>
              </div>
            )}
        </div>
    </div>
  );
};