import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Endpoint proxy para GLPI
  app.post('/api/tickets', async (req, res) => {
    try {
      const { title, content, location } = req.body;
      
      // URL correcta de la API REST de GLPI según tu hosting
      const glpiUrl = 'https://soportefenix.com/apirest.php';
      const appToken = '1Tv0iX81ClWV19AP9d5f2SgDwwQkV6lC2Jo0B5K0';
      const userToken = 'ldqkyx1NwDS2lwKAaHWaZwsdJ1EiO3czgBYoibb8';

      // 1. Iniciar sesión en GLPI pasando user_token
      const initRes = await fetch(`${glpiUrl}/initSession?user_token=${userToken}`, {
        method: 'GET',
        headers: {
          'App-Token': appToken
        }
      });
      
      if (!initRes.ok) {
        const errorText = await initRes.text();
        console.error('Error al iniciar sesión en GLPI:', errorText);
        return res.status(500).json({ error: "Error al iniciar sesión en GLPI", details: errorText });
      }
      
      const sessionData = await initRes.json();
      const sessionToken = sessionData.session_token;

      if (!sessionToken) {
        return res.status(500).json({ error: "No se pudo obtener el token de sesión de GLPI" });
      }

      // 2. Crear ticket en GLPI
      const ticketRes = await fetch(`${glpiUrl}/Ticket`, {
        method: 'POST',
        headers: {
          'App-Token': appToken,
          'Session-Token': sessionToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: {
            name: title,
            content: `${content}\n\nUbicación: ${location}`,
            entities_id: 4, // Entidad Raíz > Empresas > Bureau
            status: 1, // Nuevo
            requesttypes_id: 1, // Incidente
            urgency: 3, // Media
          }
        })
      });

      if (!ticketRes.ok) {
        const ticketError = await ticketRes.text();
        console.error('Error al crear ticket en GLPI:', ticketError);
      }

      // 3. Cerrar sesión
      await fetch(`${glpiUrl}/killSession`, {
        method: 'GET',
        headers: {
          'App-Token': appToken,
          'Session-Token': sessionToken
        }
      });
      
      res.json({ success: true, message: "Ticket enviado a GLPI exitosamente" });
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ error: "Error interno al crear el ticket" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
