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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
          <div className="flex justify-center mb-6">
            <BureauLogo className="h-16 w-auto" />
          </div>
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">¡Ticket Enviado!</h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Tu solicitud de soporte ha sido registrada exitosamente en GLPI. Un técnico del Bureau te atenderá pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Botón discreto para que TI pueda ir al panel */}
      <Link 
        to="/admin" 
        className="absolute top-4 right-4 p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all"
        title="Acceso Panel TI"
      >
        <Settings size={20} />
      </Link>

      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl max-w-2xl w-full border border-slate-100">
        {/* Encabezado con Logo oficial del Bureau */}
        <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-100">
          <BureauLogo className="h-14 sm:h-16 w-auto mb-2" />
          <span className="text-xs font-black text-[#003865] uppercase tracking-widest bg-sky-50 px-4 py-1.5 rounded-full mt-2">
            MESA DE AYUDA TI
          </span>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 text-red-700 text-sm font-semibold animate-shake">
            <AlertCircle size={20} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN 1: ASUNTO */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-black text-slate-800 tracking-wide uppercase">
                Asunto
              </label>
              {selectedSubject && (
                <span className="text-xs font-bold text-[#003865] bg-slate-100 px-2.5 py-0.5 rounded-full">
                  1 seleccionado
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {ASUNTOS.map((item) => {
                const isSelected = selectedSubject === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedSubject(item.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? 'bg-[#003865] text-white shadow-md shadow-[#003865]/20 ring-2 ring-[#003865]'
                        : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-white' : 'text-slate-400'} />
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
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-[#003865] focus:bg-white rounded-xl outline-none transition-all text-slate-900 font-medium placeholder-slate-400"
                />
              </div>
            )}
          </div>

          {/* SECCIÓN 2: LUGAR */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-[#003865]" />
                <label className="block text-sm font-black text-slate-800 tracking-wide uppercase">
                  Lugar
                </label>
              </div>
              {selectedLocation && (
                <span className="text-xs font-bold text-[#003865] bg-slate-100 px-2.5 py-0.5 rounded-full">
                  1 seleccionado
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {LUGARES.map((lugar) => {
                const isSelected = selectedLocation === lugar;
                return (
                  <button
                    key={lugar}
                    type="button"
                    onClick={() => setSelectedLocation(lugar)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? 'bg-[#003865] text-white shadow-md shadow-[#003865]/20 ring-2 ring-[#003865]'
                        : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
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
            <div className="flex items-center gap-1.5 mb-2">
              <FileText size={16} className="text-[#003865]" />
              <label className="block text-sm font-black text-slate-800 tracking-wide uppercase">
                Descripción del problema <span className="text-red-500">*</span>
              </label>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe detalladamente qué está fallando o qué necesitas..."
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-[#003865] rounded-2xl outline-none transition-all text-slate-900 placeholder-slate-400 resize-none font-medium leading-relaxed"
            />
          </div>

          {/* BOTÓN ENVIAR */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6D00] hover:bg-[#E66200] active:scale-[0.99] disabled:bg-orange-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/25 transition-all flex justify-center items-center gap-2 cursor-pointer uppercase tracking-wider"
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
