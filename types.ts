export enum Role {
  STUDENT = 'Alumno',
  PRECEPTOR = 'Preceptor',
}

export enum CareerName {
  SOFTWARE = 'Tecnicatura Superior en Desarrollo de Software',
  DESIGN = 'Tecnicatura Superior en Diseño, Imagen y Sonido',
}

export enum AttendanceStatus {
  PRESENT = 'Presente',
  ABSENT = 'Ausente',
  JUSTIFIED = 'Justificado',
  PENDING_JUSTIFICATION = 'Pendiente',
}

export interface Career {
  id: string;
  name: CareerName;
  years: number[];
  theme: 'theme-dev' | 'theme-design';
}

export interface Subject {
  id: string;
  name: string;
  careerId: string;
  year: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password; // In a real app, this would be a hash
  role: Role;
  careerId: string;
  year: number;
}

export interface JustificationFile {
  name: string;
  type: string;
  content: string; // base64 encoded string
}

export interface AttendanceRecord {
  id: string;
  studentId: number;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  justificationReason?: string;
  justificationFile?: JustificationFile;
}

export interface NewsItem {
  id: string;
  text: string;
  careerId?: string; // Optional: for career-specific news
  year?: number;     // Optional: for year-specific news
  subjectId?: string; // Optional: for subject-specific news
}

export interface PrivateMessage {
  id: string;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: string;
  read: boolean;
}

export enum NotificationType {
  ANNOUNCEMENT = 'Anuncio',
  ABSENCE = 'Falta',
  JUSTIFICATION_APPROVED = 'Justificación Aprobada',
  JUSTIFICATION_REJECTED = 'Justificación Rechazada',
  JUSTIFICATION_REQUEST = 'Solicitud de Justificación',
  FORUM_THREAD_APPROVED = 'Publicación Aprobada',
  FORUM_THREAD_REJECTED = 'Publicación Rechazada',
  FORUM_THREAD_NEEDS_REVISION = 'Revisión de Publicación Solicitada',
  ATTENDANCE_WARNING = 'Alerta de Asistencia',
  ATTENDANCE_STATUS_LIBRE = 'Condición: Libre',
}

export interface Notification {
  id: string;
  userId: number; // The user who receives the notification
  type: NotificationType;
  text: string;
  details?: string; // Optional subtitle or details
  timestamp: string;
  read: boolean;
}

export interface PersonalLink {
  id: string;
  url: string;
  label: string;
}

export interface UserProfileData {
  profilePicture?: string; // base64
  bannerImage?: string; // base64
  bio?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  personalLinks?: PersonalLink[];
  profileAccentColor?: string;
  viewPermissions?: {
    overview?: boolean;
    classmates?: boolean;
    absences?: boolean;
    history?: boolean;
    stats?: boolean;
    agenda?: boolean;
    notes?: boolean;
    forums?: boolean;
    qrAttendance?: boolean;
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  lastModified: string;
}

export enum ForumThreadStatus {
  PENDING = 'Pendiente',
  APPROVED = 'Aprobado',
  REJECTED = 'Rechazado',
  NEEDS_REVISION = 'Necesita Revisión',
}

export interface ForumThread {
    id: string;
    authorId: number;
    title: string;
    content: string;
    timestamp: string;
    status: ForumThreadStatus;
    careerId: string;
    year: number;
    rejectionReason?: string;
    isLocked?: boolean;
}

export interface ForumReply {
    id: string;
    threadId: string;
    authorId: number;
    content: string;
    timestamp: string;
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface QRAttendanceSession {
    id: string;
    subjectId: string;
    preceptorId: number;
    createdAt: string; // ISO string
    expiresAt: string; // ISO string
    location: Coordinates;
    radius: number; // in meters
}

export interface ClassSchedule {
    subjectId: string;
    dayOfWeek: number; // 1 for Monday, 5 for Friday
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
    classroom: string;
}