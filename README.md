# Study Room - Plataforma de Estudio Colaborativo (Frontend)

Aplicación web cliente para Study Room, un espacio digital de estudio colaborativo que permite a los usuarios crear salas privadas, comunicarse mediante mensajería en tiempo real y realizar llamadas de audio, video y compartición de pantalla basadas en WebRTC.

---

## Stack Tecnológico

- **React 19**: Biblioteca principal para la construcción de la interfaz de usuario basada en componentes.
- **TypeScript**: Tipado estático para garantizar mantenibilidad, escalabilidad y detección temprana de errores.
- **Vite**: Entorno de desarrollo y empaquetador de alto rendimiento.
- **Tailwind CSS v4**: Framework de utilidades CSS para el diseño de la interfaz con esquema nocturno.
- **React Router DOM v7**: Gestión del enrutamiento declarativo y estructura de navegación de la aplicación.

---

## Requisitos Previos

Antes de iniciar el entorno de desarrollo, asegúrese de contar con las siguientes herramientas instaladas en el sistema:

- **Node.js**: Versión 22.x (LTS recomendada) y su gestor de paquetes `npm`.
- **Docker** y **Docker Compose**: Requeridos para la ejecución contenerizada e integración completa con el backend.

---

## Instalación y Ejecución Local

Siga estos pasos para ejecutar el servidor de desarrollo de forma local:

1. **Clonar el repositorio y acceder al directorio del frontend:**
   ```bash
   git clone https://github.com/Miniproyecto-II-proyecto-integrador/frontend.git
   cd mini2/frontend
   ```

2. **Configurar las variables de entorno:**
   Cree un archivo `.env` en la raíz de `frontend/` basándose en `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Asegúrese de definir la variable `VITE_API_URL` apuntando a la dirección del servidor backend (por ejemplo, `http://localhost:3000`).

3. **Instalar las dependencias del proyecto:**
   ```bash
   npm install
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

---

## Despliegue y Contenedores

### Despliegue Continuo (CI/CD)
El despliegue en producción se encuentra automatizado mediante **Vercel**, integrándose directamente con el repositorio para compilar y publicar los cambios aprobados en la rama principal.

### Ejecución con Docker
El directorio incluye un [Dockerfile](Dockerfile) configurado bajo un esquema **multietapa (multi-stage build)**:
1. **Etapa de construcción (`node:22-alpine`)**: Instala dependencias de forma limpia (`npm ci`) y genera los artefactos estáticos de producción (`npm run build`).
2. **Etapa de servidor (`nginx:alpine`)**: Sirve el contenido compilado desde `/usr/share/nginx/html` en el puerto `80`, incluyendo la regla `try_files $uri $uri/ /index.html;` para soportar el enrutamiento SPA de React Router.

Para levantar el entorno completo (frontend y backend) de manera orquestada, ejecute desde la **raíz del proyecto**:

```bash
docker-compose up --build
```

---


## Equipo

- Juan Marin Orozco ([@JuanmoCode](https://github.com/JuanmoCode))
- Juan Diego Ledezma Muñoz ([@Ju4nD1ego](https://github.com/Ju4nD1ego))
- Brandon Alexis Franco Flor ([@BrandoliOrname](https://github.com/BrandoliOrname))
- Isabela Bermudez Moreno ([@isabelabermudez](https://github.com/isabelabermudez))

---

**Proyecto Integrador - MiniProyecto 2**  
Profesor: Fabián Stiven Valencia Córdoba
