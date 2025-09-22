

import React, { useState, useMemo, useEffect } from 'react';
import { User, AttendanceRecord, AttendanceStatus, Subject } from '../types';
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, ClockIcon, ChartBarIcon } from './Icons';
import { ABSENCE_LIMIT, MINIMUM_PRESENTISM, CLASS_COUNT_THRESHOLD_FOR_LIBRE } from '../constants';

interface HistoryViewProps {
  user: User;
  students: User[];
  records: AttendanceRecord[];
  subjects: Subject[];
}

const statusStyles: { [key in AttendanceStatus]: { icon: React.ReactNode; color: string; text: string } } = {
    [AttendanceStatus.PRESENT]: { icon: <CheckCircleIcon className="w-5 h-5" />, color: 'bg-green-500/10 text-green-600', text: 'Presente' },
    [AttendanceStatus.ABSENT]: { icon: <XCircleIcon className="w-5 h-5" />, color: 'bg-red-500/10 text-red-600', text: 'Ausente' },
    [AttendanceStatus.JUSTIFIED]: { icon: <MinusCircleIcon className="w-5 h-5" />, color: 'bg-yellow-500/10 text-yellow-600', text: 'Justificado' },
    [AttendanceStatus.PENDING_JUSTIFICATION]: { icon: <ClockIcon className="w-5 h-5" />, color: 'bg-blue-500/10 text-blue-600', text: 'Pendiente' },
};

