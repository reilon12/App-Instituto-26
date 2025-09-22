import { Career, User, Role, CareerName, AttendanceRecord, AttendanceStatus, Subject, NewsItem, PrivateMessage, ForumThread, ForumThreadStatus, ForumReply, ClassSchedule, Notification, NotificationType } from './types';

export const ABSENCE_LIMIT = 8;
export const MINIMUM_PRESENTISM = 70;
export const CLASS_COUNT_THRESHOLD_FOR_LIBRE = 10;

export const PRECEPTOR_REGISTRATION_CODES = ['PRECEPTOR_DEV_2024', 'PRECEPTOR_DESIGN_2024', 'ADMIN_ACCESS_01'];


export const CAREERS: Career[] = [
  {
    id: 'dev',
    name: CareerName.SOFTWARE,
    years: [1, 2, 3],
    theme: 'theme-dev',
  },
  {
    id: 'design',
    name: CareerName.DESIGN,
    years: [1, 2, 3],
    theme: 'theme-design',
  },
];

export const SUBJECTS: Subject[] = [
  // Dev
  { id: 'dev-1-algo', name: 'Algoritmos y Estructuras de Datos', careerId: 'dev', year: 1 },
  { id: 'dev-1-prog1', name: 'Programación I', careerId: 'dev', year: 1 },
  { id: 'dev-1-arq', name: 'Arquitectura de Computadoras', careerId: 'dev', year: 1 },
  { id: 'dev-2-prog2', name: 'Programación II', careerId: 'dev', year: 2 },
  { id: 'dev-2-db', name: 'Bases de Datos', careerId: 'dev', year: 2 },
  { id: 'dev-2-so', name: 'Sistemas Operativos', careerId: 'dev', year: 2 },
  { id: 'dev-3-net', name: 'Redes y Comunicación', careerId: 'dev', year: 3 },
  { id: 'dev-3-sec', name: 'Seguridad Informática', careerId: 'dev', year: 3 },
  { id: 'dev-3-final', name: 'Proyecto Final (Dev)', careerId: 'dev', year: 3 },

  // Design
  { id: 'des-1-dg1', name: 'Diseño Gráfico I', careerId: 'design', year: 1 },
  { id: 'des-1-img', name: 'Teoría de la Imagen', careerId: 'design', year: 1 },
  { id: 'des-1-photo', name: 'Fotografía', careerId: 'design', year: 1 },
  { id: 'des-2-av', name: 'Diseño Audiovisual', careerId: 'design', year: 2 },
  { id: 'des-2-video', name: 'Edición de Video', careerId: 'design', year: 2 },
  { id: 'des-2-sound', name: 'Diseño de Sonido', careerId: 'design', year: 2 },
  { id: 'des-3-3d', name: 'Animación 3D', careerId: 'design', year: 3 },
  { id: 'des-3-post', name: 'Postproducción Digital', careerId: 'design', year: 3 },
  { id: 'des-3-final', name: 'Proyecto Final (Design)', careerId: 'design', year: 3 },
];

