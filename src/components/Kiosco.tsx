import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Settings, Wifi, Mail, Laptop, MoreHorizontal, MapPin, AlertCircle, FileText } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BureauLogo } from './BureauLogo';

const ASUNTOS = [
  { id: 'INTERNET', label: 'INTERNET', icon: Wifi },
  { id: 'M365', label: 'M365', icon: Mail },
  { id: 'EQUIPO', label: 'EQUIPO', icon: Laptop },
  { id: 'OTRO', label: 'OTRO', icon: MoreHorizontal },
];

const LUGARES = [
  'ADMINISTRATIVA',
  'COMUNICACIONES',
  'JURIDICA',
  'MARKETING',
  'COMERCIAL'
];

export default function Kiosco() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedSubject) {
      setErrorMsg('Por favor selecciona un Asunto.');
      return;
    }
    if (selectedSubject === 'OTRO' && !customSubject.trim()) {
      setErrorMsg('Por favor especifica el Asunto en el campo de texto.');
      return;
    }
    if (!selectedLocation) {
      setErrorMsg('Por favor selecciona el Lugar / Área.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Por favor ingresa la descripción del problema.');
      return;
    }

    const finalTitle = selectedSubject === 'OTRO' ? customSubject.trim() : selectedSubject;

    setLoading(true);
    try {
      // 1. Guardar en Firebase localmente
      await addDoc(collection(db, 'supportTickets'), {
        requesterName: `${finalTitle} (${selectedLocation})`,
        room: selectedLocation,
        category: selectedSubject,
        priority: 'alta',
        status: 'pending',
        description: description.trim(),
        createdAt: serverTimestamp()
      });

      // 2. Llamar a tu Cloud Function HTTP para GLPI
      const functionUrl = 'https://enviarticketglpi-yvyuulh67a-uc.a.run.app'; 
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `${finalTitle} - ${selectedLocation}`,
          content: description.trim(),
          location: selectedLocation,
          category: selectedSubject
        })
      });
      
      if (!response.ok) {
        console.error('Error al enviar a la Cloud Function:', await response.text());
      } else {
        console.log('Ticket enviado a GLPI correctamente a través de la Cloud Function');
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedSubject('');
        setCustomSubject('');
        setSelectedLocation('');
        setDescription('');
      }, 4000);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al enviar el ticket. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F6F8F8] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 sm:p-12 rounded-[28px] shadow-[0_12px_45px_-12px_rgba(0,63,72,0.07)] max-w-lg w-full text-center border border-[#B8CBCD]/40">
          <div className="flex justify-center mb-6">
            <BureauLogo className="h-16 w-auto" />
          </div>
          <div className="w-20 h-20 bg-[#EAF4F1] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-[#00565A]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#003F48] mb-3">¡Ticket Enviado!</h1>
          <p className="text-[#00565A]/80 text-base sm:text-lg leading-relaxed font-medium">
            Tu solicitud de soporte ha sido registrada exitosamente en GLPI. Un técnico del Bureau te atenderá pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F8] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Botón discreto para que TI pueda ir al panel */}
      <Link 
        to="/admin" 
        className="absolute top-4 right-4 p-2.5 text-[#B8CBCD] hover:text-[#00565A] hover:bg-[#EAF4F1]/60 rounded-xl transition-all z-20"
        title="Acceso Panel TI"
      >
        <Settings size={20} />
      </Link>

      <div className="bg-white p-6 sm:p-10 md:p-12 rounded-[28px] shadow-[0_12px_45px_-12px_rgba(0,63,72,0.07)] max-w-2xl w-full border border-[#B8CBCD]/40 relative overflow-hidden">
        {/* Ilustración en línea sutil de Medellín (Montañas, Skyline y Metrocable) */}
        <div className="absolute top-0 right-0 w-64 sm:w-80 md:w-96 h-44 sm:h-52 pointer-events-none select-none overflow-hidden opacity-35 sm:opacity-45">
          <svg 
            viewBox="0 0 360 190" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover text-[#138A7E]"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Montañas en el fondo */}
            <path 
              d="M 10 160 Q 60 90 120 120 T 220 50 T 320 80 T 370 60" 
              strokeWidth="1.4"
              opacity="0.65"
            />
            <path 
              d="M 70 170 Q 130 115 190 135 T 290 85 T 370 110" 
              strokeWidth="1.1" 
              opacity="0.45"
            />

            {/* Línea del Metrocable */}
            <line x1="210" y1="20" x2="365" y2="85" strokeWidth="1.3" opacity="0.8" />
            <line x1="210" y1="24" x2="365" y2="89" strokeWidth="0.8" opacity="0.5" strokeDasharray="3 3" />

            {/* Cabina del Metrocable */}
            <g transform="translate(305, 58)" opacity="0.9">
              {/* Brazo sujetador al cable */}
              <line x1="12" y1="-5" x2="12" y2="8" strokeWidth="1.4" />
              <circle cx="12" cy="-5" r="2" fill="currentColor" />
              {/* Cabina */}
              <rect x="0" y="8" width="24" height="20" rx="5" strokeWidth="1.3" fill="white" />
              <rect x="3" y="11" width="18" height="8" rx="2" strokeWidth="0.9" fill="none" opacity="0.75" />
              <line x1="9" y1="11" x2="9" y2="19" strokeWidth="0.8" />
              <line x1="15" y1="11" x2="15" y2="19" strokeWidth="0.8" />
              <line x1="4" y1="23" x2="20" y2="23" strokeWidth="0.8" opacity="0.5" />
            </g>

            {/* Edificios del Skyline de Medellín */}
            {/* Torre Coltejer (emblemática) */}
            <g transform="translate(255, 95)" opacity="0.85">
              <path d="M 14 0 L 14 -12 M 14 0 L 2 15 L 26 15 Z" strokeWidth="1.1" fill="white" />
              <rect x="2" y="15" width="24" height="75" strokeWidth="1.2" fill="white" />
              <line x1="8" y1="22" x2="8" y2="85" strokeWidth="0.8" opacity="0.5" />
              <line x1="14" y1="22" x2="14" y2="85" strokeWidth="0.8" opacity="0.5" />
              <line x1="20" y1="22" x2="20" y2="85" strokeWidth="0.8" opacity="0.5" />
              <line x1="2" y1="35" x2="26" y2="35" strokeWidth="0.7" opacity="0.5" />
              <line x1="2" y1="52" x2="26" y2="52" strokeWidth="0.7" opacity="0.5" />
              <line x1="2" y1="70" x2="26" y2="70" strokeWidth="0.7" opacity="0.5" />
            </g>

            {/* Edificio Moderno */}
            <g transform="translate(225, 115)" opacity="0.8">
              <rect x="0" y="0" width="22" height="70" strokeWidth="1.2" fill="white" />
              <line x1="5" y1="8" x2="17" y2="8" strokeWidth="0.8" />
              <line x1="5" y1="18" x2="17" y2="18" strokeWidth="0.8" />
              <line x1="5" y1="28" x2="17" y2="28" strokeWidth="0.8" />
              <line x1="5" y1="38" x2="17" y2="38" strokeWidth="0.8" />
              <line x1="5" y1="48" x2="17" y2="48" strokeWidth="0.8" />
              <line x1="5" y1="58" x2="17" y2="58" strokeWidth="0.8" />
            </g>

            {/* Edificio Escalonado */}
            <g transform="translate(288, 122)" opacity="0.8">
              <path d="M 0 15 L 6 15 L 6 0 L 20 0 L 20 65 L 0 65 Z" strokeWidth="1.2" fill="white" />
              <rect x="9" y="8" width="8" height="10" strokeWidth="0.8" />
              <rect x="9" y="24" width="8" height="10" strokeWidth="0.8" />
              <rect x="9" y="40" width="8" height="10" strokeWidth="0.8" />
            </g>

            {/* Edificio 3 */}
            <g transform="translate(202, 138)" opacity="0.7">
              <rect x="0" y="0" width="18" height="48" strokeWidth="1" fill="white" />
              <line x1="4" y1="10" x2="14" y2="10" strokeWidth="0.7" />
              <line x1="4" y1="20" x2="14" y2="20" strokeWidth="0.7" />
              <line x1="4" y1="30" x2="14" y2="30" strokeWidth="0.7" />
            </g>

            {/* Árboles urbanos */}
            <g transform="translate(178, 158)" opacity="0.75">
              <circle cx="9" cy="9" r="8" strokeWidth="1" fill="white" />
              <line x1="9" y1="17" x2="9" y2="28" strokeWidth="1" />
            </g>
            <g transform="translate(192, 162)" opacity="0.7">
              <circle cx="7" cy="7" r="6" strokeWidth="1" fill="white" />
              <line x1="7" y1="13" x2="7" y2="24" strokeWidth="1" />
            </g>
            <g transform="translate(315, 160)" opacity="0.75">
              <circle cx="8" cy="8" r="7" strokeWidth="1" fill="white" />
              <line x1="8" y1="15" x2="8" y2="26" strokeWidth="1" />
            </g>
          </svg>
        </div>

        {/* Encabezado con Logo oficial del Bureau */}
        <div className="flex flex-col items-center mb-6 pb-6 border-b border-[#EAF4F1] relative z-10">
          <BureauLogo className="h-16 sm:h-20 w-auto mb-2" />
          <span className="text-xs font-bold text-[#00565A] uppercase tracking-[0.2em] bg-[#EAF4F1] px-5 py-1.5 rounded-full mt-2 select-none">
            MESA DE AYUDA TI
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#E95454] rounded-r-xl flex items-center gap-3 text-[#E95454] text-sm font-semibold animate-shake">
            <AlertCircle size={20} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* SECCIÓN 1: ASUNTO */}
          <div>
            <label className="block text-sm sm:text-[15px] font-bold text-[#003F48] tracking-wider uppercase mb-3 select-none">
              ASUNTO
            </label>

            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {ASUNTOS.map((item) => {
                const isSelected = selectedSubject === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedSubject(item.id)}
                    className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer select-none active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#00565A] text-white border-2 border-[#00565A] shadow-md shadow-[#00565A]/20'
                        : 'bg-white text-[#003F48] border-2 border-[#B8CBCD] hover:border-[#138A7E] hover:bg-[#F6F8F8]'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-white' : 'text-[#00565A]'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Campo adicional cuando selecciona "OTRO" */}
            {selectedSubject === 'OTRO' && (
              <div className="mt-3.5 animate-fadeIn">
                <input
                  type="text"
                  required
                  autoFocus
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Escribe el asunto del requerimiento..."
                  className="w-full px-5 py-3.5 bg-white border-2 border-[#00565A] focus:ring-4 focus:ring-[#00565A]/10 rounded-2xl outline-none transition-all text-[#003F48] font-medium placeholder-[#8A9FA2]"
                />
              </div>
            )}
          </div>

          {/* SECCIÓN 2: LUGAR */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin size={17} className="text-[#00565A]" />
              <label className="block text-sm sm:text-[15px] font-bold text-[#003F48] tracking-wider uppercase select-none">
                LUGAR
              </label>
            </div>

            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {LUGARES.map((lugar) => {
                const isSelected = selectedLocation === lugar;
                return (
                  <button
                    key={lugar}
                    type="button"
                    onClick={() => setSelectedLocation(lugar)}
                    className={`px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer select-none active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#00565A] text-white border-2 border-[#00565A] shadow-md shadow-[#00565A]/20'
                        : 'bg-white text-[#003F48] border-2 border-[#B8CBCD] hover:border-[#138A7E] hover:bg-[#F6F8F8]'
                    }`}
                  >
                    {lugar}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN 3: DESCRIPCIÓN DEL PROBLEMA */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <FileText size={17} className="text-[#00565A]" />
              <label className="block text-sm sm:text-[15px] font-bold text-[#003F48] tracking-wider uppercase select-none">
                DESCRIPCIÓN DEL PROBLEMA <span className="text-[#E95454]">*</span>
              </label>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe detalladamente qué está fallando o qué necesitas..."
              className="w-full px-5 py-4 bg-white border-2 border-[#B8CBCD] focus:border-[#00565A] focus:ring-4 focus:ring-[#00565A]/10 rounded-[18px] outline-none transition-all text-[#003F48] placeholder-[#8A9FA2] resize-none font-medium leading-relaxed text-sm sm:text-base"
            />
          </div>

          {/* BOTÓN ENVIAR */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00565A] hover:bg-[#00474A] active:scale-[0.99] disabled:bg-[#B8CBCD] disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-[#00565A]/20 transition-all flex justify-center items-center gap-2 cursor-pointer uppercase tracking-wider mt-4"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Enviar Ticket a Soporte'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
