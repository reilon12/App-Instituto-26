



import React, { useState, useEffect } from 'react';
import { Role, User, AttendanceRecord, Subject, NewsItem, PrivateMessage, AttendanceStatus, JustificationFile, Notification, NotificationType, UserProfileData, Note, ForumThread, ForumReply, ForumThreadStatus, QRAttendanceSession, Coordinates, ClassSchedule } from './types';
import { CAREERS, INITIAL_USERS, INITIAL_ATTENDANCE, SUBJECTS, NEWS_ITEMS, INITIAL_PRIVATE_MESSAGES, INITIAL_FORUM_THREADS, INITIAL_FORUM_REPLIES, ABSENCE_LIMIT, MINIMUM_PRESENTISM, CLASS_COUNT_THRESHOLD_FOR_LIBRE, CLASS_SCHEDULE, INITIAL_NOTIFICATIONS } from './constants';
import { AuthForm } from './components/AuthForm';
import { StudentDashboard } from './components/StudentDashboard';
import { PreceptorDashboard } from './components/PreceptorDashboard';
import InteractiveConstellation from './components/InteractiveConstellation';

export type Theme = 'celestial' | 'oscuro' | 'ensoñacion' | 'moderno' | 'fantasma' | 'rebelde';
export type BorderStyle = 'sencillo' | 'refinado' | 'gradiente' | 'neon' | 'acentuado' | 'doble';
export type FontStyle = 'predeterminado' | 'clasico' | 'moderno' | 'elegante' | 'tecnico' | 'amigable';

export const THEMES: Record<Theme, { name: string; accent: string; colors: { bg: string; primary: string; accent: string } }> = {
  celestial: { name: 'Celestial', accent: '#c09a58', colors: { bg: '#f3f4f6', primary: '#ffffff', accent: '#c09a58' } },
  oscuro: { name: 'Oscuro', accent: '#c09a58', colors: { bg: '#111827', primary: '#1f2937', accent: '#c09a58' } },
  ensoñacion: { name: 'Ensoñación', accent: '#db2777', colors: { bg: '#fdf2f8', primary: '#fce7f3', accent: '#db2777' } },
  moderno: { name: 'Enfoque', accent: '#22d3ee', colors: { bg: '#0f2e2b', primary: '#134e4a', accent: '#22d3ee' } },
  fantasma: { name: 'Fantasma', accent: '#e60060', colors: { bg: '#161625', primary: '#1e1e3f', accent: '#e60060' } },
  rebelde: { name: 'Rebelde', accent: '#f5d142', colors: { bg: '#100f1c', primary: '#1c1b29', accent: '#f5d142' } },
};

