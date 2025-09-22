







import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, AttendanceRecord, AttendanceStatus, Role, Subject, NewsItem, PrivateMessage, Notification, UserProfileData, Note, ForumThread, ForumReply, ForumThreadStatus, QRAttendanceSession, ClassSchedule } from '../types';
import { CAREERS, ABSENCE_LIMIT, MINIMUM_PRESENTISM, CLASS_COUNT_THRESHOLD_FOR_LIBRE } from '../constants';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, DownloadIcon, MegaphoneIcon, TrashIcon, MessageSquareIcon, SendIcon, PencilIcon, ClockIcon, SparklesIcon, ChartBarIcon, HomeIcon, UsersIcon, BookOpenIcon, AppearanceIcon, AlertTriangleIcon, InboxIcon, BellIcon, UserIcon, ChevronDownIcon, LogoutIcon, CalendarIcon, StickyNoteIcon, ShieldCheckIcon, ChatBubbleIcon, QRIcon } from './Icons';
import { HistoryView } from './HistoryView';
import { GoogleGenAI, Type } from "@google/genai";
import { Theme, BorderStyle, FontStyle } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { ProfileView } from './ProfileView';
import { AgendaView } from './AgendaView';
import { NotesView } from './NotesView';
import { AppearanceView } from './AppearanceModal';
import { ForumsView } from './ForumsView';

interface PreceptorDashboardProps {
  user: User;
  onLogout: () => void;
  allUsers: User[];
  userProfiles: Record<number, UserProfileData>;
  onUpdateProfile: (userId: number, data: UserProfileData) => void;
  userNotes: Note[];
  onUpdateNotes: (notes: Note[]) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  borderStyle: BorderStyle;
  setBorderStyle: (style: BorderStyle) => void;
  fontStyle: FontStyle;
  setFontStyle: (style: FontStyle) => void;
  students: User[];
  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (studentId: number, status: AttendanceStatus, date: string, subjectId: string) => void;
  updateAttendanceStatus: (recordId: string, newStatus: AttendanceStatus) => void;
  resolveJustificationRequest: (recordId: string, approved: boolean) => void;
  subjects: Subject[];
  newsItems: NewsItem[];
  addNewsItem: (item: Omit<NewsItem, 'id'>) => void;
  deleteNewsItem: (id: string) => void;
  privateMessages: PrivateMessage[];
  notifications: Notification[];
  sendPrivateMessage: (senderId: number, receiverId: number, text: string) => void;
  markMessagesAsRead: (readerId: number, chatterId: number) => void;
  markNotificationsAsRead: (userId: number) => void;
  onCreateQRSession: (subjectId: string) => Promise<QRAttendanceSession>;
  forumThreads: ForumThread[];
  forumReplies: ForumReply[];
  onUpdateForumThreadStatus: (threadId: string, status: ForumThreadStatus, reason?: string) => void;
  onAddForumReply: (reply: Omit<ForumReply, 'id' | 'timestamp'>) => void;
  onDeleteForumThread: (threadId: string) => void;
  onDeleteForumReply: (replyId: string) => void;
  classSchedule: ClassSchedule[];
}

const StudentCard: React.FC<{ student: User; status: AttendanceStatus | null; onSetStatus: (status: AttendanceStatus) => void; isLibre: boolean; }> = ({ student, status, onSetStatus, isLibre }) => {
  const getButtonClass = (buttonStatus: AttendanceStatus) => {
    if (status === buttonStatus) {
      if(status === AttendanceStatus.PRESENT) return 'bg-green-500 text-white scale-110 ring-2 ring-green-400';
      if(status === AttendanceStatus.ABSENT) return 'bg-red-500 text-white scale-110 ring-2 ring-red-400';
      if(status === AttendanceStatus.JUSTIFIED) return 'bg-yellow-500 text-white scale-110 ring-2 ring-yellow-400';
    }
    return 'bg-[--color-secondary] hover:bg-[--color-border] text-[--color-text-primary]';
  };
  return (
    <div className={`bg-[--color-primary] p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg border ${isLibre ? 'border-red-500/50 opacity-70' : 'border-transparent hover:border-[--color-border]'}`}>
      <div className="text-center sm:text-left"><p className="font-bold text-lg text-[--color-text-primary]">{student.name}</p><p className="text-sm text-[--color-text-secondary]">{student.email}</p></div>
       {isLibre ? (
          <div className="bg-red-500/10 text-red-600 font-bold px-4 py-2 rounded-lg text-sm">
              LIBRE
          </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => onSetStatus(AttendanceStatus.PRESENT)} className={`p-2 rounded-full transition-all duration-200 ${getButtonClass(AttendanceStatus.PRESENT)}`} aria-label="Marcar Presente"><CheckCircleIcon className="w-6 h-6" /></button>
          <button onClick={() => onSetStatus(AttendanceStatus.ABSENT)} className={`p-2 rounded-full transition-all duration-200 ${getButtonClass(AttendanceStatus.ABSENT)}`} aria-label="Marcar Ausente"><XCircleIcon className="w-6 h-6" /></button>
          <button onClick={() => onSetStatus(AttendanceStatus.JUSTIFIED)} className={`p-2 rounded-full transition-all duration-200 ${getButtonClass(AttendanceStatus.JUSTIFIED)}`} aria-label="Marcar Justificado"><MinusCircleIcon className="w-6 h-6" /></button>
        </div>
      )}
    </div>
  );
};

const JustificationManager: React.FC<{ students: User[]; records: AttendanceRecord[]; subjects: Subject[]; onResolve: (recordId: string, approved: boolean) => void; }> = ({ students, records, subjects, onResolve }) => {
  const pendingRecords = useMemo(() => records.filter(r => r.status === AttendanceStatus.PENDING_JUSTIFICATION).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [records]);
  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);
  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
  const handleDownload = (record: AttendanceRecord) => {
    if (!record.justificationFile) return;
    const { content, type, name } = record.justificationFile;
    const byteCharacters = atob(content);
    const byteNumbers = Array.from({length: byteCharacters.length}, (_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = name;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };
  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold text-[--color-text-primary] mb-4 flex items-center gap-2"><ClockIcon className="w-6 h-6 text-[--color-accent]"/> Solicitudes de Justificación Pendientes</h2>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {pendingRecords.length > 0 ? pendingRecords.map(record => (
          <div key={record.id} className="bg-[--color-secondary] p-5 rounded-lg border border-[--color-border]">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <p className="font-bold text-lg text-[--color-text-primary]">{studentMap.get(record.studentId) || 'Alumno Desconocido'}</p>
                <p className="text-sm text-[--color-text-secondary]">{subjectMap.get(record.subjectId) || 'Materia'} - {new Date(record.date + 'T00:00:00').toLocaleDateString('es-AR')}</p>
              </div>
              <button onClick={() => handleDownload(record)} disabled={!record.justificationFile} className="btn btn-secondary text-sm px-3 py-2"><DownloadIcon className="w-5 h-5" /> Ver Certificado</button>
            </div>
            <div className="bg-white p-3 rounded-md mb-4 border border-[--color-border]"><p className="text-sm font-semibold text-[--color-text-primary] mb-1">Motivo:</p><p className="text-[--color-text-secondary]">{record.justificationReason}</p></div>
            <div className="flex justify-end gap-3">
              <button onClick={() => onResolve(record.id, false)} className="btn btn-danger font-bold">Rechazar</button>
              <button onClick={() => onResolve(record.id, true)} className="btn btn-success font-bold">Aprobar</button>
            </div>
          </div>
        )) : <p className="text-center text-[--color-text-secondary] py-12">No hay solicitudes pendientes.</p>}
      </div>
    </div>
  );
}

