import React, { useState, useMemo } from 'react';
import { User, ForumThread, ForumReply, ForumThreadStatus, Role } from '../types';
import { ArrowLeftIcon, ChatBubbleIcon, LockClosedIcon, LockOpenIcon, MessageSquareIcon, PencilIcon, SendIcon, TrashIcon, UserIcon, XCircleIcon } from './Icons';

interface ForumsViewProps {
  currentUser: User;
  allUsers: User[];
  threads: ForumThread[];
  replies: ForumReply[];
  onAddThread: (thread: Omit<ForumThread, 'id' | 'timestamp' | 'status' | 'isLocked'>) => void;
  onEditThread?: (threadId: string, title: string, content: string) => void;
  onAddReply: (reply: Omit<ForumReply, 'id' | 'timestamp'>) => void;
  onUpdateThreadStatus?: (threadId: string, status: ForumThreadStatus, reason?: string) => void;
  onDeleteThread?: (threadId: string) => void;
  onDeleteReply?: (replyId: string) => void;
  onToggleLockThread?: (threadId: string) => void;
}

const TimeAgo: React.FC<{ date: string }> = ({ date }) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return <span>hace {diffInSeconds}s</span>;
    if (diffInSeconds < 3600) return <span>hace {Math.floor(diffInSeconds / 60)}m</span>;
    if (diffInSeconds < 86400) return <span>hace {Math.floor(diffInSeconds / 3600)}h</span>;
    return <span>hace {Math.floor(diffInSeconds / 86400)}d</span>;
}

const RejectionModal: React.FC<{ threadTitle: string, onClose: () => void, onConfirm: (status: ForumThreadStatus, reason: string) => void }> = ({ threadTitle, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-[--color-text-primary] mb-2">Rechazar Publicación</h2>
                <p className="text-[--color-text-secondary] mb-4">Estás a punto de rechazar: "{threadTitle}"</p>
                <div>
                    <label htmlFor="rejection-reason" className="block text-sm font-medium text-[--color-text-secondary] mb-1">Motivo (opcional para rechazo, requerido para solicitar cambios)</label>
                    <textarea id="rejection-reason" value={reason} onChange={e => setReason(e.target.value)} rows={3} className="input-styled w-full" placeholder="Explica por qué la publicación no es adecuada o qué cambios necesita." />
                </div>
                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[--color-border]">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                    <button type="button" onClick={() => onConfirm(ForumThreadStatus.REJECTED, reason)} className="btn btn-danger">Rechazar Permanentemente</button>
                    <button type="button" onClick={() => onConfirm(ForumThreadStatus.NEEDS_REVISION, reason)} disabled={!reason.trim()} className="btn btn-primary">Solicitar Cambios</button>
                </div>
            </div>
        </div>
    );
};

const ThreadEditor: React.FC<{ initialThread?: ForumThread, onClose: () => void, onSave: (title: string, content: string, threadId?: string) => void }> = ({ initialThread, onClose, onSave }) => {
    const [title, setTitle] = useState(initialThread?.title || '');
    const [content, setContent] = useState(initialThread?.content || '');
    const [error, setError] = useState('');
    const isEditing = !!initialThread;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setError('El título y el contenido no pueden estar vacíos.'); return;
        }
        onSave(title, content, initialThread?.id);
    }
    
    return (
        <div className="fixed inset-0 bg-[--color-primary] z-50 animate-fade-in">
            <form onSubmit={handleSubmit} className="w-full h-full flex flex-col">
                <header className="p-4 border-b border-[--color-border] shrink-0 flex justify-between items-center bg-[--color-header-bg] backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-[--color-text-primary]">{isEditing ? 'Editar Hilo' : 'Crear Nuevo Hilo'}</h2>
                    <div className="flex items-center gap-2">
                         <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                         <button type="submit" className="btn btn-primary">{isEditing ? 'Guardar Cambios' : 'Publicar'}</button>
                    </div>
                </header>
                <main className="p-6 flex-grow overflow-y-auto">
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <div>
                            <label htmlFor="thread-title" className="sr-only">Título</label>
                            <input id="thread-title" type="text" placeholder="Título..." value={title} onChange={e => setTitle(e.target.value)} className="input-styled w-full text-2xl font-bold !p-2 !bg-transparent border-0 focus:!ring-0 focus:border-b-2 focus:border-[--color-accent] rounded-none"/>
                        </div>
                        <div>
                           <label htmlFor="thread-content" className="sr-only">Contenido</label>
                           <textarea id="thread-content" placeholder="Escribe tu pregunta o tema de discusión aquí..." value={content} onChange={e => setContent(e.target.value)} rows={20} className="input-styled w-full !bg-transparent border-0 focus:!ring-0 focus:border-0 rounded-none !p-2" />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                </main>
            </form>
        </div>
    );
};

