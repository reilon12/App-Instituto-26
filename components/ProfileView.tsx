import React, { useState, useEffect, useRef } from 'react';
import { User, UserProfileData, PersonalLink } from '../types';
import { ArrowLeftIcon, CameraIcon, CheckIcon, Edit3Icon, LinkIcon, MapPinIcon, PhoneIcon, PlusCircleIcon, ShieldIcon, TrashIcon, UserIcon, XCircleIcon } from './Icons';

interface ProfileViewProps {
  viewedUser: User;
  currentUser: User;
  profileData: UserProfileData;
  onUpdateProfile: (data: UserProfileData) => void;
  onBack: () => void;
}

const ImageUploader: React.FC<{ label: string; currentImage?: string; onImageSelect: (base64: string) => void; className?: string; isCircle?: boolean; isDisabled?: boolean; }> = 
({ label, currentImage, onImageSelect, className = '', isCircle = false, isDisabled = false }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState(currentImage);

    useEffect(() => { setImage(currentImage) }, [currentImage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isDisabled) return;
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setImage(base64);
                onImageSelect(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`${className} relative group ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`} onClick={() => !isDisabled && fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={isDisabled} />
            {image ? (
                <img src={image} alt={label} className={`w-full h-full object-cover ${isCircle ? 'rounded-full' : ''}`} />
            ) : (
                <div className={`w-full h-full bg-[--color-secondary] flex items-center justify-center ${isCircle ? 'rounded-full' : ''}`}>
                    <UserIcon className="w-1/2 h-1/2 text-[--color-text-secondary]" />
                </div>
            )}
            {!isDisabled && (
                <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isCircle ? 'rounded-full' : ''}`}>
                    <CameraIcon className="w-8 h-8 text-white mb-1" />
                    <span className="text-white text-xs text-center">{label}</span>
                </div>
            )}
        </div>
    );
};

export const ProfileView: React.FC<ProfileViewProps> = ({ viewedUser, currentUser, profileData, onUpdateProfile, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfileData>(profileData);
  
  const isReadOnly = viewedUser.id !== currentUser.id;

  useEffect(() => {
    setFormData(profileData);
    setIsEditing(false); // Reset editing state when viewed user changes
  }, [profileData, viewedUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleLinkChange = (id: string, field: 'label' | 'url', value: string) => {
    const updatedLinks = formData.personalLinks?.map(link => 
        link.id === id ? { ...link, [field]: value } : link
    );
    setFormData({ ...formData, personalLinks: updatedLinks });
  };

  const addLink = () => {
    const newLink: PersonalLink = { id: `link-${Date.now()}`, label: '', url: '' };
    setFormData({ ...formData, personalLinks: [...(formData.personalLinks || []), newLink] });
  };

  const removeLink = (id: string) => {
    setFormData({ ...formData, personalLinks: formData.personalLinks?.filter(link => link.id !== id) });
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };
  
  const accentColor = formData.profileAccentColor || 'var(--color-accent)';
  const effectiveIsEditing = !isReadOnly && isEditing;

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto">
        <div className="solid-card rounded-2xl overflow-hidden mb-6">
            <div className="h-40 sm:h-48 bg-[--color-secondary] relative">
                <ImageUploader 
                    label="Cambiar Banner"
                    currentImage={formData.bannerImage}
                    onImageSelect={(base64) => setFormData({...formData, bannerImage: base64})}
                    className="w-full h-full"
                    isDisabled={!effectiveIsEditing}
                />
            </div>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-20">
                    <div className="shrink-0">
                         <ImageUploader 
                            label="Cambiar Foto"
                            currentImage={formData.profilePicture}
                            onImageSelect={(base64) => setFormData({...formData, profilePicture: base64})}
                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[--color-primary] shadow-lg bg-[--color-primary]"
                            isCircle
                            isDisabled={!effectiveIsEditing}
                        />
                    </div>
                    <div className="flex-grow text-center sm:text-left pt-2 sm:pt-16">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[--color-text-primary]">{viewedUser.name}</h1>
                        <p className="text-[--color-text-secondary]">{viewedUser.email}</p>
                    </div>
                    <div className="w-full sm:w-auto shrink-0 sm:pt-16">
                        {isReadOnly ? (
                             <button onClick={onBack} className="btn btn-primary w-full"><ArrowLeftIcon className="w-5 h-5"/> Volver</button>
                        ) : !isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="btn btn-primary w-full"><Edit3Icon className="w-5 h-5"/> Editar Perfil</button>
                        ) : (
                            <div className="flex gap-2 w-full">
                                 <button onClick={handleCancel} className="btn btn-secondary flex-1"><XCircleIcon className="w-5 h-5"/> Cancelar</button>
                                <button onClick={handleSave} className="btn btn-success flex-1"><CheckIcon className="w-5 h-5"/> Guardar</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <div className="solid-card p-6">
                    <h2 className="text-lg font-bold text-[--color-text-primary] mb-4">Sobre mí</h2>
                    {effectiveIsEditing ? (
                         <textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} rows={4} className="input-styled w-full" placeholder="Escribe algo sobre ti..." />
                    ) : (
                        <p className="text-[--color-text-secondary]">{formData.bio || `Aún no se ha añadido una biografía.`}</p>
                    )}
                </div>
                 <div className="solid-card p-6">
                    <h2 className="text-lg font-bold text-[--color-text-primary] mb-4">Enlaces</h2>
                    <div className="space-y-3">
                        {effectiveIsEditing ? (
                            <>
                                {formData.personalLinks?.map(link => (
                                    <div key={link.id} className="flex gap-2 items-center">
                                        <input type="text" placeholder="Etiqueta" value={link.label || ''} onChange={(e) => handleLinkChange(link.id, 'label', e.target.value)} className="input-styled w-1/3 text-sm"/>
                                        <input type="url" placeholder="URL" value={link.url || ''} onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)} className="input-styled flex-1 text-sm"/>
                                        <button onClick={() => removeLink(link.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                <button onClick={addLink} className="btn btn-secondary w-full mt-2"><PlusCircleIcon className="w-5 h-5"/> Añadir Enlace</button>
                            </>
                        ) : (
                            formData.personalLinks?.filter(l => l.url).length > 0 ? formData.personalLinks?.map(link => (
                                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[--color-text-secondary] hover:text-[--color-accent] transition-colors group">
                                    <LinkIcon className="w-5 h-5" />
                                    <span className="font-semibold group-hover:underline">{link.label || link.url}</span>
                                </a>
                            )) : <p className="text-[--color-text-secondary]">No se han añadido enlaces.</p>
                        )}
                    </div>
                </div>
                {effectiveIsEditing && (
                     <div className="solid-card p-6">
                        <h2 className="text-lg font-bold text-[--color-text-primary] mb-4">Color de Acento del Perfil</h2>
                        <input type="color" name="profileAccentColor" value={formData.profileAccentColor || '#c09a58'} onChange={handleInputChange} className="w-full h-10 p-1 bg-white border border-gray-300 rounded-lg cursor-pointer"/>
                    </div>
                )}
            </div>
            <div className="lg:col-span-2 solid-card p-6" style={{"--profile-accent": accentColor} as React.CSSProperties}>
                <h2 className="text-lg font-bold text-[--color-text-primary] mb-4">Información Personal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--profile-accent)]/10 text-[var(--profile-accent)] shrink-0"><PhoneIcon/></div>
                            <div>
                                <p className="text-sm text-[--color-text-secondary]">Teléfono</p>
                                {effectiveIsEditing ? <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="input-styled w-full"/> : <p className="font-semibold text-[--color-text-primary]">{formData.phone || 'No especificado'}</p>}
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--profile-accent)]/10 text-[var(--profile-accent)] shrink-0"><MapPinIcon/></div>
                            <div>
                                <p className="text-sm text-[--color-text-secondary]">Dirección</p>
                                {effectiveIsEditing ? <input name="address" value={formData.address || ''} onChange={handleInputChange} className="input-styled w-full"/> : <p className="font-semibold text-[--color-text-primary]">{formData.address || 'No especificado'}</p>}
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--profile-accent)]/10 text-[var(--profile-accent)] shrink-0"><ShieldIcon/></div>
                            <div>
                                <p className="text-sm text-[--color-text-secondary]">Contacto de Emergencia</p>
                                {effectiveIsEditing ? <input name="emergencyContact" value={formData.emergencyContact || ''} onChange={handleInputChange} className="input-styled w-full"/> : <p className="font-semibold text-[--color-text-primary]">{formData.emergencyContact || 'No especificado'}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="bg-[--color-secondary] p-4 rounded-lg">
                        <h3 className="font-bold text-[--color-text-primary] mb-3">Datos Académicos</h3>
                        <div className="space-y-3 text-sm">
                           <p><span className="font-semibold">ID:</span> {viewedUser.id}</p>
                           <p><span className="font-semibold">Carrera:</span> {viewedUser.careerId === 'dev' ? 'Des. de Software' : 'Diseño'}</p>
                           <p><span className="font-semibold">Año:</span> {viewedUser.year}° Año</p>
                           <p><span className="font-semibold">Rol:</span> {viewedUser.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};