// --- QR Attendance Constants ---
const INSTITUTE_LOCATION: Coordinates = { latitude: -34.6037, longitude: -58.3816 }; // Obelisco, Buenos Aires
const VALID_RADIUS_METERS = 100;
const QR_SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// --- Helper function for distance calculation ---
const getDistance = (coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371e3; // metres
    const φ1 = coord1.latitude * Math.PI/180;
    const φ2 = coord2.latitude * Math.PI/180;
    const Δφ = (coord2.latitude-coord1.latitude) * Math.PI/180;
    const Δλ = (coord2.longitude-coord1.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in metres
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [userProfiles, setUserProfiles] = useState<Record<number, UserProfileData>>({});
  const [userNotes, setUserNotes] = useState<Record<number, Note[]>>({});

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);
  const [newsItems, setNewsItems] = useState<NewsItem[]>(NEWS_ITEMS);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>(INITIAL_PRIVATE_MESSAGES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [forumThreads, setForumThreads] = useState<ForumThread[]>(INITIAL_FORUM_THREADS);
  const [forumReplies, setForumReplies] = useState<ForumReply[]>(INITIAL_FORUM_REPLIES);
  const [qrSessions, setQrSessions] = useState<QRAttendanceSession[]>([]);
  const [classSchedule, setClassSchedule] = useState<ClassSchedule[]>(CLASS_SCHEDULE);
  
  const [theme, setTheme] = useState<Theme>('celestial');
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('sencillo');
  const [fontStyle, setFontStyle] = useState<FontStyle>('predeterminado');

  useEffect(() => {
    try {
      const savedProfiles = localStorage.getItem('user-profiles');
      if (savedProfiles) setUserProfiles(JSON.parse(savedProfiles));
      const savedNotes = localStorage.getItem('user-notes');
      if (savedNotes) setUserNotes(JSON.parse(savedNotes));
      const savedTheme = localStorage.getItem('app-theme') as Theme | null;
      if (savedTheme && THEMES[savedTheme]) setTheme(savedTheme);
      const savedBorderStyle = localStorage.getItem('app-border-style') as BorderStyle | null;
      if (savedBorderStyle) setBorderStyle(savedBorderStyle);
      const savedFontStyle = localStorage.getItem('app-font-style') as FontStyle | null;
      if (savedFontStyle) setFontStyle(savedFontStyle);
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('user-profiles', JSON.stringify(userProfiles)); }
    catch (error) { console.error("Failed to save profile data", error); }
  }, [userProfiles]);

  useEffect(() => {
    try { localStorage.setItem('user-notes', JSON.stringify(userNotes)); }
    catch (error) { console.error("Failed to save notes data", error); }
  }, [userNotes]);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-border-style', borderStyle);
    localStorage.setItem('app-border-style', borderStyle);
  }, [borderStyle]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-style', fontStyle);
    localStorage.setItem('app-font-style', fontStyle);
  }, [fontStyle]);

  const handleUpdateProfile = (userId: number, data: UserProfileData) => {
    setUserProfiles(prev => ({ ...prev, [userId]: data }));
  };

  const handleUpdateNotes = (userId: number, notes: Note[]) => {
    setUserNotes(prev => ({ ...prev, [userId]: notes }));
  };

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleRegister = (newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUser(newUser);
  };
  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(), read: false, ...notificationData,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationsAsRead = (userId: number) => {
    setNotifications(prev => prev.map(n => (n.userId === userId && !n.read ? { ...n, read: true } : n)));
  };
  
 const addAttendanceRecord = (studentId: number, status: AttendanceStatus, date: string, subjectId: string) => {
    const prevRecords = attendanceRecords;
    let wasAbsenceAddedOrUpdated = false;

    const nextRecords = [...prevRecords];
    const existingIndex = nextRecords.findIndex(r => r.studentId === studentId && r.date === date && r.subjectId === subjectId);

    if (existingIndex !== -1) {
        const oldStatus = nextRecords[existingIndex].status;
        if (oldStatus !== AttendanceStatus.ABSENT && status === AttendanceStatus.ABSENT) {
            wasAbsenceAddedOrUpdated = true;
        }
        nextRecords[existingIndex] = { ...nextRecords[existingIndex], status };
    } else {
        if (status === AttendanceStatus.ABSENT) {
            wasAbsenceAddedOrUpdated = true;
            const subjectName = subjects.find(s => s.id === subjectId)?.name || 'una materia';
            addNotification({ userId: studentId, type: NotificationType.ABSENCE, text: `Se ha registrado una nueva falta.`, details: `Materia: ${subjectName}` });
        }
        const newRecord = { id: `att-${studentId}-${subjectId}-${date}-${Math.random()}`, studentId, subjectId, date, status };
        nextRecords.push(newRecord);
    }
    
    setAttendanceRecords(nextRecords);

    if (wasAbsenceAddedOrUpdated) {
        const subjectName = subjects.find(s => s.id === subjectId)?.name || 'Materia Desconocida';

        const checkStudentStatus = (records: AttendanceRecord[]) => {
            const studentRecordsForSubject = records.filter(r => r.studentId === studentId && r.subjectId === subjectId);
            const total = studentRecordsForSubject.length;
            if (total === 0) return { absences: 0, attendancePercent: 100, isLibre: false, isWarningAbsences: false, isWarningPercent: false };
            
            const absences = studentRecordsForSubject.filter(r => r.status === AttendanceStatus.ABSENT).length;
            const present = studentRecordsForSubject.filter(r => r.status === AttendanceStatus.PRESENT).length;
            const justified = studentRecordsForSubject.filter(r => r.status === AttendanceStatus.JUSTIFIED || r.status === AttendanceStatus.PENDING_JUSTIFICATION).length;
            const attendancePercent = total > 0 ? ((present + justified) / total) * 100 : 100;

            const isLibre = (absences > ABSENCE_LIMIT) || (total >= CLASS_COUNT_THRESHOLD_FOR_LIBRE && attendancePercent < MINIMUM_PRESENTISM);
            const isWarningAbsences = (ABSENCE_LIMIT - absences) === 3;
            const isWarningPercent = total >= CLASS_COUNT_THRESHOLD_FOR_LIBRE && attendancePercent >= MINIMUM_PRESENTISM && attendancePercent < 75;

            return { absences, attendancePercent, isLibre, isWarningAbsences, isWarningPercent };
        };

        const currentState = checkStudentStatus(nextRecords);
        const previousState = checkStudentStatus(prevRecords);

        // Check for 'Libre' status change
        if (currentState.isLibre && !previousState.isLibre) {
            const reason = currentState.absences > ABSENCE_LIMIT ? `Has superado el límite de ${ABSENCE_LIMIT} faltas.` : `Tu presentismo (${currentState.attendancePercent.toFixed(1)}%) es menor al mínimo requerido.`;
            addNotification({
                userId: studentId, type: NotificationType.ATTENDANCE_STATUS_LIBRE, text: `Condición: Libre en ${subjectName}`, details: reason
            });
            return; // Don't send other warnings if libre
        }

        // Check for absence warning change
        if (currentState.isWarningAbsences && !previousState.isWarningAbsences) {
            addNotification({
                userId: studentId, type: NotificationType.ATTENDANCE_WARNING, text: `Alerta de Asistencia en ${subjectName}`, details: `Te quedan solo 3 faltas para alcanzar el límite.`
            });
        }
        
        // Check for percentage warning change
        if (currentState.isWarningPercent && !previousState.isWarningPercent) {
             addNotification({
                userId: studentId, type: NotificationType.ATTENDANCE_WARNING, text: `Alerta de Asistencia en ${subjectName}`, details: `Tu presentismo es del ${currentState.attendancePercent.toFixed(1)}%. ¡Cuidado! El mínimo es ${MINIMUM_PRESENTISM}%.`
            });
        }
    }
  };

  const updateAttendanceStatus = (recordId: string, newStatus: AttendanceStatus) => {
    setAttendanceRecords(prev => prev.map(r => (r.id === recordId ? { ...r, status: newStatus } : r)));
  };
  
  const requestJustification = (recordId: string, reason: string, file: JustificationFile) => {
    let student: User | undefined, preceptor: User | undefined, subjectName: string | undefined;
    setAttendanceRecords(prev => prev.map(r => {
        if (r.id === recordId) {
            student = users.find(u => u.id === r.studentId);
            preceptor = users.find(u => u.role === Role.PRECEPTOR && u.careerId === student?.careerId);
            subjectName = subjects.find(s => s.id === r.subjectId)?.name || 'una materia';
            return { ...r, status: AttendanceStatus.PENDING_JUSTIFICATION, justificationReason: reason, justificationFile: file };
        }
        return r;
      })
    );
    if (student && preceptor && subjectName) {
        addNotification({ userId: preceptor.id, type: NotificationType.JUSTIFICATION_REQUEST, text: `${student.name} ha solicitado una justificación.`, details: `Materia: ${subjectName}` });
    }
  };

  const resolveJustificationRequest = (recordId: string, approved: boolean) => {
    setAttendanceRecords(prev => {
        const recordToUpdate = prev.find(r => r.id === recordId);
        if (recordToUpdate) {
            const subjectName = subjects.find(s => s.id === recordToUpdate.subjectId)?.name || 'una materia';
            addNotification({ userId: recordToUpdate.studentId, type: approved ? NotificationType.JUSTIFICATION_APPROVED : NotificationType.JUSTIFICATION_REJECTED, text: `Tu solicitud de justificación ha sido ${approved ? 'aprobada' : 'rechazada'}.`, details: `Materia: ${subjectName}` });
        }
        return prev.map(r => r.id === recordId ? { ...r, status: approved ? AttendanceStatus.JUSTIFIED : AttendanceStatus.ABSENT, justificationReason: undefined, justificationFile: undefined } : r);
    });
  };

  const addNewsItem = (item: Omit<NewsItem, 'id'>) => {
    const newNewsItem: NewsItem = { id: `news-${Date.now()}`, ...item };
    setNewsItems(prev => [newNewsItem, ...prev]);
    const targetStudents = users.filter(u => u.role === Role.STUDENT && (!newNewsItem.careerId || u.careerId === newNewsItem.careerId) && (!newNewsItem.year || u.year === newNewsItem.year));
    targetStudents.forEach(student => addNotification({ userId: student.id, type: NotificationType.ANNOUNCEMENT, text: 'Nuevo anuncio', details: newNewsItem.text }));
  };
  
  const deleteNewsItem = (id: string) => setNewsItems(prev => prev.filter(item => item.id !== id));

  const sendPrivateMessage = (senderId: number, receiverId: number, text: string) => {
    const newMessage: PrivateMessage = { id: `msg-${Date.now()}`, senderId, receiverId, text, timestamp: new Date().toISOString(), read: false };
    setPrivateMessages(prev => [...prev, newMessage]);
  };
  
  const markMessagesAsRead = (readerId: number, chatterId: number) => {
    setPrivateMessages(prev => prev.map(msg => msg.receiverId === readerId && msg.senderId === chatterId && !msg.read ? { ...msg, read: true } : msg));
  };

  // --- QR Attendance Handlers ---
  const handleCreateQRSession = async (subjectId: string): Promise<QRAttendanceSession> => {
      if (!currentUser || currentUser.role !== Role.PRECEPTOR) throw new Error("Unauthorized");
      const now = new Date();
      const newSession: QRAttendanceSession = {
          id: `qr-session-${Date.now()}`,
          subjectId,
          preceptorId: currentUser.id,
          createdAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + QR_SESSION_DURATION_MS).toISOString(),
          location: INSTITUTE_LOCATION,
          radius: VALID_RADIUS_METERS,
      };
      setQrSessions(prev => [...prev, newSession]);
      return newSession;
  };
  
  const handleVerifyQRAttendance = async (qrData: string, location: Coordinates): Promise<string> => {
      if (!currentUser || currentUser.role !== Role.STUDENT) return 'error_invalid';
      try {
          const { sessionId } = JSON.parse(qrData);
          const session = qrSessions.find(s => s.id === sessionId);
          if (!session) return 'error_invalid';
          if (new Date().getTime() > new Date(session.expiresAt).getTime()) return 'error_expired';
          
          const distance = getDistance(location, session.location);
          if (distance > session.radius) return 'error_location';

          addAttendanceRecord(currentUser.id, AttendanceStatus.PRESENT, new Date().toISOString().split('T')[0], session.subjectId);
          return 'success';
          
      } catch (e) {
          console.error("QR verification failed", e);
          return 'error_invalid';
      }
  };

  
  // Forum handlers
  const addForumThread = (thread: Omit<ForumThread, 'id' | 'timestamp' | 'status' | 'isLocked'>) => {
    const newThread: ForumThread = {
      ...thread,
      id: `thread-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: ForumThreadStatus.PENDING,
      isLocked: false,
    };
    setForumThreads(prev => [newThread, ...prev]);
  };

  const editForumThread = (threadId: string, newTitle: string, newContent: string) => {
    setForumThreads(prev => prev.map(t => t.id === threadId ? { ...t, title: newTitle, content: newContent, status: ForumThreadStatus.PENDING, rejectionReason: undefined } : t));
  };

  const addForumReply = (reply: Omit<ForumReply, 'id' | 'timestamp'>) => {
    const newReply: ForumReply = {
      ...reply,
      id: `reply-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setForumReplies(prev => [...prev, newReply]);
  };

  const updateForumThreadStatus = (threadId: string, status: ForumThreadStatus, reason?: string) => {
    let threadToUpdate: ForumThread | undefined;
    setForumThreads(prev =>
      prev.map(t => {
        if (t.id === threadId) {
          threadToUpdate = { ...t, status, rejectionReason: reason || t.rejectionReason };
          return threadToUpdate;
        }
        return t;
      })
    );
    if (threadToUpdate) {
        const authorId = threadToUpdate.authorId;
        const threadTitle = threadToUpdate.title;
        if (status === ForumThreadStatus.APPROVED) {
            addNotification({ userId: authorId, type: NotificationType.FORUM_THREAD_APPROVED, text: 'Tu publicación del foro ha sido aprobada.', details: `Título: ${threadTitle}` });
        } else if (status === ForumThreadStatus.REJECTED) {
            addNotification({ userId: authorId, type: NotificationType.FORUM_THREAD_REJECTED, text: 'Tu publicación del foro ha sido rechazada.', details: reason || `Título: ${threadTitle}` });
        } else if (status === ForumThreadStatus.NEEDS_REVISION) {
            addNotification({ userId: authorId, type: NotificationType.FORUM_THREAD_NEEDS_REVISION, text: 'Se solicitaron cambios en tu publicación.', details: `Motivo: ${reason}` });
        }
    }
  };
  
  const toggleLockForumThread = (threadId: string) => {
    setForumThreads(prev => prev.map(t => t.id === threadId ? { ...t, isLocked: !t.isLocked } : t));
  };

  const deleteForumThread = (threadId: string) => {
    setForumThreads(prev => prev.filter(t => t.id !== threadId));
    setForumReplies(prev => prev.filter(r => r.threadId !== threadId));
  };
  
  const deleteForumReply = (replyId: string) => {
    setForumReplies(prev => prev.filter(r => r.id !== replyId));
  };

  return (
    <div className="min-h-screen text-[--color-text-primary] transition-colors duration-500">
      {currentUser && <InteractiveConstellation accentColor={THEMES[theme].accent} />}

      {currentUser ? (
          currentUser.role === Role.STUDENT ? (
            <StudentDashboard 
              user={currentUser}
              onLogout={handleLogout}
              allUsers={users}
              userProfiles={userProfiles}
              onUpdateProfile={handleUpdateProfile}
              userNotes={userNotes[currentUser.id] || []}
              onUpdateNotes={(notes) => handleUpdateNotes(currentUser.id, notes)}
              theme={theme} setTheme={setTheme}
              borderStyle={borderStyle} setBorderStyle={setBorderStyle}
              fontStyle={fontStyle} setFontStyle={setFontStyle}
              preceptor={users.find(u => u.role === Role.PRECEPTOR && u.careerId === currentUser.careerId) || null}
              attendanceRecords={attendanceRecords}
              subjects={subjects} 
              newsItems={newsItems} 
              privateMessages={privateMessages}
              notifications={notifications}
              sendPrivateMessage={sendPrivateMessage}
              markMessagesAsRead={markMessagesAsRead}
              markNotificationsAsRead={markNotificationsAsRead}
              requestJustification={requestJustification}
              onVerifyQRAttendance={handleVerifyQRAttendance}
              forumThreads={forumThreads}
              forumReplies={forumReplies}
              onAddForumThread={addForumThread}
              onEditForumThread={editForumThread}
              onAddForumReply={addForumReply}
              onDeleteForumThread={deleteForumThread}
              onDeleteForumReply={deleteForumReply}
              onToggleLockThread={toggleLockForumThread}
              classSchedule={classSchedule}
            />
          ) : (
             <PreceptorDashboard
                user={currentUser}
                onLogout={handleLogout}
                allUsers={users}
                userProfiles={userProfiles}
                onUpdateProfile={handleUpdateProfile}
                userNotes={userNotes[currentUser.id] || []}
                onUpdateNotes={(notes) => handleUpdateNotes(currentUser.id, notes)}
                theme={theme} setTheme={setTheme}
                borderStyle={borderStyle} setBorderStyle={setBorderStyle}
                fontStyle={fontStyle} setFontStyle={setFontStyle}
                students={users.filter(u => u.role === Role.STUDENT)}
                attendanceRecords={attendanceRecords}
                addAttendanceRecord={addAttendanceRecord}
                updateAttendanceStatus={updateAttendanceStatus}
                resolveJustificationRequest={resolveJustificationRequest}
                subjects={subjects}
                newsItems={newsItems}
                addNewsItem={addNewsItem}
                deleteNewsItem={deleteNewsItem}
                privateMessages={privateMessages}
                notifications={notifications}
                sendPrivateMessage={sendPrivateMessage}
                markMessagesAsRead={markMessagesAsRead}
                markNotificationsAsRead={markNotificationsAsRead}
                onCreateQRSession={handleCreateQRSession}
                forumThreads={forumThreads}
                forumReplies={forumReplies}
                onUpdateForumThreadStatus={updateForumThreadStatus}
                onAddForumReply={addForumReply}
                onDeleteForumThread={deleteForumThread}
                onDeleteForumReply={deleteForumReply}
                classSchedule={classSchedule}
            />
          )
      ) : (
        <AuthForm onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </div>
  );
}