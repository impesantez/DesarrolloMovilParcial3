// types.ts

// Usuario que viene de la API
export interface ApiUser {
  record: number;
  id: string;           // cédula
  lastnames: string;
  names: string;
  mail: string;
  phone: string;
  user: string;         // usuario (iniciales + apellido)
}

// Usuario que se guarda tras login
export interface AuthUser {
  source: 'api' | 'local';
  username: string;
  cedula: string;
  displayName: string;
  record?: number;      // opcional, solo si viene de API
}

// Usuario registrado localmente
export interface LocalUser {
  usuario: string;
  nombre: string;
  apellido: string;
  cedula: string;
}

// Registro de asistencia que viene de la API
export interface ApiAttendance {
  record: number;
  date: string;         // "YYYY-MM-DD"
  time: string;         // "HH:MM:SS"
  join_date: string;    // "YYYY-MM-DD HH:MM:SS"
}

// Registro de asistencia local
export interface LocalAttendance {
  date: string;         // "YYYY-MM-DD"
  time: string;         // "HH:MM:SS"
  join_date: string;    // "YYYY-MM-DD HH:MM:SS"
}

export interface LocalUser {
  record: string;
  id: string; // cédula
  lastnames: string;
  names: string;
  mail: string;
  phone: string;
  user: string;
  
}
