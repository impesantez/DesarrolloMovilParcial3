import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonInput, IonPage, IonText, IonList, IonItem } from '@ionic/react';
import { Redirect } from 'react-router-dom';
import { getLoggedUser } from '../storage';
import { AuthUser } from '../types';
import { fetchAttendanceByRecord, postAttendance } from '../api';

interface AsistenciaRecord {
  record: number;
  date: string;
  time: string;
  join_date: string;
}

const Asistencia: React.FC = () => {
  const [pos1, setPos1] = useState<number>(0);
  const [pos2, setPos2] = useState<number>(0);
  const [dig1, setDig1] = useState<string>('');
  const [dig2, setDig2] = useState<string>('');
  const [mensaje, setMensaje] = useState<string>('');
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [loggedUser, setLoggedUser] = useState<AuthUser | null>(null);
  const [historial, setHistorial] = useState<AsistenciaRecord[]>([]);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      setRedirectTo('/login');
      return;
    }
    setLoggedUser(user);

    const len = user.cedula.length;
    let p1 = Math.floor(Math.random() * len);
    let p2 = Math.floor(Math.random() * len);
    while (p2 === p1) p2 = Math.floor(Math.random() * len);
    setPos1(p1);
    setPos2(p2);

    if (user.record !== undefined) fetchHistorial(Number(user.record));
  }, []);

  const fetchHistorial = async (record: number) => {
    try {
      const data: AsistenciaRecord[] = await fetchAttendanceByRecord(record);
      setHistorial(data);
    } catch (err) {
      console.error('Error cargando historial', err);
      setHistorial([]);
    }
  };

  const registrarAsistencia = async () => {
    // Prevent multiple simultaneous requests
    if (isRegistering) return;
    
    setIsRegistering(true);
    // Clear any previous messages
    setMensaje('');
    
    if (!loggedUser || loggedUser.record === undefined) {
      setMensaje('Error: Usuario no válido o sin número de registro.');
      setIsRegistering(false);
      return;
    }

    console.log('Validating digits:', { 
      dig1, 
      dig2, 
      pos1, 
      pos2, 
      expectedDig1: loggedUser.cedula[pos1], 
      expectedDig2: loggedUser.cedula[pos2],
      cedula: loggedUser.cedula 
    });

    const correcto = dig1 === loggedUser.cedula[pos1] && dig2 === loggedUser.cedula[pos2];
    if (!correcto) {
      setMensaje('Dígitos incorrectos. Intenta de nuevo.');
      setIsRegistering(false);
      return;
    }

    try {
      setMensaje('Registrando asistencia...');
      
      const data = {
        record_user: Number(loggedUser.record),
        join_user: loggedUser.username
      };

      console.log('Sending attendance data:', data);
      const json = await postAttendance(data);
      console.log('Respuesta API:', json);

      setMensaje(`Asistencia registrada para ${loggedUser.displayName}`);
      setDig1('');
      setDig2('');

      // Refresh the history
      await fetchHistorial(Number(loggedUser.record));
    } catch (err: any) {
      console.error('Error registering attendance:', err);
      const errorMessage = err?.message || err?.toString() || 'Error desconocido';
      setMensaje(`Error al registrar la asistencia: ${errorMessage}`);
    } finally {
      setIsRegistering(false);
    }
  };

  if (redirectTo) return <Redirect to={redirectTo} />;
  if (!loggedUser) return null;

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="container-fluid">
          {/* Header with user info */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="card-title mb-1">
                        <i className="bi bi-clock-history me-2"></i>
                        Registro de Asistencia
                      </h4>
                      <p className="card-text mb-0">
                        <i className="bi bi-person-badge me-1"></i>
                        Bienvenido, {loggedUser.displayName}
                      </p>
                    </div>
                    <IonButton 
                      fill="clear" 
                      onClick={() => {
                        localStorage.removeItem('loggedUser');
                        setRedirectTo('/login');
                      }}
                      className="btn btn-outline-light"
                    >
                      <i className="bi bi-box-arrow-right me-1"></i>
                      Cerrar sesión
                    </IonButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration form */}
          <div className="row justify-content-center mb-4">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow">
                <div className="card-header bg-success text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-check-circle me-2"></i>
                    Registrar
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="bi bi-key me-1"></i>
                        Dígito {pos1 + 1} de tu cédula:
                      </label>
                      <IonInput 
                        value={dig1} 
                        onIonChange={e => setDig1(e.detail.value || '')} 
                        maxlength={1}
                        className="form-control text-center fs-4"
                        placeholder="•"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="bi bi-key me-1"></i>
                        Dígito {pos2 + 1} de tu cédula:
                      </label>
                      <IonInput 
                        value={dig2} 
                        onIonChange={e => setDig2(e.detail.value || '')} 
                        maxlength={1}
                        className="form-control text-center fs-4"
                        placeholder="•"
                      />
                    </div>
                  </div>
                  
                  {mensaje && (
                    <div className={`alert ${mensaje.includes('Error') || mensaje.includes('incorrectos') ? 'alert-danger' : 'alert-success'} d-flex align-items-center mb-3`} role="alert">
                      <i className={`bi ${mensaje.includes('Error') || mensaje.includes('incorrectos') ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-2`}></i>
                      <div>{mensaje}</div>
                    </div>
                  )}
                  
                  <div className="d-grid">
                    <IonButton 
                      expand="block" 
                      color="success"
                      onClick={registrarAsistencia}
                      disabled={isRegistering || !dig1 || !dig2}
                      className="btn btn-success btn-lg"
                    >
                      {isRegistering ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Registrando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-calendar-check me-2"></i>
                          Registrar Asistencia
                        </>
                      )}
                    </IonButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance history */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-journal-text me-2"></i>
                    Historial de Asistencia
                  </h5>
                </div>
                <div className="card-body">
                  {historial.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-calendar-x display-1"></i>
                      <p className="mt-3">No hay registros de asistencia aún.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th><i className="bi bi-calendar3 me-1"></i>Fecha</th>
                            <th><i className="bi bi-clock me-1"></i>Hora</th>
                            <th><i className="bi bi-check-lg me-1"></i>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historial.map((h, i) => (
                            <tr key={i}>
                              <td>
                                <i className="bi bi-calendar-day me-2 text-primary"></i>
                                {h.date}
                              </td>
                              <td>
                                <i className="bi bi-clock me-2 text-success"></i>
                                {h.time}
                              </td>
                              <td>
                                <span className="badge bg-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Presente
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Asistencia;
