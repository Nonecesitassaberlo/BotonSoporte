import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, HelpCircle, CheckCircle2, Settings } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BureauLogo } from './BureauLogo';

export default function Kiosco() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '' // e.g. "Sala de Juntas"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    
    setLoading(true);
    try {
      // 1. Guardar en Firebase localmente
      await addDoc(collection(db, 'supportTickets'), {
        requesterName: formData.title,
        room: formData.location,
        category: 'Otro',
        priority: 'alta',
        status: 'pending',
        description: formData.content,
        createdAt: serverTimestamp()
      });

      // 2. Llamar a tu Cloud Function HTTP directamente
      // NOTA: Reemplaza esta URL con la URL exacta que te sale en la consola de Google Cloud
      // (la que empieza por https://enviarticketglpi-...)
      const functionUrl = 'https://enviarticketglpi-yvyuulh67a-uc.a.run.app'; 
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        console.error('Error al enviar a la Cloud Function:', await response.text());
      } else {
        console.log('Ticket enviado a GLPI correctamente a través de la Cloud Function');
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ title: '', content: '', location: '' });
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
            <BureauLogo className="h-14 w-auto" />
          </div>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-green-600" />
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative">
      {/* Botón discreto para que los administradores / TI puedan ir al panel si lo necesitan */}
      <Link 
        to="/admin" 
        className="absolute top-4 right-4 p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all"
        title="Acceso Panel TI"
      >
        <Settings size={20} />
      </Link>

      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl max-w-xl w-full border border-slate-100">
        {/* Encabezado con Logo oficial del Bureau */}
        <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-100">
          <BureauLogo className="h-16 sm:h-20 w-auto mb-2" />
          <span className="text-[11px] font-bold text-[#003865] uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full mt-2">
            Mesa de Ayuda TI • Salas y Eventos
          </span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#003865] rounded-xl flex items-center justify-center shadow-md shadow-blue-900/20 shrink-0">
            <HelpCircle size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">Solicitar Soporte Técnico</h1>
            <p className="text-slate-500 text-sm">Completa los datos para que el equipo de TI acuda de inmediato.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Asunto / Título</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ej: Problema con el proyector"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[#FF6D00] focus:ring-0 rounded-xl outline-none transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Descripción del problema</label>
            <textarea 
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Describe detalladamente qué está fallando..."
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[#FF6D00] focus:ring-0 rounded-xl outline-none transition-all text-slate-900 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Lugar / Ubicación</label>
            <div className="relative">
              <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Ej: Sala de Juntas Principal"
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-[#FF6D00] focus:ring-0 rounded-xl outline-none transition-all text-slate-900"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6D00] hover:bg-[#E66200] disabled:bg-orange-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all flex justify-center items-center"
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