export const CLASS_SCHEDULE: ClassSchedule[] = [
    // Dev 1
    { subjectId: 'dev-1-prog1', dayOfWeek: 1, startTime: '18:20', endTime: '20:20', classroom: 'Aula 12' },
    { subjectId: 'dev-1-prog1', dayOfWeek: 3, startTime: '20:30', endTime: '22:20', classroom: 'Lab 3' },
    { subjectId: 'dev-1-algo', dayOfWeek: 2, startTime: '18:20', endTime: '22:20', classroom: 'Aula 10' },
    { subjectId: 'dev-1-arq', dayOfWeek: 4, startTime: '18:20', endTime: '20:20', classroom: 'Taller A' },

    // Dev 2
    { subjectId: 'dev-2-prog2', dayOfWeek: 2, startTime: '18:20', endTime: '20:20', classroom: 'Lab 1' },
    { subjectId: 'dev-2-db', dayOfWeek: 3, startTime: '18:20', endTime: '22:20', classroom: 'Lab 2' },
    { subjectId: 'dev-2-so', dayOfWeek: 5, startTime: '18:20', endTime: '20:20', classroom: 'Aula 14' },

    // Dev 3
    { subjectId: 'dev-3-net', dayOfWeek: 1, startTime: '20:30', endTime: '22:20', classroom: 'Lab 4' },
    { subjectId: 'dev-3-sec', dayOfWeek: 4, startTime: '20:30', endTime: '22:20', classroom: 'Aula 15' },
    { subjectId: 'dev-3-final', dayOfWeek: 5, startTime: '20:30', endTime: '22:20', classroom: 'SUM' },

    // Design 1
    { subjectId: 'des-1-dg1', dayOfWeek: 1, startTime: '18:20', endTime: '22:20', classroom: 'Taller B' },
    { subjectId: 'des-1-img', dayOfWeek: 3, startTime: '18:20', endTime: '20:20', classroom: 'Microcine' },
    { subjectId: 'des-1-photo', dayOfWeek: 5, startTime: '18:20', endTime: '22:20', classroom: 'Estudio Foto' },

    // Design 2
    { subjectId: 'des-2-av', dayOfWeek: 2, startTime: '18:20', endTime: '22:20', classroom: 'Isla Edición 1' },
    { subjectId: 'des-2-video', dayOfWeek: 4, startTime: '18:20', endTime: '20:20', classroom: 'Isla Edición 2' },
    { subjectId: 'des-2-sound', dayOfWeek: 4, startTime: '20:30', endTime: '22:20', classroom: 'Estudio Sonido' },
    
    // Design 3
    { subjectId: 'des-3-3d', dayOfWeek: 1, startTime: '18:20', endTime: '20:20', classroom: 'Lab 3D' },
    { subjectId: 'des-3-post', dayOfWeek: 3, startTime: '20:30', endTime: '22:20', classroom: 'Isla Edición 3' },
    { subjectId: 'des-3-final', dayOfWeek: 5, startTime: '18:20', endTime: '20:20', classroom: 'SUM' },
];