const AnnouncementsManager: React.FC<{newsItems: NewsItem[], addNewsItem: Function, deleteNewsItem: Function}> = ({ newsItems, addNewsItem, deleteNewsItem }) => {
    const [text, setText] = useState('');
    const [targetCareer, setTargetCareer] = useState('all');
    const [targetYear, setTargetYear] = useState('all');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); if (text.trim() === '') return;
        addNewsItem({ text, careerId: targetCareer === 'all' ? undefined : targetCareer, year: targetYear === 'all' ? undefined : Number(targetYear) });
        setText(''); setTargetCareer('all'); setTargetYear('all');
    };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <form onSubmit={handleSubmit} className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4 text-[--color-text-primary] flex items-center gap-2"><MegaphoneIcon /> Crear Anuncio</h3>
                    <div className="space-y-4">
                        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe tu anuncio aquí..." rows={4} className="w-full input-styled" />
                         <select value={targetCareer} onChange={e => setTargetCareer(e.target.value)} className="w-full input-styled">
                            <option value="all">Para: Todas las carreras</option>
                            {CAREERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select value={targetYear} onChange={e => setTargetYear(e.target.value)} className="w-full input-styled">
                            <option value="all">Para: Todos los años</option>
                            <option value="1">1° Año</option> <option value="2">2° Año</option> <option value="3">3° Año</option>
                        </select>
                        <button type="submit" className="btn btn-primary w-full py-3 font-bold">Publicar Anuncio</button>
                    </div>
                </form>
            </div>
            <div className="lg:col-span-2 glass-card p-6">
                 <h3 className="text-xl font-semibold mb-4 text-[--color-text-primary]">Anuncios Activos</h3>
                 <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {newsItems.length > 0 ? newsItems.map(item => (
                        <div key={item.id} className="bg-[--color-secondary] p-4 rounded-lg flex justify-between items-start gap-4 border border-[--color-border]">
                            <div>
                                <p className="text-[--color-text-primary]">{item.text}</p>
                                <p className="text-xs text-[--color-text-secondary] mt-1">{item.careerId ? CAREERS.find(c=>c.id === item.careerId)?.name.split(' ').pop() : 'General'}{item.year ? ` - ${item.year}° Año` : ''}</p>
                            </div>
                            <button onClick={() => deleteNewsItem(item.id)} className="text-red-500 hover:text-red-600 transition-colors p-1 shrink-0"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    )) : <p className="text-[--color-text-secondary] text-center py-8">No hay anuncios activos.</p>}
                 </div>
            </div>
        </div>
    );
};