export const ForumsView: React.FC<ForumsViewProps> = (props) => {
  const { currentUser, allUsers, threads, replies, onAddThread, onEditThread, onAddReply, onUpdateThreadStatus, onDeleteThread, onDeleteReply, onToggleLockThread } = props;
  
  const isPreceptor = currentUser.role === Role.PRECEPTOR;
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [editingThread, setEditingThread] = useState<ForumThread | null>(null);
  const [rejectingThread, setRejectingThread] = useState<ForumThread | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u])), [allUsers]);

  const visibleThreads = useMemo(() => {
    return threads
      .filter(t => t.careerId === currentUser.careerId && t.year === currentUser.year)
      .filter(t => {
        if (isPreceptor) return t.status !== ForumThreadStatus.REJECTED;
        return t.status === ForumThreadStatus.APPROVED || (t.authorId === currentUser.id && (t.status === ForumThreadStatus.PENDING || t.status === ForumThreadStatus.NEEDS_REVISION));
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [threads, currentUser, isPreceptor]);

  const selectedThread = useMemo(() => {
    if (!selectedThreadId) return null;
    return threads.find(t => t.id === selectedThreadId);
  }, [selectedThreadId, threads]);

  const threadReplies = useMemo(() => {
    if (!selectedThreadId) return [];
    return replies.filter(r => r.threadId === selectedThreadId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [selectedThreadId, replies]);
  
  const handleCreateOrEditThread = (title: string, content: string, threadId?: string) => {
    if (threadId && onEditThread) {
        onEditThread(threadId, title, content);
    } else {
        onAddThread({ authorId: currentUser.id, title, content, careerId: currentUser.careerId, year: currentUser.year });
    }
    setIsCreatingThread(false);
    setEditingThread(null);
  };

  const handleConfirmRejection = (status: ForumThreadStatus, reason: string) => {
    if (rejectingThread && onUpdateThreadStatus) {
        onUpdateThreadStatus(rejectingThread.id, status, reason);
    }
    setRejectingThread(null);
  };

  const handleAddReply = (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyContent.trim() || !selectedThreadId) return;
      onAddReply({ threadId: selectedThreadId, authorId: currentUser.id, content: replyContent });
      setReplyContent('');
  };

  const handleDeleteThread = (threadId: string) => {
    if(window.confirm('¿Estás seguro de que quieres eliminar este hilo? Esta acción no se puede deshacer.')) {
        onDeleteThread?.(threadId);
        setSelectedThreadId(null);
    }
  }

  if (selectedThread) {
    const author = userMap.get(selectedThread.authorId);
    const isOwner = selectedThread.authorId === currentUser.id;
    return (
        <div className="animate-fade-in-up">
            {rejectingThread && isPreceptor && <RejectionModal threadTitle={rejectingThread.title} onClose={() => setRejectingThread(null)} onConfirm={handleConfirmRejection} />}
            {editingThread && <ThreadEditor initialThread={editingThread} onClose={() => setEditingThread(null)} onSave={handleCreateOrEditThread} />}

            <button onClick={() => setSelectedThreadId(null)} className="btn btn-secondary mb-6"><ArrowLeftIcon className="w-5 h-5"/> Volver al Foro</button>
            <div className="solid-card p-6 md:p-8">
                <div className="border-b border-[--color-border] pb-6 mb-6">
                    <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-[--color-text-primary] flex-grow w-full sm:w-auto">{selectedThread.title}</h1>
                        <div className="flex gap-2 shrink-0">
                             {isOwner && onToggleLockThread && (
                                <button onClick={() => onToggleLockThread(selectedThread.id)} className="btn btn-secondary" title={selectedThread.isLocked ? 'Desbloquear comentarios' : 'Bloquear comentarios'}>
                                    {selectedThread.isLocked ? <LockClosedIcon className="w-5 h-5"/> : <LockOpenIcon className="w-5 h-5"/>}
                                </button>
                            )}
                            {(isOwner || isPreceptor) && onDeleteThread && (
                                 <button onClick={() => handleDeleteThread(selectedThread.id)} className="btn btn-danger"><TrashIcon className="w-5 h-5"/></button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-[--color-text-secondary]">
                        <UserIcon className="w-4 h-4" />
                        <span>Publicado por {author?.name || 'Desconocido'}</span>
                        <span>&bull;</span>
                        <span><TimeAgo date={selectedThread.timestamp} /></span>
                    </div>

                    {isPreceptor && selectedThread.status === ForumThreadStatus.PENDING && onUpdateThreadStatus && (
                        <div className="mt-6 p-4 bg-[--color-secondary] rounded-lg border border-[--color-border]">
                            <h3 className="font-bold text-[--color-text-primary]">Acción Requerida</h3>
                            <p className="text-sm text-[--color-text-secondary] mb-3">Esta publicación está pendiente de aprobación.</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button onClick={() => onUpdateThreadStatus(selectedThread.id, ForumThreadStatus.APPROVED, '')} className="btn btn-success flex-1">Aprobar</button>
                                <button onClick={() => setRejectingThread(selectedThread)} className="btn btn-danger flex-1">Rechazar</button>
                            </div>
                        </div>
                    )}

                    <p className="mt-4 text-[--color-text-primary] whitespace-pre-wrap">{selectedThread.content}</p>
                </div>

                <h2 className="text-xl font-bold text-[--color-text-primary] mb-4">{threadReplies.length} Respuestas</h2>
                <div className="space-y-6">
                    {threadReplies.map(reply => {
                        const replyAuthor = userMap.get(reply.authorId);
                        const canDeleteReply = isPreceptor || isOwner;
                        return (
                            <div key={reply.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-[--color-secondary] flex items-center justify-center shrink-0"><UserIcon className="w-6 h-6 text-[--color-accent]"/></div>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-bold text-[--color-text-primary]">{replyAuthor?.name || 'Desconocido'}</span>
                                            <span className="text-sm text-[--color-text-secondary] ml-2"><TimeAgo date={reply.timestamp} /></span>
                                        </div>
                                        {canDeleteReply && <button onClick={() => onDeleteReply?.(reply.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-500/10 transition-colors"><TrashIcon className="w-4 h-4"/></button>}
                                    </div>
                                    <p className="mt-1 text-[--color-text-primary]">{reply.content}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {selectedThread.isLocked ? (
                  <div className="mt-8 pt-6 border-t border-[--color-border] text-center text-[--color-text-secondary]">
                    <LockClosedIcon className="w-8 h-8 mx-auto mb-2"/>
                    <p>Los comentarios están cerrados para esta publicación.</p>
                  </div>
                ) : (
                    <form onSubmit={handleAddReply} className="mt-8 pt-6 border-t border-[--color-border] flex items-start gap-4">
                         <div className="w-10 h-10 rounded-full bg-[--color-secondary] flex items-center justify-center shrink-0"><UserIcon className="w-6 h-6 text-[--color-accent]"/></div>
                         <div className="flex-grow">
                            <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={3} placeholder="Escribe una respuesta..." className="input-styled w-full"></textarea>
                            <div className="flex justify-end mt-2">
                                <button type="submit" className="btn btn-primary">Responder</button>
                            </div>
                         </div>
                    </form>
                )}
            </div>
        </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {isCreatingThread && <ThreadEditor onClose={() => setIsCreatingThread(false)} onSave={handleCreateOrEditThread} />}
      {editingThread && <ThreadEditor initialThread={editingThread} onClose={() => setEditingThread(null)} onSave={handleCreateOrEditThread} />}
      {rejectingThread && isPreceptor && <RejectionModal threadTitle={rejectingThread.title} onClose={() => setRejectingThread(null)} onConfirm={handleConfirmRejection} />}
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[--color-text-primary] flex items-center gap-3"><ChatBubbleIcon/> Foro General</h1>
          <p className="text-[--color-text-secondary]">Consulta y colabora con tus compañeros.</p>
        </div>
        {!isPreceptor && <button onClick={() => setIsCreatingThread(true)} className="btn btn-primary"><PencilIcon className="w-5 h-5"/> Crear Nuevo Hilo</button>}
      </div>

      <div className="space-y-4">
        {visibleThreads.length > 0 ? visibleThreads.map(thread => {
          const author = userMap.get(thread.authorId);
          const replyCount = replies.filter(r => r.threadId === thread.id).length;
          return (
            <div key={thread.id} onClick={() => setSelectedThreadId(thread.id)} className="solid-card p-5 cursor-pointer hover:border-[--color-accent] border-2 border-transparent transition-all transform hover:scale-[1.02]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-[--color-secondary] flex flex-col items-center justify-center shrink-0">
                        <span className="font-bold text-xl text-[--color-accent]">{replyCount}</span>
                        <span className="text-xs text-[--color-text-secondary]">resp.</span>
                    </div>
                    <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-lg text-[--color-text-primary] hover:text-[--color-accent] transition-colors truncate">{thread.title}</h3>
                        <p className="text-sm text-[--color-text-secondary] truncate">por {author?.name || 'Desconocido'} &bull; <TimeAgo date={thread.timestamp} /></p>
                    </div>
                </div>
                {thread.status === ForumThreadStatus.PENDING && <span className="bg-yellow-500/20 text-yellow-600 text-xs font-bold px-3 py-1 rounded-full shrink-0">PENDIENTE</span>}
                {thread.status === ForumThreadStatus.NEEDS_REVISION && <span className="bg-orange-500/20 text-orange-600 text-xs font-bold px-3 py-1 rounded-full shrink-0">EN REVISIÓN</span>}
              </div>
              {thread.status === ForumThreadStatus.NEEDS_REVISION && thread.authorId === currentUser.id && (
                  <div className="mt-4 bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                    <p className="font-bold text-yellow-700">Se solicitaron cambios</p>
                    <p className="text-sm text-yellow-600 my-2">Motivo: "{thread.rejectionReason}"</p>
                    <button onClick={(e) => { e.stopPropagation(); setEditingThread(thread); }} className="btn btn-primary text-sm py-1">Editar y Reenviar</button>
                  </div>
              )}
            </div>
          );
        }) : (
            <div className="text-center py-16 text-[--color-text-secondary]">
                <ChatBubbleIcon className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                <h3 className="text-xl font-bold text-[--color-text-primary]">¡El foro está tranquilo!</h3>
                <p>Aún no hay hilos de discusión. ¡Sé el primero en empezar uno!</p>
            </div>
        )}
      </div>
    </div>
  );
};