export const INITIAL_USERS: User[] = [
  // Preceptors
  { id: 1, name: 'Carlos Gomez', email: 'carlos@preceptor.com', password: '123', role: Role.PRECEPTOR, careerId: 'dev', year: 1 },
  { id: 2, name: 'Ana Rodriguez', email: 'ana@preceptor.com', password: '123', role: Role.PRECEPTOR, careerId: 'design', year: 1 },

  // Software Students - Year 1
  { id: 101, name: 'Juan Perez', email: 'juan@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 102, name: 'Maria Lopez', email: 'maria@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 104, name: 'Laura Vargas', email: 'laura@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 105, name: 'David Gimenez', email: 'david@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 106, name: 'Sofia Romano', email: 'sofiar@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 107, name: 'Martin Castro', email: 'martin@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 108, name: 'Valentina Medina', email: 'valentina@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 109, name: 'Agustin Sosa', email: 'agustin@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 110, name: 'Camila Diaz', email: 'camila@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  { id: 111, name: 'Mateo Acosta', email: 'mateo@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 1 },
  
  // Software Students - Year 2
  { id: 103, name: 'Pedro Martinez', email: 'pedro@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 112, name: 'Javier Rios', email: 'javier@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 113, name: 'Florencia Juarez', email: 'florencia@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 114, name: 'Nicolas Vega', email: 'nicolas@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 115, name: 'Catalina Moreno', email: 'catalina@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 116, name: 'Bautista Rojas', email: 'bautista@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 117, name: 'Martina Benitez', email: 'martina@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 118, name: 'Santiago Molina', email: 'santiago@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 119, name: 'Victoria Ortiz', email: 'victoria@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },
  { id: 120, name: 'Lucas Silva', email: 'lucas@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 2 },

  // Software Students - Year 3
  { id: 121, name: 'Elena Herrera', email: 'elena@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 122, name: 'Facundo Romero', email: 'facundo@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 123, name: 'Isabella Quiroga', email: 'isabella@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 124, name: 'Felipe Castillo', email: 'felipe@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 125, name: 'Renata Ledesma', email: 'renata@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 126, name: 'Joaquin Ponce', email: 'joaquin@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 127, name: 'Abril Coronel', email: 'abril@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 128, name: 'Benjamin Vazquez', email: 'benjamin@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 129, name: 'Jazmin Ferreyra', email: 'jazmin@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },
  { id: 130, name: 'Thiago Ibarra', email: 'thiago@dev.com', password: '123', role: Role.STUDENT, careerId: 'dev', year: 3 },

  // Design Students - Year 1
  { id: 201, name: 'Lucia Fernandez', email: 'lucia@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 202, name: 'Diego Sanchez', email: 'diego@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 204, name: 'Clara Navarro', email: 'clara@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 205, name: 'Ignacio Roldan', email: 'ignacio@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 206, name: 'Guadalupe Rios', email: 'guadalupe@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 207, name: 'Manuel Pereyra', email: 'manuel@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 208, name: 'Olivia Mendez', email: 'olivia@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 209, name: 'Francisco Morales', email: 'francisco@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 210, name: 'Emilia Paez', email: 'emilia@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },
  { id: 211, name: 'Andres Miranda', email: 'andres@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 1 },

  // Design Students - Year 2
  { id: 203, name: 'Sofia Torres', email: 'sofia@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 212, name: 'Ambar Carrizo', email: 'ambar@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 213, name: 'Lautaro Godoy', email: 'lautaro@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 214, name: 'Pilar Cabrera', email: 'pilar@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 215, name: 'Daniel Sosa', email: 'daniel@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 216, name: 'Micaela Nuñez', email: 'micaela@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 217, name: 'Federico Aguilera', email: 'federico@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 218, name: 'Julieta Guzman', email: 'julieta@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 219, name: 'Ramiro Pacheco', email: 'ramiro@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  { id: 220, name: 'Paula Dominguez', email: 'paula@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 2 },
  
  // Design Students - Year 3
  { id: 221, name: 'Bruno Vega', email: 'bruno@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 222, name: 'Zoe Flores', email: 'zoe@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 223, name: 'Alejo Bravo', email: 'alejo@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 224, name: 'Delfina Peralta', email: 'delfina@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 225, name: 'Leo Montes', email: 'leo@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 226, name: 'Candelaria Luna', email: 'candelaria@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 227, name: 'Lisandro Nieva', email: 'lisandro@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 228, name: 'Regina Campos', email: 'regina@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 229, name: 'Santino Mercado', email: 'santino@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
  { id: 230, name: 'Amanda Nieves', email: 'amanda@design.com', password: '123', role: Role.STUDENT, careerId: 'design', year: 3 },
];

const createDate = (month: number, day: number) => {
  const d = new Date(2024, month - 1, day);
  return d.toISOString().split('T')[0];
};

// Function to generate more realistic attendance data
const generateStudentAttendance = (studentId: number, subjectId: string, totalClasses: number, absenceRate: number, justifiedRate: number): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    let absences = 0;
    for (let i = 0; i < totalClasses; i++) {
        const day = i + 1;
        const month = 6; // June / July
        const date = createDate(month + Math.floor(i/30), day % 30 + 1);
        let status: AttendanceStatus;
        const random = Math.random();
        
        if (random < absenceRate && absences < 8) {
             status = AttendanceStatus.ABSENT;
             absences++;
        } else if (random < absenceRate + justifiedRate) {
            status = AttendanceStatus.JUSTIFIED;
        } else {
            status = AttendanceStatus.PRESENT;
        }

        records.push({
            id: `att-${studentId}-${subjectId.split('-').pop()}-${i}`,
            studentId,
            subjectId,
            date,
            status,
        });
    }
    return records;
}

const manualRecordsForJuanPerezAlgo = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const studentId = 101;
    const subjectId = 'dev-1-algo';
    // 9 absences to make him "libre"
    for (let i = 1; i <= 9; i++) {
        records.push({ id: `att-${studentId}-${subjectId}-absent${i}`, studentId, subjectId, date: createDate(6, i*2), status: AttendanceStatus.ABSENT });
    }
    // 6 presents
    for (let i = 1; i <= 6; i++) {
        records.push({ id: `att-${studentId}-${subjectId}-present${i}`, studentId, subjectId, date: createDate(7, i*2), status: AttendanceStatus.PRESENT });
    }
    return records;
};

const recordsForMariaLopezProg1 = (): AttendanceRecord[] => {
    const studentId = 102;
    const subjectId = 'dev-1-prog1';
    const records = generateStudentAttendance(studentId, subjectId, 25, 0.20, 0.08); // ~5 absences, 2 justified

    // Find first absence and make it pending justification for demo
    const firstAbsenceIndex = records.findIndex(r => r.status === AttendanceStatus.ABSENT);
    if (firstAbsenceIndex !== -1) {
        records[firstAbsenceIndex].status = AttendanceStatus.PENDING_JUSTIFICATION;
        records[firstAbsenceIndex].justificationReason = 'Turno con el dentista, adjunto comprobante de asistencia a la consulta.';
        records[firstAbsenceIndex].justificationFile = { name: 'comprobante_dentista.pdf', type: 'application/pdf', content: '' };
    }
    return records;
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
    // Dev 1 - Juan Perez (101) - In risk in Prog1, Libre in Algo
    ...generateStudentAttendance(101, 'dev-1-prog1', 25, 0.20, 0.04), // ~5 absences, 1 justified -> 3 remaining
    ...manualRecordsForJuanPerezAlgo(), // 9 absences -> Libre
    ...generateStudentAttendance(101, 'dev-1-arq', 22, 0.0, 0.04),   // 0 absences, 1 justified

    // Dev 1 - Maria Lopez (102) - Has a pending justification
    ...recordsForMariaLopezProg1(),
    ...generateStudentAttendance(102, 'dev-1-algo', 20, 0.30, 0.05), // ~6 absences, 1 justified
    ...generateStudentAttendance(102, 'dev-1-arq', 22, 0.15, 0.1), // ~3 absences, 2 justified

    // Dev 2 - Pedro Martinez (103)
    ...generateStudentAttendance(103, 'dev-2-prog2', 30, 0.1, 0.05),
    ...generateStudentAttendance(103, 'dev-2-db', 28, 0.05, 0.05),
    ...generateStudentAttendance(103, 'dev-2-so', 25, 0.15, 0.0),
    
    // Design 1 - Lucia Fernandez (201)
    ...generateStudentAttendance(201, 'des-1-dg1', 28, 0.07, 0.1),
    ...generateStudentAttendance(201, 'des-1-img', 20, 0.0, 0.05),
    ...generateStudentAttendance(201, 'des-1-photo', 24, 0.12, 0.08),

    // Design 2 - Sofia Torres (203) - will be "libre" in AV
    ...generateStudentAttendance(203, 'des-2-av', 26, 0.40, 0.0), // high absence rate to fail
    ...generateStudentAttendance(203, 'des-2-video', 22, 0.1, 0.1),
    ...generateStudentAttendance(203, 'des-2-sound', 20, 0.05, 0.0),

    // Add some data for more students to make history view more populated
    // Dev 1 - Laura Vargas (104)
    ...generateStudentAttendance(104, 'dev-1-prog1', 25, 0.1, 0.1),
    ...generateStudentAttendance(104, 'dev-1-algo', 20, 0.15, 0.0),
    ...generateStudentAttendance(104, 'dev-1-arq', 22, 0.05, 0.05),

    // Design 1 - Diego Sanchez (202)
    ...generateStudentAttendance(202, 'des-1-dg1', 28, 0.05, 0.05),
    ...generateStudentAttendance(202, 'des-1-img', 20, 0.1, 0.0),
    ...generateStudentAttendance(202, 'des-1-photo', 24, 0.15, 0.1),
];


export const NEWS_ITEMS: NewsItem[] = [
  // General News
  { id: 'n1', text: 'Semana de finales: ¡Mucha suerte a todos los estudiantes!', careerId: undefined, year: undefined },
  { id: 'n4', text: 'Inscripciones a materias del próximo cuatrimestre abiertas del 1 al 5 de Agosto.', careerId: undefined, year: undefined },
  
  // Subject-specific News
  { id: 'n2', text: 'Examen de Programación II: Miércoles 24 de Julio.', careerId: 'dev', year: 2, subjectId: 'dev-2-prog2' },
  { id: 'n3', text: 'Entrega final del proyecto de Animación 3D: Viernes 26 de Julio.', careerId: 'design', year: 3, subjectId: 'des-3-3d' },
  { id: 'n5', text: 'Taller de Fotografía: Sábado 27 de Julio en el aula magna.', careerId: 'design', year: 1, subjectId: 'des-1-photo' },
  { id: 'n6', text: 'Recordatorio: TP N°3 de Algoritmos debe entregarse el Lunes.', careerId: 'dev', year: 1, subjectId: 'dev-1-algo'},
  { id: 'n7', text: 'Consulta para el parcial de Bases de Datos: Jueves a las 18hs.', careerId: 'dev', year: 2, subjectId: 'dev-2-db'},
];


export const INITIAL_PRIVATE_MESSAGES: PrivateMessage[] = [];

export const INITIAL_FORUM_THREADS: ForumThread[] = [
  {
    id: 'thread-1',
    authorId: 101, // Juan Perez
    title: '¿Alguien tiene apuntes de la clase de Algoritmos del lunes?',
    content: 'Me perdí la última clase de Algoritmos y Estructuras de Datos y estoy un poco perdido con el tema de árboles binarios. ¿Alguien podría compartir sus apuntes o un resumen? ¡Gracias!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: ForumThreadStatus.APPROVED,
    careerId: 'dev',
    year: 1,
  },
  {
    id: 'thread-2',
    authorId: 201, // Lucia Fernandez
    title: 'Recomendaciones de cámaras para la materia de Fotografía',
    content: 'Hola a todos, estoy buscando comprar una cámara para la materia de Fotografía pero no sé por dónde empezar. ¿Tienen alguna recomendación que no sea súper cara? ¿Qué es más importante, el lente o el cuerpo de la cámara para empezar?',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: ForumThreadStatus.APPROVED,
    careerId: 'design',
    year: 1,
  },
  {
    id: 'thread-3',
    authorId: 102, // Maria Lopez
    title: '¿Cómo instalar el entorno de desarrollo para Programación I?',
    content: 'Estoy teniendo problemas para instalar y configurar el entorno de desarrollo que pidió el profesor para Programación I. ¿Alguien podría explicarme los pasos o pasar algún tutorial? Me da error al compilar.',
    timestamp: new Date().toISOString(),
    status: ForumThreadStatus.PENDING,
    careerId: 'dev',
    year: 1,
  },
  {
    id: 'thread-4',
    authorId: 103, // Pedro Martinez
    title: 'Grupo de estudio para Bases de Datos',
    content: 'El parcial de Bases de Datos se viene complicado. ¿A alguien le gustaría armar un grupo de estudio? Podríamos juntarnos en la biblioteca los martes y jueves.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: ForumThreadStatus.APPROVED,
    careerId: 'dev',
    year: 2,
  },
];

export const INITIAL_FORUM_REPLIES: ForumReply[] = [
  {
    id: 'reply-1-1',
    threadId: 'thread-1',
    authorId: 104, // Laura Vargas
    content: '¡Hola Juan! Yo tengo los apuntes. Te los paso por mail. El tema principal fue el recorrido de árboles (in-order, pre-order, post-order).',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'reply-1-2',
    threadId: 'thread-1',
    authorId: 101, // Juan Perez
    content: '¡Genial, Laura! Muchísimas gracias, me salvaste.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'reply-2-1',
    threadId: 'thread-2',
    authorId: 202, // Diego Sanchez
    content: '¡Buena pregunta! Yo empecé con una Canon T7 usada y me funcionó de maravilla. Para empezar, un lente de kit 18-55mm es más que suficiente para aprender lo básico de composición y exposición.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'reply-4-1',
    threadId: 'thread-4',
    authorId: 112, // Javier Rios
    content: '¡Me sumo! Los jueves me viene perfecto.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
    // For Prototipo Alumno (Juan Perez, ID 101)
    { id: 'notif-101-1', userId: 101, type: NotificationType.ATTENDANCE_STATUS_LIBRE, text: 'Condición: Libre en Algoritmos y Estructuras de Datos', details: 'Has superado el límite de 8 faltas.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif-101-2', userId: 101, type: NotificationType.ATTENDANCE_WARNING, text: 'Alerta de Asistencia en Programación I', details: 'Te quedan solo 3 faltas para alcanzar el límite.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif-101-3', userId: 101, type: NotificationType.FORUM_THREAD_APPROVED, text: 'Tu publicación del foro ha sido aprobada.', details: 'Título: ¿Alguien tiene apuntes de la clase de Algoritmos del lunes?', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif-101-4', userId: 101, type: NotificationType.ANNOUNCEMENT, text: 'Nuevo anuncio', details: 'Inscripciones a materias del próximo cuatrimestre abiertas del 1 al 5 de Agosto.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: false },
    { id: 'notif-101-5', userId: 101, type: NotificationType.JUSTIFICATION_REJECTED, text: 'Tu solicitud de justificación ha sido rechazada.', details: 'Materia: Arquitectura de Computadoras', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: true },
    
    // For Prototipo Preceptor (Carlos Gomez, ID 1)
    { id: 'notif-1-1', userId: 1, type: NotificationType.JUSTIFICATION_REQUEST, text: 'Maria Lopez ha solicitado una justificación.', details: 'Materia: Programación I', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), read: false },
];