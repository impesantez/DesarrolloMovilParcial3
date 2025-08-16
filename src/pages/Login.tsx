import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonInput, IonPage, IonText } from '@ionic/react';
import { Redirect } from 'react-router-dom';
import { fetchUsers } from '../api';
import { getLocalUsers, saveLoggedUser, getLoggedUser } from '../storage';
import { ApiUser, AuthUser, LocalUser } from '../types';

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [apiUsers, setApiUsers] = useState<ApiUser[]>([]);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [apiUsersLoaded, setApiUsersLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loadApiUsers = async () => {
      try {
        console.log('Loading API users...');
        const users = await fetchUsers();
        console.log('API users loaded:', users.length);
        setApiUsers(users);
        setApiUsersLoaded(true);
      } catch (error) {
        console.error('Failed to load API users:', error);
        setApiUsers([]);
        setApiUsersLoaded(true);
      }
    };
    
    loadApiUsers();
    const logged = getLoggedUser();
    if (logged) setRedirectTo('/asistencia');
  }, []);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setError('');
    
    const u = usuario.trim().toLowerCase();
    const p = password.trim();

    if (!u || !p) {
      setError('Por favor ingresa usuario y cédula');
      setIsLoggingIn(false);
      return;
    }

    try {
      let currentApiUsers = apiUsers;
      if (!apiUsersLoaded || apiUsers.length === 0) {
        console.log('API users not loaded, fetching now...');
        try {
          currentApiUsers = await fetchUsers();
          setApiUsers(currentApiUsers);
          setApiUsersLoaded(true);
          console.log('Fresh API users loaded:', currentApiUsers.length);
        } catch (error) {
          console.error('Failed to load API users during login:', error);
          currentApiUsers = [];
        }
      }

      // Revisar API
      const apiMatch = currentApiUsers.find(
        (x: ApiUser) => x.user.toLowerCase() === u && x.id === p
      );

      if (apiMatch) {
        console.log('API user found:', apiMatch.user);
        const auth: AuthUser = {
          source: 'api',
          username: apiMatch.user,
          cedula: apiMatch.id,
          displayName: `${apiMatch.names} ${apiMatch.lastnames}`,
          record: Number(apiMatch.record) // aseguramos que sea numérico
        };
        saveLoggedUser(auth);
        setRedirectTo('/asistencia');
        return;
      }

      // Revisar usuarios locales
      const locals = getLocalUsers();
      const localMatch = locals.find(
        (x: LocalUser) => x.usuario.toLowerCase() === u && x.cedula === p
      );

      if (localMatch) {
        console.log('Local user found:', localMatch.usuario);
        const auth: AuthUser = {
          source: 'local',
          username: localMatch.usuario,
          cedula: localMatch.cedula,
          displayName: `${localMatch.nombre} ${localMatch.apellido}`,
          record: Number(localMatch.record) // aseguramos que sea numérico
        };
        saveLoggedUser(auth);
        setRedirectTo('/asistencia');
        return;
      }

      setError('Usuario o cédula incorrectos');
    } catch (error) {
      console.error('Login error:', error);
      setError('Error durante el inicio de sesión. Intenta de nuevo.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (redirectTo) return <Redirect to={redirectTo} />;

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="container-fluid h-100">
          <div className="row justify-content-center align-items-center h-100">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-lg">
                <div className="card-header bg-primary text-white text-center">
                  <h3 className="card-title mb-0">
                    <i className="bi bi-person-circle me-2"></i>
                    Iniciar Sesión
                  </h3>
                </div>
                <div className="card-body p-4">
                  <div className="mb-3">
                    <label className="form-label">Usuario</label>
                    <IonInput
                      placeholder="Ingresa tu usuario"
                      value={usuario}
                      onIonChange={e => setUsuario(e.detail.value || '')}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Cédula</label>
                    <IonInput
                      placeholder="Ingresa tu cédula"
                      type="password"
                      value={password}
                      onIonChange={e => setPassword(e.detail.value || '')}
                      className="form-control"
                    />
                  </div>
                  
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div>{error}</div>
                    </div>
                  )}
                  
                  <div className="d-grid">
                    <IonButton 
                      expand="block" 
                      onClick={handleLogin}
                      disabled={isLoggingIn || !usuario || !password}
                      className="btn btn-primary btn-lg"
                    >
                      {isLoggingIn ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Iniciando sesión...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Ingresar
                        </>
                      )}
                    </IonButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
