export const FLUTTER_CODE = `
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const SoporteApp());
}

class SoporteApp extends StatelessWidget {
  const SoporteApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Soporte TI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color(0xFFFF6D00),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFFF6D00)),
        useMaterial3: true,
      ),
      home: const PantallaPrincipal(),
    );
  }
}

class PantallaPrincipal extends StatefulWidget {
  const PantallaPrincipal({Key? key}) : super(key: key);

  @override
  State<PantallaPrincipal> createState() => _PantallaPrincipalState();
}

class _PantallaPrincipalState extends State<PantallaPrincipal> {
  int _currentIndex = 0;

  void _cambiarTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          PantallaFormulario(
            onTicketCreated: () => _cambiarTab(1),
          ),
          const PantallaListaTickets(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _cambiarTab,
        selectedItemColor: const Color(0xFFFF6D00),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.add_circle_outline),
            label: 'Nueva Solicitud',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.list_alt),
            label: 'Estado de Solicitudes',
          ),
        ],
      ),
    );
  }
}

// --- PANTALLA 1: FORMULARIO ---
class PantallaFormulario extends StatefulWidget {
  final VoidCallback onTicketCreated;
  const PantallaFormulario({Key? key, required this.onTicketCreated}) : super(key: key);

  @override
  State<PantallaFormulario> createState() => _PantallaFormularioState();
}

class _PantallaFormularioState extends State<PantallaFormulario> {
  final _nombreController = TextEditingController();
  final _lugarController = TextEditingController();
  String _prioridad = 'media';
  String _categoria = 'proyector';
  bool _isSubmitting = false;

  Future<void> _enviarSolicitud() async {
    if (_nombreController.text.isEmpty || _lugarController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor, llena tu nombre y el lugar.')),
      );
      return;
    }

    setState(() { _isSubmitting = true; });

    try {
      await FirebaseFirestore.instance.collection('supportTickets').add({
        'requesterName': _nombreController.text,
        'room': _lugarController.text,
        'priority': _prioridad,
        'category': _categoria,
        'status': 'pending',
        'createdAt': FieldValue.serverTimestamp(),
      });

      // Limpiar el formulario
      _nombreController.clear();
      _lugarController.clear();
      setState(() {
        _prioridad = 'media';
        _categoria = 'proyector';
      });

      // Mostrar diálogo de éxito
      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('¡Solicitud enviada!'),
            content: const Text('Tu ticket ha sido creado con éxito. El equipo de TI ha sido notificado.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Cerrar diálogo
                  widget.onTicketCreated(); // Ir a la pestaña de historial
                },
                child: const Text('Ver Mis Tickets', style: TextStyle(color: Color(0xFFFF6D00))),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF6D00), foregroundColor: Colors.white),
                onPressed: () {
                  Navigator.pop(context); // Cerrar diálogo y quedarse para crear otro
                },
                child: const Text('Aceptar'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error al enviar: $e')));
      }
    } finally {
      if (mounted) setState(() { _isSubmitting = false; });
    }
  }

  Widget _buildCategoryCard(String title, String value, IconData icon) {
    final isSelected = _categoria == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _categoria = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFFF6D00).withOpacity(0.1) : Colors.white,
            border: Border.all(
              color: isSelected ? const Color(0xFFFF6D00) : Colors.grey.shade300,
              width: 2,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: [
              Icon(icon, size: 40, color: isSelected ? const Color(0xFFFF6D00) : Colors.grey.shade500),
              const SizedBox(height: 8),
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isSelected ? const Color(0xFFFF6D00) : Colors.grey.shade700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPriorityButton(String title, String value) {
    final isSelected = _prioridad == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _prioridad = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFFF6D00) : Colors.grey.shade200,
            borderRadius: BorderRadius.circular(8),
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : Colors.grey.shade700,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text('Soporte TI', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFFFF6D00),
        centerTitle: true,
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 600),
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Nueva Solicitud', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                
                TextField(
                  controller: _nombreController,
                  decoration: InputDecoration(
                    labelText: 'Nombre del Solicitante',
                    prefixIcon: const Icon(Icons.person),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
                
                TextField(
                  controller: _lugarController,
                  decoration: InputDecoration(
                    labelText: 'Lugar (Ej. Sala de Juntas)',
                    prefixIcon: const Icon(Icons.meeting_room),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 24),

                const Text('Tipo de Soporte', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildCategoryCard('Internet', 'internet', Icons.wifi),
                    const SizedBox(width: 12),
                    _buildCategoryCard('Proyector', 'proyector', Icons.videocam),
                    const SizedBox(width: 12),
                    _buildCategoryCard('Otro', 'otro', Icons.help_outline),
                  ],
                ),
                const SizedBox(height: 24),

                const Text('Prioridad', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildPriorityButton('BAJA', 'baja'),
                    const SizedBox(width: 8),
                    _buildPriorityButton('MEDIA', 'media'),
                    const SizedBox(width: 8),
                    _buildPriorityButton('ALTA', 'alta'),
                  ],
                ),
                const SizedBox(height: 32),

                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF6D00),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _isSubmitting ? null : _enviarSolicitud,
                    child: _isSubmitting 
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('ENVIAR SOLICITUD', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// --- PANTALLA 2: LISTA DE TICKETS ---
class PantallaListaTickets extends StatelessWidget {
  const PantallaListaTickets({Key? key}) : super(key: key);

  String _formatDate(Timestamp? timestamp) {
    if (timestamp == null) return 'Justo ahora';
    final date = timestamp.toDate();
    return '\${date.day.toString().padLeft(2, '0')}/\${date.month.toString().padLeft(2, '0')} \${date.hour.toString().padLeft(2, '0')}:\${date.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text('Estado de Solicitudes', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFFFF6D00),
        centerTitle: true,
      ),
      body: StreamBuilder<QuerySnapshot>(
        // Traemos los últimos 30 tickets
        stream: FirebaseFirestore.instance
            .collection('supportTickets')
            .orderBy('createdAt', descending: true)
            .limit(30)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return const Center(child: Text('Error al cargar las solicitudes.'));
          }
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFFFF6D00)));
          }

          final docs = snapshot.data?.docs ?? [];
          if (docs.isEmpty) {
            return const Center(
              child: Text(
                'No hay solicitudes recientes.',
                style: TextStyle(fontSize: 18, color: Colors.grey),
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: docs.length,
            itemBuilder: (context, index) {
              final data = docs[index].data() as Map<String, dynamic>;
              
              final status = data['status'] ?? 'pending';
              final room = data['room'] ?? 'Sin lugar';
              final requester = data['requesterName'] ?? 'Sin nombre';
              final category = data['category'] ?? 'otro';
              
              String statusText = 'Pendiente';
              Color statusColor = const Color(0xFFFF6D00);
              IconData statusIcon = Icons.access_time_filled;

              if (status == 'in_progress') {
                statusText = 'En Proceso';
                statusColor = Colors.blue;
                statusIcon = Icons.build_circle;
              } else if (status == 'resolved') {
                statusText = 'Resuelto';
                statusColor = Colors.green;
                statusIcon = Icons.check_circle;
              }

              IconData catIcon = Icons.help_outline;
              if (category == 'internet') catIcon = Icons.wifi;
              if (category == 'proyector') catIcon = Icons.videocam;

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      // Ícono de estado
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(statusIcon, color: statusColor, size: 32),
                      ),
                      const SizedBox(width: 16),
                      // Info principal
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '\$requester (\n$room)',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(catIcon, size: 16, color: Colors.grey.shade600),
                                const SizedBox(width: 4),
                                Text(
                                  category.toUpperCase(),
                                  style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      // Estado y Fecha
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: statusColor,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              statusText,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _formatDate(data['createdAt'] as Timestamp?),
                            style: const TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
`;