const EditAttendanceModal: React.FC<{ student: User; records: AttendanceRecord[]; subjects: Subject[]; onClose: () => void; onUpdateStatus: (recordId: string, newStatus: AttendanceStatus) => void; }> = ({ student, records: allRecords, subjects, onClose, onUpdateStatus }) => {
    const studentRecords = useMemo(() => allRecords.filter(r => r.studentId === student.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [allRecords, student.id]);
    const subjectMap = useMemo(() => subjects.reduce((map, sub) => ({ ...map, [sub.id]: sub.name }), {} as Record<string, string>), [subjects]);
    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" style={{animationDuration: '0.2s'}} onClick={onClose}>
            <div className="glass-card w-full max-w-4xl flex flex-col h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[--color-border] flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[--color-text-primary]">Modificar Asistencia de {student.name}</h2>
                        <p className="text-sm text-[--color-text-secondary]">Haz clic en el estado para cambiarlo.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors text-2xl">&times;</button>
                </header>
                <div className="flex-1 p-4 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-[--color-primary]/80 backdrop-blur-lg border-b border-[--color-border]"><tr><th className="p-3 text-sm font-semibold text-[--color-text-secondary]">Fecha</th><th className="p-3 text-sm font-semibold text-[--color-text-secondary]">Materia</th><th className="p-3 text-sm font-semibold text-[--color-text-secondary]">Estado</th></tr></thead>
                        <tbody>
                            {studentRecords.map(record => (
                                <tr key={record.id} className="border-b border-[--color-border]">
                                    <td className="p-3 text-[--color-text-primary]">{new Date(record.date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                                    <td className="p-3 text-[--color-text-secondary]">{subjectMap[record.subjectId]}</td>
                                    <td className="p-3">
                                        <select value={record.status} onChange={e => onUpdateStatus(record.id, e.target.value as AttendanceStatus)} className="bg-[--color-secondary] text-[--color-text-primary] border border-[--color-border] rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[--color-accent]">
                                            <option value={AttendanceStatus.PRESENT}>Presente</option><option value={AttendanceStatus.ABSENT}>Ausente</option><option value={AttendanceStatus.JUSTIFIED}>Justificado</option><option value={AttendanceStatus.PENDING_JUSTIFICATION}>Pendiente</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ChatModal: React.FC<{ user: User; student: User; messages: PrivateMessage[]; onClose: () => void; onSendMessage: (text: string) => void; onEditAttendance: () => void; }> = ({ user, student, messages, onClose, onSendMessage, onEditAttendance }) => {
    const [newMessage, setNewMessage] = useState('');
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const conversation = useMemo(() => messages.filter(m => (m.senderId === user.id && m.receiverId === student.id) || (m.senderId === student.id && m.receiverId === user.id)).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), [messages, user.id, student.id]);
    useEffect(() => { if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight; }, [conversation]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (newMessage.trim()) { onSendMessage(newMessage.trim()); setNewMessage(''); } };
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-in" style={{animationDuration: '0.3s'}} onClick={onClose}>
            <div className="glass-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col h-[80vh] sm:h-auto sm:max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-[--color-border] flex justify-between items-center">
                    <div><h2 className="text-xl font-bold text-[--color-text-primary]">Chat con {student.name}</h2></div>
                    <div className="flex items-center gap-2">
                        <button onClick={onEditAttendance} title="Modificar Asistencias" className="text-[--color-text-secondary] hover:text-[--color-text-primary] p-2 rounded-full hover:bg-black/5 transition-colors"><PencilIcon className="w-5 h-5"/></button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors text-2xl">&times;</button>
                    </div>
                </header>
                <div ref={chatBodyRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {conversation.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user.id ? 'justify-end' : ''}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.senderId === user.id ? 'bg-[--color-accent] text-white rounded-br-lg' : 'bg-[--color-secondary] text-[--color-text-primary] rounded-bl-lg'}`}>
                                <p>{msg.text}</p>
                                <p className={`text-xs mt-1 text-right ${msg.senderId === user.id ? 'opacity-70' : 'text-[--color-text-secondary]'}`}>{new Date(msg.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="p-4 border-t border-[--color-border] flex items-center gap-2">
                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="w-full bg-[--color-secondary] text-[--color-text-primary] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[--color-accent] border border-[--color-border]" />
                    <button type="submit" className="bg-[--color-accent] p-2 rounded-full text-white hover:bg-[--color-accent-hover] transition-colors shrink-0"><SendIcon className="w-6 h-6"/></button>
                </form>
            </div>
        </div>
    );
};

interface AIInsight { studentName: string; studentId: number; summary: string; reason: string; suggestion: string; }

const AIInsightsView: React.FC<{ students: User[]; allStudents: User[]; records: AttendanceRecord[]; onOpenChat: (student: User) => void; year: number; }> = ({ students, allStudents, records, onOpenChat, year }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<AIInsight[] | null>(null);
  const studentMap = useMemo(() => new Map(allStudents.map(s => [s.id, s])), [allStudents]);
  const generateInsights = async () => {
    setIsLoading(true); setError(null); setInsights(null);
    try {
        const studentData = students.map(student => {
            const studentRecords = records.filter(r => r.studentId === student.id);
            const presents = studentRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
            const justified = studentRecords.filter(r => r.status === AttendanceStatus.JUSTIFIED || r.status === AttendanceStatus.PENDING_JUSTIFICATION).length;
            const absences = studentRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
            const total = studentRecords.length;
            const attendancePercent = total > 0 ? ((presents + justified) / total) * 100 : 100;
            return { id: student.id, name: student.name, totalClasses: total, absences, attendancePercent };
        });

        if (studentData.length === 0) { setError("No hay datos de alumnos para analizar en este curso."); setIsLoading(false); return; }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const newPrompt = `Eres un asistente de preceptor. Analiza los datos de asistencia de alumnos. Identifica a aquellos en situación académica comprometida. La regla es que un alumno queda "libre" en una materia si tiene más de ${ABSENCE_LIMIT} ausencias, o si después de ${CLASS_COUNT_THRESHOLD_FOR_LIBRE} clases en esa materia su presentismo es inferior al ${MINIMUM_PRESENTISM}%. Basado en los datos generales provistos, infiere qué alumnos están en riesgo de quedar libres en alguna materia y necesitan atención. Para cada alumno identificado, proporciona un resumen, la razón de tu preocupación y una sugerencia de acción. No incluyas alumnos con buen rendimiento. Datos: ${JSON.stringify(studentData)}`;

        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: newPrompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { atRiskStudents: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { studentId: { type: Type.NUMBER }, studentName: { type: Type.STRING }, summary: { type: Type.STRING }, reason: { type: Type.STRING }, suggestion: { type: Type.STRING } }, propertyOrdering: ["studentId", "studentName", "summary", "reason", "suggestion"] } } }, propertyOrdering: ["atRiskStudents"] } }
        });
        // Safely parse the JSON response from Gemini API to ensure the `insights` state is correctly typed as an array.
        const parsedResponse = JSON.parse(response.text.trim());
        if (Array.isArray(parsedResponse?.atRiskStudents)) {
            setInsights(parsedResponse.atRiskStudents);
        } else {
            setInsights([]);
        }
    } catch (e) { console.error(e); setError("Ocurrió un error al generar el análisis. Inténtalo de nuevo."); } finally { setIsLoading(false); }
  }
  return (
    <div className="glass-card p-6">
        <div className="text-center">
            <SparklesIcon className="w-12 h-12 mx-auto text-[--color-accent] mb-2" />
            <h2 className="text-2xl font-bold text-[--color-text-primary]">Análisis de Asistencia con IA</h2>
            <p className="text-[--color-text-secondary] mt-2 max-w-2xl mx-auto">Esta herramienta utiliza IA para analizar los patrones de asistencia de los alumnos del {year}° año e identificar a aquellos que podrían necesitar apoyo.</p>
            <button onClick={generateInsights} disabled={isLoading} className="btn btn-primary mt-6 py-3 px-6 font-bold">{isLoading ? 'Analizando...' : 'Generar Análisis'}</button>
        </div>
        {isLoading && <div className="text-center py-12 text-lg font-semibold text-[--color-text-secondary]">Analizando datos...</div>}
        {error && <div className="text-center py-12 text-red-500">{error}</div>}
        {insights && <div className="mt-8">{insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insights.map(insight => {
                    const student = studentMap.get(insight.studentId);
                    return (
                        <div key={insight.studentId} className="bg-[--color-secondary] border border-[--color-border] p-5 rounded-lg flex flex-col gap-4 animate-fade-in-up">
                            <div><h3 className="font-bold text-[--color-text-primary] text-xl">{insight.studentName}</h3><p className="text-sm font-semibold text-red-500">{insight.summary}</p></div>
                            <div className="bg-white p-3 rounded-md text-sm border border-[--color-border]"><p className="font-semibold text-[--color-text-primary] mb-1">Razón:</p><p className="text-[--color-text-secondary]">{insight.reason}</p></div>
                            <div className="bg-white p-3 rounded-md text-sm border border-[--color-border]"><p className="font-semibold text-[--color-text-primary] mb-1">Sugerencia:</p><p className="text-[--color-text-secondary]">{insight.suggestion}</p></div>
                            {student && <button onClick={() => onOpenChat(student)} className="btn btn-primary mt-auto w-full"><MessageSquareIcon className="w-5 h-5"/> Chatear con {student.name.split(' ')[0]}</button>}
                        </div>
                    );
                })}
            </div>
        ) : <div className="text-center py-12"><CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-2"/><p className="text-lg font-semibold text-green-600">¡Todo en orden!</p><p className="text-[--color-text-secondary]">No se detectaron patrones de ausentismo preocupantes.</p></div>}</div>}
    </div>
  );
};

const StudentProgressView: React.FC<{ students: User[]; records: AttendanceRecord[]; year: number; onOpenChat: (student: User) => void; onViewProfile: (student: User) => void; onConfigureStudent: (student: User) => void; }> = ({ students, records, year, onOpenChat, onViewProfile, onConfigureStudent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const studentStats = useMemo(() => students.map(student => {
        const studentRecords = records.filter(r => r.studentId === student.id), total = studentRecords.length;
        if (total === 0) return { student, total: 0, absent: 0, presentP: 0, absentP: 0, justifiedP: 0 };
        const absent = studentRecords.filter(r => r.status === AttendanceStatus.ABSENT).length, present = studentRecords.filter(r => r.status === AttendanceStatus.PRESENT).length, justified = studentRecords.filter(r => r.status === AttendanceStatus.JUSTIFIED || r.status === AttendanceStatus.PENDING_JUSTIFICATION).length;
        return { student, total, absent, presentP: (present / total) * 100, absentP: (absent / total) * 100, justifiedP: (justified / total) * 100 };
    }).sort((a, b) => b.absent - a.absent), [students, records]);
    const filteredStudents = useMemo(() => studentStats.filter(s => s.student.name.toLowerCase().includes(searchTerm.toLowerCase())), [studentStats, searchTerm]);
    return (
        <div className="glass-card p-6 animate-fade-in-up">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-[--color-text-primary]">Progreso de Alumnos - {year}° Año</h2>
                <div className="relative">
                    <input type="text" placeholder="Buscar alumno..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-64 input-styled pl-8" />
                    <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStudents.map(stat => {
                    const absencePercentage = (stat.absent / ABSENCE_LIMIT) * 100;
                    let progressBarColor = 'bg-green-500', riskTextColor = 'text-green-600';
                    if (stat.absent >= ABSENCE_LIMIT - 2) { progressBarColor = 'bg-red-500'; riskTextColor = 'text-red-500'; }
                    else if (stat.absent >= 4) { progressBarColor = 'bg-yellow-500'; riskTextColor = 'text-yellow-500'; }
                    return (
                        <div key={stat.student.id} className="bg-[--color-secondary] border border-[--color-border] p-5 rounded-lg flex flex-col gap-4 transform hover:-translate-y-1 transition-transform duration-300">
                            <h3 className="font-bold text-[--color-text-primary] text-lg truncate">{stat.student.name}</h3>
                            <div>
                                <div className="flex justify-between items-baseline mb-1"><p className="text-sm text-[--color-text-secondary]">Faltas</p><p className={`text-sm font-bold ${riskTextColor}`}>{stat.absent} / {ABSENCE_LIMIT}</p></div>
                                <div className="w-full bg-black/10 rounded-full h-2.5"><div className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(absencePercentage, 100)}%` }}></div></div>
                            </div>
                            <div className="grid grid-cols-3 text-center bg-black/5 p-2 rounded-md">
                                <div><p className="font-bold text-green-600">{stat.presentP.toFixed(0)}%</p><p className="text-xs text-gray-500">Pres.</p></div>
                                <div><p className="font-bold text-yellow-600">{stat.justifiedP.toFixed(0)}%</p><p className="text-xs text-gray-500">Just.</p></div>
                                <div><p className="font-bold text-red-600">{stat.absentP.toFixed(0)}%</p><p className="text-xs text-gray-500">Aus.</p></div>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                                <button onClick={() => onViewProfile(stat.student)} className="btn btn-secondary text-sm py-2 px-3 col-span-3 sm:col-span-1"><UserIcon className="w-4 h-4"/> Perfil</button>
                                <button onClick={() => onOpenChat(stat.student)} className="btn btn-primary text-sm py-2 px-3 col-span-3 sm:col-span-1"><MessageSquareIcon className="w-4 h-4"/> Chat</button>
                                <button onClick={() => onConfigureStudent(stat.student)} className="btn btn-outline text-sm py-2 px-3 col-span-3 sm:col-span-1"><ShieldCheckIcon className="w-4 h-4"/> Permisos</button>
                            </div>
                        </div>
                    );
                })}
            </div>
             {filteredStudents.length === 0 && <p className="text-center text-[--color-text-secondary] py-12">{studentStats.length > 0 ? 'No se encontraron alumnos con ese nombre.' : 'No hay datos de alumnos para este año.'}</p>}
        </div>
    );
};

