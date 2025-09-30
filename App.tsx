import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, doc, addDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
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
  const [users, setUsers] = useState<User[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<number, UserProfileData>>({});
  const [userNotes, setUserNotes] = useState<Record<number, Note[]>>({});

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [forumReplies, setForumReplies] = useState<ForumReply[]>([]);
  const [qrSessions, setQrSessions] = useState<QRAttendanceSession[]>([]);
  const [classSchedule, setClassSchedule] = useState<ClassSchedule[]>([]);
  
  const [theme, setTheme] = useState<Theme>('celestial');
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('sencillo');
  const [fontStyle, setFontStyle] = useState<FontStyle>('predeterminado');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme') as Theme | null;
      if (savedTheme && THEMES[savedTheme]) setTheme(savedTheme);
      const savedBorderStyle = localStorage.getItem('app-border-style') as BorderStyle | null;
      if (savedBorderStyle) setBorderStyle(savedBorderStyle);
      const savedFontStyle = localStorage.getItem('app-font-style') as FontStyle | null;
      if (savedFontStyle) setFontStyle(savedFontStyle);
    } catch (error) {
      console.error("Failed to load appearance data from localStorage", error);
    }

    const seedDatabase = async () => {
      if (localStorage.getItem('isDbSeeded-v2')) return;

      console.log("Seeding Firestore with initial data...");
      try {
        const batch = writeBatch(db);
        
        const seedCollection = (collectionName: string, data: any[], idField: string) => {
            data.forEach(item => {
                const docRef = doc(db, collectionName, String(item[idField]));
                batch.set(docRef, item);
            });
        };

        seedCollection('users', INITIAL_USERS, 'id');
        seedCollection('attendanceRecords', INITIAL_ATTENDANCE, 'id');
        seedCollection('subjects', SUBJECTS, 'id');
        seedCollection('newsItems', NEWS_ITEMS, 'id');
        seedCollection('notifications', INITIAL_NOTIFICATIONS, 'id');
        seedCollection('forumThreads', INITIAL_FORUM_THREADS, 'id');
        seedCollection('forumReplies', INITIAL_FORUM_REPLIES, 'id');
        CLASS_SCHEDULE.forEach(item => {
            const docRef = doc(collection(db, "classSchedule")); // auto-id
            batch.set(docRef, item);
        });
        
        await batch.commit();
        localStorage.setItem('isDbSeeded-v2', 'true');
        console.log("Firestore seeded successfully.");
      } catch (error) {
        console.error("Error seeding database:", error);
      }
    };
    seedDatabase();

    const setupSubscription = (collectionName: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
      const q = collection(db, collectionName);
      return onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setter(data as any);
      });
    };

    const unsubProfiles = onSnapshot(collection(db, 'userProfiles'), (snapshot) => {
        const profiles: Record<number, UserProfileData> = {};
        snapshot.docs.forEach(doc => { profiles[Number(doc.id)] = doc.data() as UserProfileData; });
        setUserProfiles(profiles);
    });
    const unsubNotes = onSnapshot(collection(db, 'userNotes'), (snapshot) => {
        const notes: Record<number, Note[]> = {};
        snapshot.docs.forEach(doc => { notes[Number(doc.id)] = (doc.data().notes || []) as Note[]; });
        setUserNotes(notes);
    });

    const unsubs = [
        setupSubscription('users', setUsers),
        setupSubscription('attendanceRecords', setAttendanceRecords),
        setupSubscription('subjects', setSubjects),
        setupSubscription('newsItems', setNewsItems),
        setupSubscription('privateMessages', setPrivateMessages),
        setupSubscription('notifications', setNotifications),
        setupSubscription('forumThreads', setForumThreads),
        setupSubscription('forumReplies', setForumReplies),
        setupSubscription('qrSessions', setQrSessions),
        setupSubscription('classSchedule', setClassSchedule),
        unsubProfiles,
        unsubNotes,
    ];

    return () => unsubs.forEach(unsub => unsub());

  }, []);
  
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

  const handleUpdateProfile = async (userId: number, data: UserProfileData) => {
    await setDoc(doc(db, "userProfiles", String(userId)), data, { merge: true });
  };

  const handleUpdateNotes = async (userId: number, notes: Note[]) => {
    await setDoc(doc(db, "userNotes", String(userId)), { notes });
  };

  const handleLogin = (user: User) => setCurrentUser(user);
  
  const handleRegister = async (newUser: User) => {
    await setDoc(doc(db, "users", String(newUser.id)), newUser);
    setCurrentUser(newUser);
  };
  const handleLogout = () => setCurrentUser(null);
  
  const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Omit<Notification, 'id'> = {
      timestamp: new Date().toISOString(), read: false, ...notificationData,
    };
    await addDoc(collection(db, "notifications"), newNotification);
  };

  const markNotificationsAsRead = async (userId: number) => {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const batch = writeBatch(db);
    snapshot.docs.forEach(document => batch.update(document.ref, { read: true }));
    await batch.commit();
  };
  
  const addAttendanceRecord = async (studentId: number, status: AttendanceStatus, date: string, subjectId: string) => {
    const q = query(collection(db, "attendanceRecords"), 
      where("studentId", "==", studentId), 
      where("date", "==", date), 
      where("subjectId", "==", subjectId)
    );
    const querySnapshot = await getDocs(q);
    const existingRecordDoc = querySnapshot.docs[0];

    if (existingRecordDoc) {
      if (existingRecordDoc.data().status !== status) {
        await updateDoc(existingRecordDoc.ref, { status });
      }
    } else {
      const newRecord = { 
        id: `att-${studentId}-${subjectId}-${date}-${Math.random()}`, 
        studentId, subjectId, date, status 
      };
      await setDoc(doc(db, "attendanceRecords", newRecord.id), newRecord);
    }
  };

  const updateAttendanceStatus = async (recordId: string, newStatus: AttendanceStatus) => {
    await updateDoc(doc(db, "attendanceRecords", recordId), { status: newStatus });
  };
  
  const requestJustification = async (recordId: string, reason: string, file: JustificationFile) => {
    const recordRef = doc(db, "attendanceRecords", recordId);
    await updateDoc(recordRef, { status: AttendanceStatus.PENDING_JUSTIFICATION, justificationReason: reason, justificationFile: file });
    
    const record = attendanceRecords.find(r => r.id === recordId);
    if (record) {
      const student = users.find(u => u.id === record.studentId);
      const preceptor = users.find(u => u.role === Role.PRECEPTOR && u.careerId === student?.careerId);
      const subjectName = subjects.find(s => s.id === record.subjectId)?.name || 'una materia';
      if (student && preceptor) {
        addNotification({ userId: preceptor.id, type: NotificationType.JUSTIFICATION_REQUEST, text: `${student.name} ha solicitado una justificación.`, details: `Materia: ${subjectName}` });
      }
    }
  };

  const resolveJustificationRequest = async (recordId: string, approved: boolean) => {
    const record = attendanceRecords.find(r => r.id === recordId);
    if (record) {
      const subjectName = subjects.find(s => s.id === record.subjectId)?.name || 'una materia';
      addNotification({ userId: record.studentId, type: approved ? NotificationType.JUSTIFICATION_APPROVED : NotificationType.JUSTIFICATION_REJECTED, text: `Tu solicitud de justificación ha sido ${approved ? 'aprobada' : 'rechazada'}.`, details: `Materia: ${subjectName}` });
      await updateDoc(doc(db, "attendanceRecords", recordId), { status: approved ? AttendanceStatus.JUSTIFIED : AttendanceStatus.ABSENT, justificationReason: '', justificationFile: null });
    }
  };

  const addNewsItem = async (item: Omit<NewsItem, 'id'>) => {
    const docRef = await addDoc(collection(db, "newsItems"), item);
    const newNewsItem = { id: docRef.id, ...item };
    const targetStudents = users.filter(u => u.role === Role.STUDENT && (!newNewsItem.careerId || u.careerId === newNewsItem.careerId) && (!newNewsItem.year || u.year === newNewsItem.year));
    targetStudents.forEach(student => addNotification({ userId: student.id, type: NotificationType.ANNOUNCEMENT, text: 'Nuevo anuncio', details: newNewsItem.text }));
  };
  
  const deleteNewsItem = async (id: string) => await deleteDoc(doc(db, "newsItems", id));

  const sendPrivateMessage = async (senderId: number, receiverId: number, text: string) => {
    const newMessage: Omit<PrivateMessage, 'id'> = { senderId, receiverId, text, timestamp: new Date().toISOString(), read: false };
    await addDoc(collection(db, "privateMessages"), newMessage);
  };
  
  const markMessagesAsRead = async (readerId: number, chatterId: number) => {
    const q = query(collection(db, "privateMessages"), where("receiverId", "==", readerId), where("senderId", "==", chatterId), where("read", "==", false));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const batch = writeBatch(db);
    snapshot.docs.forEach(document => batch.update(document.ref, { read: true }));
    await batch.commit();
  };

  const handleCreateQRSession = async (subjectId: string): Promise<QRAttendanceSession> => {
      if (!currentUser || currentUser.role !== Role.PRECEPTOR) throw new Error("Unauthorized");
      const now = new Date();
      const newSession: QRAttendanceSession = {
          id: `qr-session-${Date.now()}`, subjectId, preceptorId: currentUser.id, createdAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + QR_SESSION_DURATION_MS).toISOString(), location: INSTITUTE_LOCATION, radius: VALID_RADIUS_METERS,
      };
      await setDoc(doc(db, 'qrSessions', newSession.id), newSession);
      return newSession;
  };
  
  const handleVerifyQRAttendance = async (qrData: string, location: Coordinates): Promise<string> => {
      if (!currentUser || currentUser.role !== Role.STUDENT) return 'error_invalid';
      try {
          const { sessionId } = JSON.parse(qrData);
          const session = qrSessions.find(s => s.id === sessionId);
          if (!session) return 'error_invalid';
          if (new Date().getTime() > new Date(session.expiresAt).getTime()) return 'error_expired';
          if (getDistance(location, session.location) > session.radius) return 'error_location';
          addAttendanceRecord(currentUser.id, AttendanceStatus.PRESENT, new Date().toISOString().split('T')[0], session.subjectId);
          return 'success';
      } catch (e) {
          return 'error_invalid';
      }
  };
  
  const addForumThread = async (thread: Omit<ForumThread, 'id' | 'timestamp' | 'status' | 'isLocked'>) => {
    const newThread: Omit<ForumThread, 'id'> = {
      ...thread, timestamp: new Date().toISOString(), status: ForumThreadStatus.PENDING, isLocked: false,
    };
    await addDoc(collection(db, 'forumThreads'), newThread);
  };

  const editForumThread = async (threadId: string, newTitle: string, newContent: string) => {
    await updateDoc(doc(db, "forumThreads", threadId), { title: newTitle, content: newContent, status: ForumThreadStatus.PENDING, rejectionReason: '' });
  };

  const addForumReply = async (reply: Omit<ForumReply, 'id' | 'timestamp'>) => {
    const newReply: Omit<ForumReply, 'id'> = { ...reply, timestamp: new Date().toISOString() };
    await addDoc(collection(db, 'forumReplies'), newReply);
  };

  const updateForumThreadStatus = async (threadId: string, status: ForumThreadStatus, reason?: string) => {
    await updateDoc(doc(db, 'forumThreads', threadId), { status, rejectionReason: reason || '' });
    const threadToUpdate = forumThreads.find(t => t.id === threadId);
    if (threadToUpdate) {
        const { authorId, title } = threadToUpdate;
        if (status === ForumThreadStatus.APPROVED) addNotification({ userId: authorId, type: NotificationType.FORUM_THREAD_APPROVED, text: 'Tu publicación del foro ha sido aprobada.', details: `Título: ${title}` });
        else if (status === ForumThreadStatus.REJECTED) addNotification({ userId: authorId, type: NotificationType.FORUM_THREAD_REJECTED, text: 'Tu publicación del foro ha sido rechazada.', details: reason || `Título: ${title}` });
        else if (status === ForumThreadStatus.NEEDS_REVISION) addNotification({ userId: authorId, type: NotificationType.FORUM_THREAD_NEEDS_REVISION, text: 'Se solicitaron cambios en tu publicación.', details: `Motivo: ${reason}` });
    }
  };
  
  const toggleLockForumThread = async (threadId: string) => {
    const thread = forumThreads.find(t => t.id === threadId);
    if (thread) await updateDoc(doc(db, "forumThreads", threadId), { isLocked: !thread.isLocked });
  };

  const deleteForumThread = async (threadId: string) => {
    await deleteDoc(doc(db, "forumThreads", threadId));
    const repliesToDelete = query(collection(db, "forumReplies"), where("threadId", "==", threadId));
    const snapshot = await getDocs(repliesToDelete);
    const batch = writeBatch(db);
    snapshot.docs.forEach(document => batch.delete(document.ref));
    await batch.commit();
  };
  
  const deleteForumReply = async (replyId: string) => await deleteDoc(doc(db, "forumReplies", replyId));

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
        <AuthForm onLogin={handleLogin} onRegister={handleRegister} users={users} />
      )}
    </div>
  );
}
