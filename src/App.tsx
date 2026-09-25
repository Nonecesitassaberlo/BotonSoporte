import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  Monitor, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MoreVertical,
  Search,
  Settings,
  Bell,
  Wrench,
  Wifi,
  Video,
  HelpCircle,
  Database
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import Kiosco from './components/Kiosco';
import { BureauLogo } from './components/BureauLogo';

// Types
type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'open';
type Priority = 'baja' | 'media' | 'alta';

interface Ticket {
  id: string;
  requesterName: string;
  room: string;
  category: string;
  priority: Priority;
  status: TicketStatus;
  createdAt: any;
  deviceId?: string;
}

function PanelAdmin() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [filter, setFilter] = useState<'all' | TicketStatus>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Check if Firebase is configured
    if (db.app.options.apiKey === "TU_API_KEY" || !db.app.options.apiKey) {
      setIsConfigured(false);
      setLoading(false);
      return;
    }

    // Real-time listener
    const q = query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData: Ticket[] = [];
      snapshot.forEach((doc) => {
        ticketsData.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      setTickets(ticketsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tickets:", error);
      if (error.code === 'permission-denied') {
        alert("Error de permisos en Firebase. Revisa las reglas de Firestore.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const ticketRef = doc(db, 'supportTickets', ticketId);
      await updateDoc(ticketRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("No se pudo actualizar el estado.");
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.')) {
      try {
        await deleteDoc(doc(db, 'supportTickets', ticketId));
      } catch (error) {
        console.error("Error al eliminar el ticket:", error);
        alert("No se pudo eliminar el ticket.");
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'internet': return <Wifi size={18} className="text-blue-500" />;
      case 'proyector': return <Video size={18} className="text-purple-500" />;
      default: return <HelpCircle size={18} className="text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    const styles = {
      baja: 'bg-green-100 text-green-800 border-green-200',
      media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      alta: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[priority] || styles.media}`}>
        {priority?.toUpperCase() || 'MEDIA'}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const normalized = status === 'open' ? 'pending' : (status || 'pending');
    const styles: Record<string, any> = {
      pending: { bg: 'bg-orange-100', text: 'text-orange-800', icon: <Clock size={14} className="mr-1" />, label: 'Pendiente' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Wrench size={14} className="mr-1" />, label: 'En Proceso' },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle2 size={14} className="mr-1" />, label: 'Resuelto' },
    };
    const s = styles[normalized] || styles.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
        {s.icon}
        {s.label}
      </span>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Justo ahora';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return new Intl.DateTimeFormat('es-ES', { 
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' 
      }).format(date);
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-2xl w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database size={40} className="text-[#FF6D00]" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Conecta tu Base de Datos</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Para ver los tickets en tiempo real desde tu tablet, necesitamos conectar este panel con tu proyecto de Firebase.
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-[#FF6D00] text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">1</span>
              Ve a la Consola de Firebase
            </h3>
            <p className="text-sm text-gray-600 mb-4 ml-8">
              Entra a tu proyecto <strong>boton-soporte</strong>, ve a la tuerca de Configuración (arriba a la izquierda) &gt; Configuración del proyecto.
            </p>
            
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-[#FF6D00] text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">2</span>
              Añade una App Web
            </h3>
            <p className="text-sm text-gray-600 mb-4 ml-8">
              Baja hasta la sección "Tus apps", haz clic en el ícono de Web (<strong>&lt;/&gt;</strong>), ponle un nombre como "Panel Web" y regístrala.
            </p>

            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-[#FF6D00] text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">3</span>
              Pásame la Configuración
            </h3>
            <p className="text-sm text-gray-600 ml-8">
              Te aparecerá un bloque de código con algo llamado <code>firebaseConfig</code>. <strong>Copia ese bloque y pégamelo en el chat</strong> para que yo lo conecte por ti.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const safeString = (str: any) => (typeof str === 'string' ? str : '');

  const filteredTickets = tickets.filter(t => {
    const searchLower = search.toLowerCase();
    const matchesSearch = safeString(t.requesterName).toLowerCase().includes(searchLower) || 
                          safeString(t.room).toLowerCase().includes(searchLower);
    const normalizedStatus = t.status === 'open' ? 'pending' : (t.status || 'pending');
    const matchesFilter = filter === 'all' || normalizedStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = tickets.filter(t => t.status === 'pending' || t.status === 'open' || !t.status).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800 flex flex-col gap-2">
          <BureauLogo variant="white" className="h-10 w-auto" />
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Panel TI • Bureau</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setFilter('all')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${filter === 'all' ? 'bg-[#FF6D00] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Database size={20} />
            <span className="font-medium">Todos los Tickets</span>
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${filter === 'pending' ? 'bg-[#FF6D00] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} />
              <span className="font-medium">Pendientes</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setFilter('in_progress')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${filter === 'in_progress' ? 'bg-[#FF6D00] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Wrench size={20} />
            <span className="font-medium">En Proceso</span>
          </button>
          <button 
            onClick={() => setFilter('resolved')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${filter === 'resolved' ? 'bg-[#FF6D00] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <CheckCircle2 size={20} />
            <span className="font-medium">Resueltos</span>
          </button>
          
          <Link 
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-slate-300 hover:bg-slate-800 mt-4 border border-slate-700"
          >
            <Monitor size={20} />
            <span className="font-medium">Ir al Kiosco (Tablet)</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <Settings size={20} />
            <span className="font-medium">Configuración</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {filter === 'all' && 'Todos los Tickets'}
            {filter === 'pending' && 'Tickets Pendientes'}
            {filter === 'in_progress' && 'Tickets en Proceso'}
            {filter === 'resolved' && 'Tickets Resueltos'}
          </h2>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar sala o persona..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-[#FF6D00] focus:ring-2 focus:ring-orange-200 rounded-xl outline-none transition-all w-64 text-gray-900"
              />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={24} />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <div className="w-10 h-10 bg-gradient-to-tr from-[#FF6D00] to-orange-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
              TI
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FF6D00] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Cargando tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Todo en orden</h3>
              <p className="text-gray-500">No hay tickets que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-6 py-4">Solicitante / Lugar</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Prioridad</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Hora</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{ticket.requesterName || 'Sin nombre'}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Monitor size={14} />
                          {ticket.room || 'Sin sala'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(ticket.category)}
                          <span className="font-medium text-gray-700 capitalize">
                            {ticket.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(ticket.status || 'pending')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(!ticket.status || ticket.status === 'pending' || ticket.status === 'open') && (
                            <button 
                              onClick={() => updateStatus(ticket.id, 'in_progress')}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                            >
                              Atender
                            </button>
                          )}
                          {(ticket.status === 'pending' || ticket.status === 'open' || ticket.status === 'in_progress') && (
                            <button 
                              onClick={() => updateStatus(ticket.id, 'resolved')}
                              className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                            >
                              Resolver
                            </button>
                          )}
                          <div className="relative group/menu">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical size={20} />
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 overflow-hidden">
                              <button 
                                onClick={() => deleteTicket(ticket.id)}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors"
                              >
                                Eliminar ticket
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* En la tablet o al abrir la raíz, entra directamente al Kiosco */}
        <Route path="/" element={<Kiosco />} />
        <Route path="/kiosco" element={<Kiosco />} />
        {/* El panel de administración para ver y gestionar tickets queda en /admin y /panel */}
        <Route path="/admin" element={<PanelAdmin />} />
        <Route path="/panel" element={<PanelAdmin />} />
      </Routes>
    </Router>
  );
}