const YearlyAttendanceChart: React.FC<{ data: { year: number, percentage: number }[] }> = ({ data }) => (
    <div className="glass-card p-6">
        <h3 className="text-xl font-semibold text-[--color-text-primary] mb-4">Presentismo Promedio por Año</h3>
        <div className="flex justify-around items-end h-64 w-full gap-4 pt-4" aria-label="Gráfico de presentismo">
            {data.map((item, index) => (
                <div key={item.year} className="flex flex-col items-center flex-1 h-full group">
                    <div className="w-full h-full flex items-end justify-center" title={`${item.percentage.toFixed(1)}%`}>
                        <div className="w-1/2 bg-[--color-accent] rounded-t-lg hover:bg-[--color-accent-hover] transition-all relative" style={{ height: `${(item.percentage / 100) * 100}%`, animation: `grow-bar 0.5s ease-out ${index * 0.15}s forwards`, transformOrigin: 'bottom', opacity: 0 }}>
                            <span className="text-[--color-text-primary] font-bold text-sm absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">{item.percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                    <span className="text-sm mt-2 font-bold text-[--color-text-secondary]">{item.year}° Año</span>
                </div>
            ))}
        </div><style>{`@keyframes grow-bar { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }`}</style>
    </div>
);

interface WelcomeBannerProps {
  user: User;
  records: AttendanceRecord[];
  messages: PrivateMessage[];
  students: User[];
  unreadNotifications: number;
  onBellClick: () => void;
  onNavigate: (view: string) => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ user, records, messages, students, unreadNotifications, onBellClick, onNavigate }) => {
    const { pendingJustifications, studentsAtRisk, unreadChats } = useMemo(() => {
        const pending = records.filter(r => r.status === AttendanceStatus.PENDING_JUSTIFICATION).length;
        const unreadSet = new Set(messages.filter(m => m.receiverId === user.id && !m.read).map(m => m.senderId));
        const unread = unreadSet.size;
        const absencesByStudent = records.reduce((acc, r) => {
            if (r.status === AttendanceStatus.ABSENT) {
                const student = students.find(s => s.id === r.studentId);
                if (student && student.careerId === user.careerId) acc[r.studentId] = (acc[r.studentId] || 0) + 1;
            } return acc;
        }, {} as Record<number, number>);
        const atRisk = Object.values(absencesByStudent).filter(count => count >= ABSENCE_LIMIT - 2).length;
        return { pendingJustifications: pending, studentsAtRisk: atRisk, unreadChats: unread };
    }, [records, messages, user.id, user.careerId, students]);
    
    const stats = [
        { label: "Justificaciones Pendientes", value: pendingJustifications, icon: <ClockIcon className="w-8 h-8 text-blue-500" />, color: "text-blue-500", action: () => onNavigate('justifications') },
        { label: "Alumnos en Riesgo", value: studentsAtRisk, icon: <AlertTriangleIcon className="w-8 h-8 text-yellow-500" />, color: "text-yellow-500", action: () => onNavigate('insights') },
        { label: "Chats sin Leer", value: unreadChats, icon: <InboxIcon className="w-8 h-8 text-green-500" />, color: "text-green-500", action: () => onNavigate('progress') }
    ];

    return (
        <div className="welcome-banner animate-fade-in relative">
            <button onClick={onBellClick} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/10 transition-colors z-10" aria-label="Ver notificaciones">
                <BellIcon className="w-6 h-6 text-[--color-text-secondary]" />
                {unreadNotifications > 0 && <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-[--color-primary]"><span className="sr-only">{unreadNotifications} notificaciones nuevas</span></span>}
            </button>
            <h1 className="text-4xl font-bold text-[--color-text-primary] mb-2">
              {user.id === 1 ? 'Hola!' : `Bienvenido, ${user.name.split(' ')[0]}`}
            </h1>
            <p className="text-lg text-[--color-text-secondary] mb-8">Aquí está el resumen de tu carrera para hoy.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <button
                        key={stat.label}
                        onClick={stat.action}
                        className="glass-card p-4 flex items-center gap-4 animate-fade-in-up text-left w-full transition-transform transform hover:scale-[1.03] focus:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--color-accent] focus:ring-offset-[--color-background]"
                        style={{animationDelay: `${index * 100 + 100}ms`}}
                    >
                        <div className="p-3 bg-black/5 rounded-full">{stat.icon}</div>
                        <div><p className="text-sm text-[--color-text-secondary]">{stat.label}</p><p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p></div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const STUDENT_VIEWS = [
    { id: 'overview', label: 'Materias y Novedades' },
    { id: 'classmates', label: 'Ver Compañeros' },
    { id: 'forums', label: 'Foros de Discusión' },
    { id: 'absences', label: 'Ver Faltas y Justificar' },
    { id: 'history', label: 'Historial Completo' },
    { id: 'stats', label: 'Estadísticas' },
    { id: 'agenda', label: 'Agenda Académica' },
    { id: 'notes', label: 'Notas Personales' },
    { id: 'qrAttendance', label: 'Asistencia por QR' },
];

const StudentViewConfigModal: React.FC<{
  student: User;
  profile: UserProfileData;
  onClose: () => void;
  onSave: (updatedProfile: UserProfileData) => void;
}> = ({ student, profile, onClose, onSave }) => {
  const [permissions, setPermissions] = useState<NonNullable<UserProfileData['viewPermissions']>>(profile.viewPermissions || {});

  // Rewrote to avoid using a computed property in an object literal, which can cause
  // TypeScript to incorrectly widen the key's type.
  const handleToggle = (viewId: keyof NonNullable<UserProfileData['viewPermissions']>) => {
    setPermissions(prev => {
      const newPermissions = { ...prev };
      newPermissions[viewId] = prev[viewId] === undefined ? false : !prev[viewId];
      return newPermissions;
    });
  };

  const handleSave = () => {
    onSave({ ...profile, viewPermissions: permissions });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="glass-card w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-[--color-text-primary] mb-2">Configurar Vista de Alumno</h2>
        <p className="text-[--color-text-secondary] mb-6">Gestiona qué secciones puede ver {student.name}.</p>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {STUDENT_VIEWS.map(view => {
            const isEnabled = permissions[view.id as keyof typeof permissions] !== false; // undefined or true means enabled
            return (
              <div key={view.id} className="flex items-center justify-between bg-[--color-secondary] p-4 rounded-lg">
                <span className="font-semibold text-[--color-text-primary]">{view.label}</span>
                <button
                  onClick={() => handleToggle(view.id as keyof typeof permissions)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-[--color-accent]' : 'bg-gray-400'}`}
                >
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-[--color-border]">
          <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
          <button onClick={handleSave} className="btn btn-primary">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

const QRGeneratorView: React.FC<{
    user: User;
    subjects: Subject[];
    onCreateSession: (subjectId: string) => Promise<QRAttendanceSession>;
}> = ({ user, subjects, onCreateSession }) => {
    return (
        <div className="glass-card p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-center animate-fade-in">
                <QRIcon className="w-24 h-24 text-[--color-accent] mx-auto mb-4 opacity-70" />
                <h2 className="text-3xl font-bold text-[--color-text-primary]">Asistencia para Eventos</h2>
                <p className="text-[--color-text-secondary] mt-2 max-w-md mx-auto">
                    Esta función está pensada para eventos de gran escala, como Jornadas Estudiantiles.
                </p>
                <div className="mt-6 bg-[--color-secondary] p-4 rounded-lg border border-[--color-border]">
                    <p className="font-semibold text-[--color-text-primary]">
                        ¡Próximamente!
                    </p>
                    <p className="text-sm text-[--color-text-secondary]">
                        Se planea implementar esta funcionalidad más adelante en la App.
                    </p>
                </div>
            </div>
        </div>
    );
};


export const PreceptorDashboard: React.FC<PreceptorDashboardProps> = (props) => {
  const { user, onLogout, allUsers, userProfiles, onUpdateProfile, userNotes, onUpdateNotes, theme, setTheme, borderStyle, setBorderStyle, fontStyle, setFontStyle, students, attendanceRecords, addAttendanceRecord, subjects, newsItems, addNewsItem, deleteNewsItem, resolveJustificationRequest, privateMessages, notifications, sendPrivateMessage, markMessagesAsRead, markNotificationsAsRead, updateAttendanceStatus, onCreateQRSession, forumThreads, forumReplies, onUpdateForumThreadStatus, onAddForumReply, onDeleteForumThread, onDeleteForumReply, classSchedule } = props;
  
  const [activeView, setActiveView] = useState('overview');
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  const [forumsKey, setForumsKey] = useState(Date.now());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [selectedYear, setSelectedYear] = useState(user.year);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyAttendance, setDailyAttendance] = useState<Record<number, AttendanceStatus>>({});
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  
  const [chattingWith, setChattingWith] = useState<User | null>(null);
  const [editingAttendanceFor, setEditingAttendanceFor] = useState<User | null>(null);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [configuringStudent, setConfiguringStudent] = useState<User | null>(null);

  const handleNavigate = (view: string) => {
    // If clicking the current tab again, reset its detail/sub view to return to the list
    if (activeView === view) {
      if (view === 'progress') {
        setViewingProfile(null);
      }
      if (view === 'forums') {
        setForumsKey(Date.now()); // Force remount of ForumsView to reset its internal state
      }
    } else {
      // Always close the profile view when navigating away to a different section to avoid getting "stuck"
      setViewingProfile(null);
    }
    
    setActiveView(view);
  };

  const myNotifications = useMemo(() => notifications.filter(n => n.userId === user.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [notifications, user.id]);
  const unreadNotifications = useMemo(() => myNotifications.filter(n => !n.read).length, [myNotifications]);
  const relevantStudents = useMemo(() => students.filter(s => s.role === Role.STUDENT && s.careerId === user.careerId && s.year === selectedYear), [students, user.careerId, selectedYear]);
  
  const studentLibreStatusMap = useMemo(() => {
    const statusMap = new Map<number, boolean>();
    if (!selectedSubjectId) return statusMap;

    for (const student of relevantStudents) {
      const studentRecordsForSubject = attendanceRecords.filter(r => r.studentId === student.id && r.subjectId === selectedSubjectId);
      const total = studentRecordsForSubject.length;
      if (total === 0) {
        statusMap.set(student.id, false);
        continue;
      }
      const present = studentRecordsForSubject.filter(r => r.status === AttendanceStatus.PRESENT).length;
      const justified = studentRecordsForSubject.filter(r => r.status === AttendanceStatus.JUSTIFIED || r.status === AttendanceStatus.PENDING_JUSTIFICATION).length;
      const absent = studentRecordsForSubject.filter(r => r.status === AttendanceStatus.ABSENT).length;
      const attendancePercent = total > 0 ? ((present + justified) / total) * 100 : 100;

      const isOverAbsenceLimit = absent > ABSENCE_LIMIT;
      const isBelowPercentageAfterThreshold = total >= CLASS_COUNT_THRESHOLD_FOR_LIBRE && attendancePercent < MINIMUM_PRESENTISM;
      statusMap.set(student.id, isOverAbsenceLimit || isBelowPercentageAfterThreshold);
    }
    return statusMap;
  }, [relevantStudents, attendanceRecords, selectedSubjectId]);
  
  const sortedRelevantStudents = useMemo(() => {
    return [...relevantStudents].sort((a, b) => {
      const aIsLibre = studentLibreStatusMap.get(a.id) || false;
      const bIsLibre = studentLibreStatusMap.get(b.id) || false;
      if (aIsLibre === bIsLibre) {
        return a.name.localeCompare(b.name);
      }
      return aIsLibre ? 1 : -1; // Libre students go to the bottom
    });
  }, [relevantStudents, studentLibreStatusMap]);

  const nonLibreStudents = useMemo(() => {
    return relevantStudents.filter(s => !studentLibreStatusMap.get(s.id));
  }, [relevantStudents, studentLibreStatusMap]);
  
  useEffect(() => {
    const subjectsForYear = subjects.filter(sub => sub.careerId === user.careerId && sub.year === selectedYear);
    setAvailableSubjects(subjectsForYear);
    if (subjectsForYear.length > 0) setSelectedSubjectId(subjectsForYear[0].id);
    else setSelectedSubjectId('');
  }, [selectedYear, user.careerId, subjects]);

  useEffect(() => {
    if (!selectedSubjectId) { setDailyAttendance({}); return; }
    const recordsForDate = attendanceRecords.filter(r => r.date === selectedDate && r.subjectId === selectedSubjectId);
    const initialAttendance: Record<number, AttendanceStatus> = {};
    relevantStudents.forEach(student => { const record = recordsForDate.find(r => r.studentId === student.id); if (record) initialAttendance[student.id] = record.status; });
    setDailyAttendance(initialAttendance); setSaved(false); setIsDirty(false);
  }, [selectedDate, relevantStudents, attendanceRecords, selectedSubjectId]);
  
  useEffect(() => {
    setIsNotificationPanelOpen(false);
    setIsUserMenuOpen(false);
  }, [activeView, viewingProfile]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    if (studentLibreStatusMap.get(studentId)) return;
    setDailyAttendance(prev => ({ ...prev, [studentId]: status })); setSaved(false); setIsDirty(true); 
  };
  
  const handleSaveAttendance = () => {
    if (!selectedSubjectId) return;
    Object.entries(dailyAttendance).forEach(([studentId, status]) => addAttendanceRecord(Number(studentId), status, selectedDate, selectedSubjectId));
    setSaved(true); setIsDirty(false); setTimeout(() => setSaved(false), 3000);
  };

  const handleExportCSV = () => {
    const subjectName = availableSubjects.find(s => s.id === selectedSubjectId)?.name || 'N/A';
    const headers = ['ID Alumno', 'Nombre', 'Email', 'Fecha', 'Materia', 'Estado'];
    const rows = sortedRelevantStudents.map(student => {
        const isLibre = studentLibreStatusMap.get(student.id) || false;
        const status = isLibre ? "LIBRE" : (dailyAttendance[student.id] || 'No Marcado');
        return [student.id, `"${student.name}"`, student.email, selectedDate, `"${subjectName}"`, status].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `asistencia_${user.careerId}_${selectedYear}_${selectedSubjectId}_${selectedDate}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href);
  };
  
  const renderTabButton = (view: string, label: string, icon: React.ReactNode) => (
    <button onClick={() => handleNavigate(view)} className={`flex items-center gap-2 whitespace-nowrap py-4 px-3 border-b-2 font-semibold text-base transition-all duration-300 ${activeView === view ? 'border-[--color-accent] text-[--color-accent]' : 'border-transparent text-[--color-text-secondary] hover:text-[--color-text-primary] hover:border-gray-400'}`}>
      {icon} <span>{label}</span>
    </button>
  );
  
  const renderBottomNavButton = (view: string, label: string, icon: React.ReactNode) => (
    <button onClick={() => handleNavigate(view)} className={`flex flex-col items-center justify-center gap-1 w-full pt-3 pb-2 text-sm transition-colors duration-300 relative ${activeView === view ? 'text-[--color-accent]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}>
      {icon}
      <span className="text-xs font-medium text-center">{label}</span>
      {activeView === view && <div className="absolute bottom-0 w-10 h-1 bg-[--color-accent] rounded-full"></div>}
    </button>
  );

  const renderCurrentView = () => {
    switch(activeView) {
        case 'overview': return (
            <div className="space-y-8 animate-fade-in">
                <YearlyAttendanceChart data={[1,2,3].map(year => {
                    const yearStudents = students.filter(s => s.careerId === user.careerId && s.year === year);
                    if (yearStudents.length === 0) return { year, percentage: 0 };
                    const yearRecords = attendanceRecords.filter(r => new Set(yearStudents.map(s => s.id)).has(r.studentId));
                    if (yearRecords.length === 0) return { year, percentage: 0 };
                    return { year, percentage: (yearRecords.filter(r => r.status === AttendanceStatus.PRESENT).length / yearRecords.length) * 100 };
                })} />
            </div>
        );
        case 'take': {
            return (
                <div className="animate-fade-in-up">
                    <div className="mb-6 glass-card p-4 flex flex-wrap items-center gap-6">
                        <div className="flex-1 min-w-[150px]"><label htmlFor="year-select" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Año</label><select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="input-styled w-full">{[1, 2, 3].map(year => <option key={year} value={year}>{year}° Año</option>)}</select></div>
                        <div className="flex-1 min-w-[200px]"><label htmlFor="subject-select" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Materia</label><select id="subject-select" value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} disabled={availableSubjects.length === 0} className="input-styled w-full disabled:bg-gray-200 disabled:cursor-not-allowed">{availableSubjects.length > 0 ? availableSubjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>) : <option value="">No hay materias para este año</option>}</select></div>
                        <div className="flex-1 min-w-[150px]"><label htmlFor="date-select" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Fecha</label><input type="date" id="date-select" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-styled w-full" /></div>
                    </div>
                    <div className="glass-card p-6">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                            <h2 className="text-xl font-semibold text-[--color-text-primary]">Asistencia del día - {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })}</h2>
                            <button onClick={() => handleNavigate('history')} className="btn btn-secondary">
                                <BookOpenIcon className="w-5 h-5"/>
                                <span>Ver Historial Completo</span>
                            </button>
                        </div>
                        {selectedSubjectId ? (
                            relevantStudents.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {sortedRelevantStudents.map(student => (
                                            <StudentCard 
                                                key={student.id} 
                                                student={student} 
                                                status={dailyAttendance[student.id] || null} 
                                                onSetStatus={(status) => handleStatusChange(student.id, status)}
                                                isLibre={studentLibreStatusMap.get(student.id) || false}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-8 flex flex-wrap justify-end items-center gap-4">
                                        {saved && <p className="text-green-500 flex items-center gap-2 animate-pulse font-semibold"><CheckCircleIcon className="w-5 h-5" /> ¡Asistencia guardada con éxito!</p>}
                                        {isDirty && !saved && <p className="text-yellow-500 text-sm font-medium">Cambios sin guardar</p>}
                                        <button onClick={handleExportCSV} disabled={!nonLibreStudents.every(s => dailyAttendance[s.id]) && nonLibreStudents.length > 0} className="btn btn-secondary py-3 px-4 font-bold"><DownloadIcon className="w-5 h-5" /> Exportar CSV</button>
                                        <button onClick={handleSaveAttendance} disabled={(!nonLibreStudents.every(s => dailyAttendance[s.id]) && nonLibreStudents.length > 0) || !isDirty} className="btn btn-primary py-3 px-6 font-bold">Guardar Asistencia</button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-[--color-text-secondary] text-center py-8">No hay alumnos en este curso.</p>
                            )
                        ) : (
                            <p className="text-[--color-text-secondary] text-center py-8">Por favor, seleccione una materia.</p>
                        )}
                    </div>
                </div>
            );
        }
        case 'qr-attendance': return <QRGeneratorView user={user} subjects={subjects} onCreateSession={onCreateQRSession} />;
        case 'progress': return (
            <div className="animate-fade-in">
                <div className="mb-6 glass-card p-4 flex flex-wrap items-center gap-6"><div className="flex items-center gap-2"><label htmlFor="year-select-progress" className="font-semibold text-[--color-text-primary]">Año:</label><select id="year-select-progress" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="input-styled">{[1, 2, 3].map(year => <option key={year} value={year}>{year}° Año</option>)}</select></div></div>
                <StudentProgressView students={relevantStudents} records={attendanceRecords} year={selectedYear} onOpenChat={setChattingWith} onViewProfile={setViewingProfile} onConfigureStudent={setConfiguringStudent} />
            </div>
        );
        case 'justifications': return <div className="animate-fade-in"><JustificationManager students={students} records={attendanceRecords} subjects={subjects} onResolve={resolveJustificationRequest} /></div>;
        case 'history': return <HistoryView user={user} students={students} records={attendanceRecords} subjects={subjects} />;
        case 'forums': return <ForumsView key={forumsKey} currentUser={user} allUsers={allUsers} threads={forumThreads} replies={forumReplies} onAddThread={() => {}} onAddReply={onAddForumReply} onUpdateThreadStatus={onUpdateForumThreadStatus} onDeleteThread={onDeleteForumThread} onDeleteReply={onDeleteForumReply} />;
        case 'insights': return <div className="animate-fade-in"><AIInsightsView students={relevantStudents} allStudents={students} records={attendanceRecords} onOpenChat={(student) => setChattingWith(student)} year={selectedYear} /></div>;
        case 'announcements': return <div className="animate-fade-in"><AnnouncementsManager newsItems={newsItems} addNewsItem={addNewsItem} deleteNewsItem={deleteNewsItem} /></div>;
        case 'profile': return <ProfileView viewedUser={user} currentUser={user} profileData={userProfiles[user.id] || {}} onUpdateProfile={(data) => onUpdateProfile(user.id, data)} onBack={() => handleNavigate('overview')} />;
        case 'agenda': return <AgendaView user={user} newsItems={newsItems} subjects={subjects} classSchedule={classSchedule} />;
        case 'notes': return <NotesView notes={userNotes} onUpdateNotes={onUpdateNotes} />;
        case 'appearance': return <AppearanceView currentTheme={theme} onSetTheme={setTheme} currentBorderStyle={borderStyle} onSetBorderStyle={setBorderStyle} currentFontStyle={fontStyle} onSetFontStyle={setFontStyle} />;
        default: return null;
    }
  };

  const profilePic = userProfiles[user.id]?.profilePicture;
  
  return (
    <>
      <header className="bg-[--color-header-bg] backdrop-blur-lg sticky top-0 z-30 border-b border-black/10 transition-colors duration-500">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <button onClick={() => handleNavigate('overview')} className="flex items-center gap-3 cursor-pointer"><BookOpenIcon className="h-12 w-12 text-[--color-accent]" /><span className="text-xl font-bold">Asistencia Terciario</span></button>
            <div className="relative z-50" ref={userMenuRef}>
              <button onClick={() => { setIsUserMenuOpen(prev => !prev); setIsNotificationPanelOpen(false); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 transition-colors">
                  {profilePic ? <img src={profilePic} alt="Perfil" className="w-8 h-8 rounded-full object-cover bg-[--color-secondary]"/> : <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[--color-secondary]"><UserIcon className="w-5 h-5 text-[--color-accent]"/></div>}
                  <div className="text-left hidden sm:block"><p className="font-semibold leading-tight text-[--color-text-primary]">{user.name}</p><p className="text-sm text-[--color-text-secondary] leading-tight">{user.role}</p></div>
                  <ChevronDownIcon className={`w-5 h-5 text-[--color-text-secondary] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}/>
              </button>
              {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 solid-card animate-fade-in-up p-2" style={{animationDuration: '0.2s'}}>
                    <div className="p-2 border-b border-[--color-border] mb-2"><p className="font-bold text-[--color-text-primary]">{user.name}</p><p className="text-sm text-[--color-text-secondary]">{user.email}</p></div>
                    <div className="space-y-1">
                        <button onClick={() => { handleNavigate('profile'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><UserIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Mi Perfil</span></button>
                        <button onClick={() => { handleNavigate('qr-attendance'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><QRIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Asistencia QR</span></button>
                        <button onClick={() => { handleNavigate('agenda'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><CalendarIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Agenda Académica</span></button>
                        <button onClick={() => { handleNavigate('notes'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><StickyNoteIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Mis Notas</span></button>
                        <button onClick={() => { handleNavigate('insights'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><SparklesIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Análisis IA</span></button>
                        <button onClick={() => { handleNavigate('appearance'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><AppearanceIcon className="w-5 h-5 text-[--color-text-secondary]" /> <span className="font-semibold">Apariencia</span></button>
                    </div>
                    <div className="p-2 mt-2 border-t border-[--color-border]"><button onClick={onLogout} className="w-full flex items-center gap-3 text-left px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><LogoutIcon className="w-5 h-5" /><span className="font-semibold">Cerrar Sesión</span></button></div>
                  </div>
              )}
            </div>
        </nav>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="pb-24 md:pb-0 relative">
            {viewingProfile ? (
              <ProfileView
                viewedUser={viewingProfile}
                currentUser={user}
                profileData={userProfiles[viewingProfile.id] || {}}
                onUpdateProfile={(data) => onUpdateProfile(viewingProfile.id, data)}
                onBack={() => setViewingProfile(null)}
              />
            ) : (
                <>
                    {activeView === 'overview' && <WelcomeBanner user={user} records={attendanceRecords} messages={privateMessages} students={students} unreadNotifications={unreadNotifications} onBellClick={() => { setIsNotificationPanelOpen(prev => !prev); setIsUserMenuOpen(false); }} onNavigate={handleNavigate} />}
                    {isNotificationPanelOpen && <NotificationPanel notifications={myNotifications} onClose={() => setIsNotificationPanelOpen(false)} onMarkAllRead={() => markNotificationsAsRead(user.id)} />}
                    <div className="mt-8 hidden md:block">
                        <div className="border-b border-[--color-border]"><nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
                            {renderTabButton('overview', 'Resumen', <HomeIcon className="w-5 h-5"/>)}
                            {renderTabButton('take', 'Tomar Asistencia', <CheckCircleIcon className="w-5 h-5"/>)}
                            {renderTabButton('progress', 'Progreso', <UsersIcon className="w-5 h-5"/>)}
                            {renderTabButton('forums', 'Foros', <ChatBubbleIcon className="w-5 h-5"/>)}
                            {renderTabButton('justifications', 'Justificaciones', <ClockIcon className="w-5 h-5"/>)}
                            {renderTabButton('announcements', 'Anuncios', <MegaphoneIcon className="w-5 h-5"/>)}
                        </nav></div>
                    </div>
                    <div className="md:mt-8">{renderCurrentView()}</div>
                </>
            )}
          </div>
      </main>
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[--color-primary] border-t border-[--color-border] z-40 shadow-[0_-2px_10px_rgba(var(--color-shadow-rgb),0.1)]">
        <nav className="flex justify-around items-center">
            {renderBottomNavButton('overview', 'Resumen', <HomeIcon className="w-6 h-6"/>)}
            {renderBottomNavButton('take', 'Asistencia', <CheckCircleIcon className="w-6 h-6"/>)}
            {renderBottomNavButton('progress', 'Alumnos', <UsersIcon className="w-6 h-6"/>)}
            {renderBottomNavButton('forums', 'Foros', <ChatBubbleIcon className="w-6 h-6" />)}
            {renderBottomNavButton('announcements', 'Anuncios', <MegaphoneIcon className="w-6 h-6"/>)}
        </nav>
      </div>

      {chattingWith && <ChatModal user={user} student={chattingWith} messages={privateMessages} onClose={() => setChattingWith(null)} onSendMessage={(text) => sendPrivateMessage(user.id, (chattingWith as User).id, text)} onEditAttendance={() => { setEditingAttendanceFor(chattingWith); setChattingWith(null); }} />}
      {editingAttendanceFor && <EditAttendanceModal student={editingAttendanceFor} records={attendanceRecords} subjects={subjects} onClose={() => setEditingAttendanceFor(null)} onUpdateStatus={updateAttendanceStatus} />}
      {configuringStudent && (
        <StudentViewConfigModal
          student={configuringStudent}
          profile={userProfiles[configuringStudent.id] || {}}
          onClose={() => setConfiguringStudent(null)}
          onSave={(updatedProfile) => {
            onUpdateProfile(configuringStudent.id, updatedProfile);
            setConfiguringStudent(null);
          }}
        />
      )}
    </>
  );
};