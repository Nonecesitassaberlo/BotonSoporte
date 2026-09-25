# 🛠️ Sistema de Soporte TI - Sala de Juntas

¡Bienvenido al nuevo sistema de solicitudes de soporte técnico! Este proyecto consta de dos partes principales diseñadas para agilizar la atención en las salas de juntas:

1.  **App para Tablet (Flutter):** Una interfaz sencilla para que los usuarios soliciten ayuda con un solo toque.
2.  **Panel Web (React + Firebase):** Un dashboard en tiempo real para que el equipo de TI gestione los tickets.

---

## 📱 1. Instalación de la App en la Tablet (Android)

Para instalar la aplicación en la tablet de la sala de juntas, sigue estos pasos:

### Requisitos previos:
*   Una tablet o teléfono con sistema operativo **Android**.
*   El archivo instalable **`app-release.apk`** (incluido en esta entrega).

### Pasos de instalación:
1.  **Transfiere el archivo:** Copia el archivo `app-release.apk` a la tablet (puedes usar un cable USB, enviarlo por correo electrónico, Google Drive, etc.).
2.  **Abre el archivo:** Desde la tablet, usa el explorador de archivos para buscar el `app-release.apk` y tócalo para abrirlo.
3.  **Permisos de seguridad:** Si es la primera vez que instalas una app fuera de la Play Store, Android te mostrará un mensaje de seguridad.
    *   Toca en **"Configuración"** o **"Ajustes"**.
    *   Activa la opción **"Permitir desde esta fuente"** (o "Orígenes desconocidos").
    *   Vuelve atrás y toca **"Instalar"**.
4.  **¡Listo!** Una vez finalizada la instalación, busca el ícono de **"Soporte TI"** (color naranja) en tu lista de aplicaciones y ábrela.

---

## 💻 2. Acceso al Panel Web de TI

El equipo de soporte no necesita instalar nada. El panel de control está alojado en la nube y se actualiza en tiempo real.

### ¿Cómo acceder?
1.  Abre cualquier navegador web (Chrome, Edge, Safari, etc.) en tu computadora o celular.
2.  Ingresa a la siguiente dirección:
    👉 **[https://boton-soporte.web.app](https://boton-soporte.web.app)**
3.  Guarda esta página en tus **Favoritos** o marcadores para tener acceso rápido.

### Funciones del Panel:
*   **Tiempo Real:** Los tickets aparecen instantáneamente en la pantalla en cuanto un usuario los envía desde la tablet.
*   **Gestión de Estados:**
    *   Haz clic en **"Atender"** para indicar que un técnico está en camino (el ticket pasará a color azul).
    *   Haz clic en **"Resolver"** cuando el problema esté solucionado (el ticket pasará a color verde y desaparecerá de los pendientes).
*   **Búsqueda:** Usa la barra superior para buscar tickets por el nombre del solicitante o la sala.
*   **Eliminar:** Si necesitas borrar un ticket de prueba o duplicado, pasa el mouse sobre los tres puntos verticales (⋮) a la derecha del ticket y selecciona "Eliminar".

---

## 🏗️ Información Técnica (Para Desarrolladores)

Si necesitas hacer modificaciones al código fuente en el futuro:

*   **Base de Datos:** El sistema utiliza **Firebase Firestore** para sincronizar los datos en tiempo real entre la tablet y el panel web.
*   **Frontend Web:** Construido con **React**, **Vite** y **Tailwind CSS**. Alojado en Firebase Hosting.
*   **App Móvil:** Construida con **Flutter** y Dart.

*Desarrollado para optimizar el tiempo de respuesta y mejorar la experiencia en las salas de juntas.*🚀
