import React, { useState, useMemo } from 'react';
import { User, NewsItem, Subject, ClassSchedule } from '../types';

interface CalendarEvent {
  date: string;
  title: string;
  type: 'exam' | 'assignment' | 'event';
  subjectId?: string;
}

const EVENT_STYLES = {
  exam: 'bg-red-500/80 text-white',
  assignment: 'bg-blue-500/80 text-white',
  event: 'bg-green-500/80 text-white',
};

const parseEvents = (newsItems: NewsItem[], user: User): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const dateRegex = /(\d{1,2}) de (\w+)/i;

  const monthMap: { [key: string]: number } = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
  };

  newsItems.forEach(item => {
    // Filter news relevant to the user
    if (item.careerId && item.careerId !== user.careerId) return;
    if (item.year && item.year !== user.year) return;

    const match = item.text.match(dateRegex);
    if (match) {
      const day = parseInt(match[1], 10);
      const monthName = match[2].toLowerCase();
      const month = monthMap[monthName];
      
      if (month !== undefined) {
        const year = new Date().getFullYear();
        const date = new Date(year, month, day);
        
        let type: CalendarEvent['type'] = 'event';
        if (/examen|parcial/i.test(item.text)) type = 'exam';
        else if (/entrega|tp|proyecto final/i.test(item.text)) type = 'assignment';

        events.push({
          date: date.toISOString().split('T')[0],
          title: item.text,
          type,
          subjectId: item.subjectId,
        });
      }
    }
  });

  return events;
};


const Calendar: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday etc.
  
  const daysInMonth = [];
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    daysInMonth.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const blanks = Array(startingDayOfWeek).fill(null);
  
  const eventsByDate = useMemo(() => {
    const map: { [key: string]: CalendarEvent[] } = {};
    events.forEach(event => {
        const dateKey = event.date;
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(event);
    });
    return map;
  }, [events]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };
  
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="solid-card p-6">
        <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-black/10 transition-colors">&lt;</button>
            <h2 className="text-xl font-bold text-[--color-text-primary]">{currentDate.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-black/10 transition-colors">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map(day => <div key={day} className="font-semibold text-xs sm:text-sm text-[--color-text-secondary] mb-2">{day}</div>)}
            {blanks.map((_, i) => <div key={`blank-${i}`} />)}
            {daysInMonth.map(day => {
                const dateKey = day.toISOString().split('T')[0];
                const dayEvents = eventsByDate[dateKey] || [];
                const isToday = new Date().toDateString() === day.toDateString();

                return (
                    <div key={day.toString()} className={`p-1 h-20 sm:h-24 flex flex-col border border-transparent rounded-lg ${isToday ? 'bg-[--color-accent]/10' : ''}`}>
                       <span className={`w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[--color-accent] text-white font-bold' : ''}`}>
                         {day.getDate()}
                       </span>
                       <div className="flex-grow overflow-y-auto text-xs mt-1 space-y-1 pr-1">
                           {dayEvents.map(event => (
                               <div key={event.title} className={`${EVENT_STYLES[event.type]} p-1 rounded-md truncate`} title={event.title}>
                                   {event.title}
                               </div>
                           ))}
                       </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

const WeeklySchedule: React.FC<{ schedule: ClassSchedule[], events: CalendarEvent[], subjects: Subject[] }> = ({ schedule, events, subjects }) => {
    const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const currentDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
  
    const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
    
    const eventsByDay = useMemo(() => {
      const map: { [key: number]: CalendarEvent[] } = {};
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDayIndex); 
  
      for(let i=0; i<5; i++) {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          const dateKey = date.toISOString().split('T')[0];
          const dayEvents = events.filter(e => e.date === dateKey);
          if (dayEvents.length > 0) {
              map[i] = dayEvents;
          }
      }
      return map;
    }, [events, today, currentDayIndex]);
  
  
    return (
      <div className="solid-card p-6 mb-8">
        <h2 className="text-2xl font-bold text-[--color-text-primary] mb-6">Horario Semanal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {weekDays.map((day, index) => {
            const daySchedule = schedule.filter(item => item.dayOfWeek === index + 1).sort((a, b) => a.startTime.localeCompare(b.startTime));
            const dayEvents = eventsByDay[index] || [];
            
            return (
              <div key={day} className="flex flex-col gap-3 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="font-bold text-center text-[--color-text-primary] pb-2 border-b-2" style={{borderColor: index === currentDayIndex ? 'var(--color-accent)' : 'var(--color-border)'}}>
                  {day}
                  <div className="flex justify-center gap-1.5 mt-1 h-2">
                      {dayEvents.map(event => {
                          let colorClass = '';
                          if (event.type === 'exam') colorClass = 'bg-red-500';
                          else if (event.type === 'assignment') colorClass = 'bg-blue-500';
                          else if (event.type === 'event') colorClass = 'bg-green-500';
                          return <div key={event.title} title={event.title} className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                      })}
                  </div>
                </div>
                <div className="space-y-3 min-h-[100px]">
                  {daySchedule.length > 0 ? daySchedule.map((item, itemIndex) => (
                    <div 
                      key={item.subjectId + item.startTime}
                      className="glass-card p-3 rounded-lg text-sm animate-fade-in-up"
                      style={{ animationDelay: `${index * 100 + (itemIndex + 1) * 75}ms` }}
                    >
                      <p className="font-bold text-[--color-accent]">{subjectMap.get(item.subjectId) || 'Materia'}</p>
                      <p className="text-xs text-[--color-text-secondary] font-semibold">{item.startTime} - {item.endTime}</p>
                      <p className="font-semibold text-[--color-text-primary] mt-1">{item.classroom}</p>
                    </div>
                  )) : (
                    <div className="text-center text-xs text-[--color-text-secondary] pt-8 opacity-70">Libre</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
};

interface AgendaViewProps {
    user: User,
    newsItems: NewsItem[],
    subjects: Subject[],
    classSchedule: ClassSchedule[],
}

export const AgendaView: React.FC<AgendaViewProps> = ({ user, newsItems, subjects, classSchedule }) => {
  const events = useMemo(() => parseEvents(newsItems, user), [newsItems, user]);

  const mySchedule = useMemo(() => {
    const mySubjectIds = new Set(subjects.filter(s => s.careerId === user.careerId && s.year === user.year).map(s => s.id));
    return classSchedule.filter(item => mySubjectIds.has(item.subjectId));
  }, [classSchedule, subjects, user]);

  return (
    <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[--color-text-primary]">Agenda Académica</h1>
          <p className="text-[--color-text-secondary]">Tu horario semanal y fechas importantes del mes.</p>
        </div>
        
        <WeeklySchedule schedule={mySchedule} events={events} subjects={subjects} />

        <div className="mt-12">
             <h2 className="text-2xl font-bold text-[--color-text-primary] mb-6">Calendario Mensual de Eventos</h2>
             <Calendar events={events} />
        </div>
    </div>
  );
};