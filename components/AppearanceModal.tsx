import React from 'react';
import { Theme, BorderStyle, FontStyle, THEMES } from '../App';
import { PaletteIcon, SimpleBorderIcon, RefinedBorderIcon, GradientBorderIcon, NeonBorderIcon, AccentBorderIcon, DoubleBorderIcon, TypeIcon } from './Icons';

interface AppearanceViewProps {
  currentTheme: Theme;
  onSetTheme: (theme: Theme) => void;
  currentBorderStyle: BorderStyle;
  onSetBorderStyle: (style: BorderStyle) => void;
  currentFontStyle: FontStyle;
  onSetFontStyle: (style: FontStyle) => void;
}

const BORDER_STYLES: Record<BorderStyle, { name: string; description: string; icon: React.ReactNode }> = {
    sencillo: { name: 'Sencillo', description: 'Un borde fino, limpio y minimalista.', icon: <SimpleBorderIcon className="w-8 h-8"/> },
    refinado: { name: 'Refinado', description: 'Borde grueso con sombra interior para dar profundidad.', icon: <RefinedBorderIcon className="w-8 h-8"/> },
    gradiente: { name: 'Gradiente', description: 'Un borde dinámico y moderno con el color de acento.', icon: <GradientBorderIcon className="w-8 h-8"/> },
    neon: { name: 'Neón', description: 'Un resplandor llamativo que reemplaza al borde físico.', icon: <NeonBorderIcon className="w-8 h-8"/> },
    acentuado: { name: 'Acentuado', description: 'Borde superior grueso para un toque de carácter.', icon: <AccentBorderIcon className="w-8 h-8"/> },
    doble: { name: 'Doble', description: 'Un borde doble para un acabado más distinguido.', icon: <DoubleBorderIcon className="w-8 h-8"/> },
};

const FONT_STYLES: Record<FontStyle, { name: string; description: string; headingFont: string, bodyFont: string }> = {
    predeterminado: { name: 'Predeterminado', description: 'Moderno y claro.', headingFont: 'Poppins', bodyFont: 'Nunito Sans' },
    clasico: { name: 'Clásico', description: 'Tradicional y legible.', headingFont: 'Roboto Slab', bodyFont: 'Roboto' },
    moderno: { name: 'Moderno', description: 'Geométrico y limpio.', headingFont: 'Montserrat', bodyFont: 'Open Sans' },
    elegante: { name: 'Elegante', description: 'Sofisticado y de alto contraste.', headingFont: 'Playfair Display', bodyFont: 'Lato' },
    tecnico: { name: 'Técnico', description: 'Estructurado y digital.', headingFont: 'Source Code Pro', bodyFont: 'Inter' },
    amigable: { name: 'Amigable', description: 'Suave y redondeado.', headingFont: 'Comfortaa', bodyFont: 'Quicksand' },
}

export const AppearanceView: React.FC<AppearanceViewProps> = ({ currentTheme, onSetTheme, currentBorderStyle, onSetBorderStyle, currentFontStyle, onSetFontStyle }) => {
  return (
    <div className="animate-fade-in-up">
        <div className="solid-card w-full max-w-4xl p-6 md:p-8 mx-auto">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[--color-text-primary]">Modelos de Apariencia</h2>
                    <p className="text-[--color-text-secondary]">Personaliza la apariencia de la aplicación.</p>
                </div>
            </div>

            {/* Theme Selector */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <PaletteIcon className="w-6 h-6 text-[--color-text-secondary]"/>
                <h3 className="text-lg font-semibold text-[--color-text-primary]">Temas de Color</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.entries(THEMES) as [Theme, typeof THEMES[Theme]][]).map(([themeKey, themeData]) => (
                    <button
                        key={themeKey}
                        onClick={() => onSetTheme(themeKey)}
                        className={`p-4 rounded-lg text-left transition-all border-2 ${currentTheme === themeKey ? '' : 'border-transparent hover:bg-[--color-secondary]'}`}
                        style={{ borderColor: currentTheme === themeKey ? themeData.accent : 'transparent' }}
                    >
                        <div className="flex items-center gap-2">
                            <PaletteIcon className="w-5 h-5" style={{ color: themeData.accent }}/>
                            <span className="font-semibold text-[--color-text-primary]">{themeData.name}</span>
                        </div>
                        <div className="flex gap-1.5 mt-3">
                            <span className="w-5 h-5 rounded-full" style={{ backgroundColor: themeData.colors.bg, border: '1px solid var(--color-border)' }}></span>
                            <span className="w-5 h-5 rounded-full" style={{ backgroundColor: themeData.colors.primary, border: '1px solid var(--color-border)' }}></span>
                            <span className="w-5 h-5 rounded-full" style={{ backgroundColor: themeData.colors.accent }}></span>
                        </div>
                    </button>
                ))}
              </div>
            </section>
            
            {/* Border Style Selector */}
            <section className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <SimpleBorderIcon className="w-6 h-6 text-[--color-text-secondary]"/>
                    <h3 className="text-lg font-semibold text-[--color-text-primary]">Estilos de Borde</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {(Object.entries(BORDER_STYLES) as [BorderStyle, typeof BORDER_STYLES[BorderStyle]][]).map(([styleKey, styleData]) => (
                         <button
                            key={styleKey}
                            onClick={() => onSetBorderStyle(styleKey)}
                            className={`p-4 rounded-lg text-left transition-all border-2 flex items-start gap-4 ${currentBorderStyle === styleKey ? 'border-[--color-accent]' : 'border-transparent hover:bg-[--color-secondary]'}`}
                         >
                            <div className="text-[--color-accent] shrink-0 mt-1">
                                {styleData.icon}
                            </div>
                            <div>
                                <p className="font-semibold text-[--color-text-primary]">{styleData.name}</p>
                                <p className="text-sm text-[--color-text-secondary] mt-1">{styleData.description}</p>
                            </div>
                         </button>
                     ))}
                </div>
            </section>

            {/* Font Style Selector */}
            <section className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <TypeIcon className="w-6 h-6 text-[--color-text-secondary]"/>
                    <h3 className="text-lg font-semibold text-[--color-text-primary]">Fuente</h3>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(Object.entries(FONT_STYLES) as [FontStyle, typeof FONT_STYLES[FontStyle]][]).map(([styleKey, styleData]) => (
                         <button
                            key={styleKey}
                            onClick={() => onSetFontStyle(styleKey)}
                            className={`p-4 rounded-lg text-left transition-all border-2 ${currentFontStyle === styleKey ? 'border-[--color-accent]' : 'border-transparent hover:bg-[--color-secondary]'}`}
                         >
                            <div>
                                <p className="font-semibold text-[--color-text-primary]" style={{fontFamily: styleData.headingFont}}>{styleData.name}</p>
                                <p className="text-sm text-[--color-text-secondary] mt-1" style={{fontFamily: styleData.bodyFont}}>{styleData.description}</p>
                                <p className="text-sm text-[--color-text-primary] mt-2" style={{fontFamily: styleData.bodyFont}}>Aa Bb Cc 123</p>
                            </div>
                         </button>
                     ))}
                </div>
            </section>

        </div>
    </div>
  );
};