const BarChart: React.FC<{ present: number; absent: number; justified: number }> = ({ present, absent, justified }) => {
    const max = Math.max(present, absent, justified, 1);
    const presentHeight = (present / max) * 100;
    const absentHeight = (absent / max) * 100;
    const justifiedHeight = (justified / max) * 100;
  
    const barData = [
      { label: 'P', value: present, height: presentHeight, color: 'bg-green-500', textColor: 'text-green-600' },
      { label: 'J', value: justified, height: justifiedHeight, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
      { label: 'A', value: absent, height: absentHeight, color: 'bg-red-500', textColor: 'text-red-600' },
    ];
  
    return (
      <div className="flex justify-around items-end h-32 w-full gap-3 p-2 bg-black/5 rounded-lg" aria-label="Gráfico de asistencias">
        {barData.map((bar, index) => (
          <div key={bar.label} className="flex flex-col items-center flex-1">
            <div className="w-full h-full flex items-end justify-center" title={`${bar.label}: ${bar.value}`}>
              <div
                className={`w-3/4 ${bar.color} rounded-t-md`}
                style={{ height: `${bar.height}%`, transition: `height 0.5s ease-out ${index * 0.1}s` }}
              />
            </div>
            <span className={`text-xs mt-1 font-bold ${bar.textColor}`}>{bar.label} ({bar.value})</span>
          </div>
        ))}
      </div>
    );
};
  
const StudentStatsModal: React.FC<{ student: User, records: AttendanceRecord[], subjects: Subject[], onClose: () => void }> = ({ student, records, subjects, onClose }) => {
    const studentSubjects = useMemo(() => subjects.filter(s => s.careerId === student.careerId && s.year === student.year), [subjects, student]);
    const studentRecords = useMemo(() => records.filter(r => r.studentId === student.id), [records, student.id]);

    const statsBySubject = useMemo(() => {
        const stats: Record<string, { present: number; absent: number; justified: number; total: number }> = {};
        for (const record of studentRecords) {
            if (!stats[record.subjectId]) {
                stats[record.subjectId] = { present: 0, absent: 0, justified: 0, total: 0 };
            }
            stats[record.subjectId].total++;
            if (record.status === AttendanceStatus.PRESENT) stats[record.subjectId].present++;
            else if (record.status === AttendanceStatus.ABSENT) stats[record.subjectId].absent++;
            else if (record.status === AttendanceStatus.JUSTIFIED || record.status === AttendanceStatus.PENDING_JUSTIFICATION) {
                stats[record.subjectId].justified++;
            }
        }
        return stats;
    }, [studentRecords]);
    
    const subjectsWithStats = useMemo(() => studentSubjects.filter(s => statsBySubject[s.id] && statsBySubject[s.id].total > 0), [studentSubjects, statsBySubject]);


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" style={{animationDuration: '0.3s'}} onClick={onClose}>
            <div className="glass-card w-full max-w-4xl p-6 md:p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-[--color-text-primary]">{student.name}</h2>
                        <p className="text-[--color-text-secondary]">Estadísticas de Asistencia</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors text-3xl leading-none">&times;</button>
                </div>
                {subjectsWithStats.length === 0 ? (
                    <div className="text-center text-[--color-text-secondary] py-16">
                        <ChartBarIcon className="w-16 h-16 mx-auto opacity-50 mb-4" />
                        <h3 className="text-xl font-bold text-[--color-text-primary]">Sin Datos de Asistencia</h3>
                        <p>Este alumno aún no tiene registros de asistencia para sus materias.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjectsWithStats.map(subject => {
                            const data = statsBySubject[subject.id];
                            const remainingAbsences = Math.max(0, ABSENCE_LIMIT - data.absent);
                            const attendancePercent = data.total > 0 ? ((data.present + data.justified) / data.total) * 100 : 100;
                            
                            const isOverAbsenceLimit = data.absent > ABSENCE_LIMIT;
                            const isBelowPercentageAfterThreshold = data.total >= CLASS_COUNT_THRESHOLD_FOR_LIBRE && attendancePercent < MINIMUM_PRESENTISM;
                            const isLibre = isOverAbsenceLimit || isBelowPercentageAfterThreshold;

                            return (
                                <div key={subject.id} className="bg-[--color-secondary] p-5 rounded-lg flex flex-col gap-4">
                                    <div>
                                        <h3 className="font-bold text-[--color-text-primary] text-lg">{subject.name}</h3>
                                        <p className="text-sm text-[--color-text-secondary]">{data.total} clases registradas</p>
                                    </div>
                                    <BarChart present={data.present} absent={data.absent} justified={data.justified} />
                                    <div className="text-center mt-2 bg-black/5 p-3 rounded-lg divide-y divide-[--color-border]">
                                        <div className="pb-2">
                                            <p className="text-2xl font-bold text-[--color-text-primary]">{remainingAbsences}</p>
                                            <p className="text-xs text-[--color-text-secondary]">Faltas restantes permitidas</p>
                                        </div>
                                        <div className="pt-2">
                                            <p className={`text-sm font-bold ${isLibre ? 'text-red-500' : 'text-green-600'}`}>
                                                {isLibre ? 'LIBRE' : 'REGULAR'}
                                            </p>
                                            <p className="text-xs text-[--color-text-secondary]">Condición ({attendancePercent.toFixed(1)}%)</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};


export const HistoryView: React.FC<HistoryViewProps> = ({ user, students, records, subjects }) => {
  const today = new Date().toISOString().split('T')[0];
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const [startDate, setStartDate] = useState(oneMonthAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState(user.year);
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  const studentMap = useMemo(() => {
    const map = new Map<number, User>();
    students.forEach(student => map.set(student.id, student));
    return map;
  }, [students]);

  const subjectMap = useMemo(() => {
    return subjects.reduce((map, subject) => {
      map[subject.id] = subject.name;
      return map;
    }, {} as Record<string, string>);
  }, [subjects]);

  const availableSubjects = useMemo(() => {
    return subjects.filter(sub => sub.careerId === user.careerId && sub.year === filterYear);
  }, [subjects, user.careerId, filterYear]);

  useEffect(() => {
    setFilterSubjectId('all');
  }, [filterYear]);

  const filteredRecords = useMemo(() => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    return records
      .filter(record => {
        const student = studentMap.get(record.studentId);
        if (!student || student.careerId !== user.careerId || student.year !== filterYear) return false;

        const recordDate = new Date(record.date + 'T00:00:00');
        const matchesDate = recordDate >= start && recordDate <= end;
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = filterSubjectId === 'all' || record.subjectId === filterSubjectId;
        
        return matchesDate && matchesSearch && matchesSubject;
      })
      .sort((a, b) => {
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        return (studentMap.get(a.studentId)?.name || '').localeCompare(studentMap.get(b.studentId)?.name || '');
      });
  }, [records, studentMap, user.careerId, filterYear, startDate, endDate, searchTerm, filterSubjectId]);

  return (
    <>
    {selectedStudent && (
        <StudentStatsModal 
            student={selectedStudent}
            records={records}
            subjects={subjects}
            onClose={() => setSelectedStudent(null)}
        />
    )}
    <div className="glass-card p-6 animate-fade-in-up">
      <h2 className="text-xl font-semibold text-[--color-text-primary] mb-4">Historial de Asistencia</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-[--color-primary] rounded-lg border border-[--color-border]">
        <div>
            <label htmlFor="filter-year" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Año</label>
            <select
              id="filter-year"
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="input-styled w-full"
            >
              {[1, 2, 3].map(year => <option key={year} value={year}>{year}° Año</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="filter-subject" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Materia</label>
            <select
                id="filter-subject"
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
                disabled={availableSubjects.length === 0}
                className="input-styled w-full disabled:bg-gray-200"
            >
                <option value="all">Todas</option>
                {availableSubjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Desde</label>
            <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-styled w-full" />
        </div>
        <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Hasta</label>
            <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-styled w-full" />
        </div>
        <div>
            <label htmlFor="search-student" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Buscar Alumno</label>
            <input type="text" id="search-student" placeholder="Nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-styled w-full" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-[--color-border]">
            <tr>
              <th className="p-4 font-semibold text-sm text-[--color-text-secondary] uppercase tracking-wider">Fecha</th>
              <th className="p-4 font-semibold text-sm text-[--color-text-secondary] uppercase tracking-wider">Alumno</th>
              <th className="p-4 font-semibold text-sm text-[--color-text-secondary] uppercase tracking-wider">Materia</th>
              <th className="p-4 font-semibold text-sm text-[--color-text-secondary] uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const student = studentMap.get(record.studentId);
                return (
                  <tr key={`${record.id}-${Math.random()}`} className="border-b border-[--color-border] last:border-b-0 hover:bg-[--color-secondary] transition-colors">
                    <td className="p-4 text-[--color-text-primary] whitespace-nowrap">{new Date(record.date + 'T00:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td className="p-4 whitespace-nowrap">
                        <button onClick={() => student && setSelectedStudent(student)} className="font-semibold text-[--color-text-primary] hover:text-[--color-accent] transition-colors">
                            {student?.name || 'Desconocido'}
                        </button>
                    </td>
                    <td className="p-4 text-[--color-text-secondary] whitespace-nowrap">{subjectMap[record.subjectId] || 'N/A'}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusStyles[record.status].color}`}>
                        {statusStyles[record.status].icon}
                        <span>{statusStyles[record.status].text}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-8 text-[--color-text-secondary]">No se encontraron registros con los filtros aplicados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};