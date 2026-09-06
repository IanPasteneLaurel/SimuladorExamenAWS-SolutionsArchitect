# 🎓 SAA-C03 Exam Simulator

> Simulador interactivo y educativo para la certificación **AWS Certified Solutions Architect - Associate (SAA-C03)**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Demo](#-demo)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Deployment](#-deployment)
- [Datos del Examen](#-datos-del-examen)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

### 🎯 Core Features

- **923 Preguntas Reales** del examen SAA-C03
- **14 Exámenes Completos** (66 preguntas cada uno, sin repetición)
- **Cronómetro Real** de 132 minutos por examen
- **Explicaciones Detalladas** estilo instructor para cada pregunta
- **Modo Flash Study** con sesiones rápidas de 10, 20 o 30 preguntas
- **Tracking de Progreso** con gráficos y estadísticas
- **Predictor de Score Real** basado en tu desempeño
- **100% Offline-First** - Sin necesidad de backend
- **Responsive Design** - Funciona en móvil, tablet y desktop

### 📊 Analytics Incluidos

- Score promedio y evolución
- Análisis por dominio AWS
- Historial completo de exámenes
- Identificación de áreas débiles
- Predicción de score real (0-1000)

### 🏗️ Dominios Cubiertos

- **Design Secure Architectures** (347 preguntas - 37.6%)
- **Design High-Performing Architectures** (244 preguntas - 26.4%)
- **Design Cost-Optimized Architectures** (140 preguntas - 15.2%)
- **Design Resilient Architectures** (131 preguntas - 14.2%)
- **Design Operationally Excellent Architectures** (61 preguntas - 6.6%)

## 🚀 Demo

[Ver Demo en Vivo](https://saa-c03-simulator.vercel.app) _(próximamente)_

### Screenshots

```
┌─────────────────────────────────────────┐
│  🏠 HOME - Dashboard Principal          │
│  - Estadísticas de progreso             │
│  - Acceso rápido a exámenes             │
│  - Modo Flash Study                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📝 EXAM MODE - Simulacro Real          │
│  - 66 preguntas                         │
│  - Timer de 132 minutos                 │
│  - Explicaciones detalladas             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ⚡ FLASH MODE - Estudio Rápido        │
│  - 10, 20 o 30 preguntas aleatorias    │
│  - Sin cronómetro                       │
│  - Ideal para repaso                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📊 PROGRESS - Analytics                │
│  - Gráficos de evolución                │
│  - Score predictor                      │
│  - Análisis por dominio                 │
└─────────────────────────────────────────┘
```

## 🛠️ Instalación

### Prerequisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0

### Pasos

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/SimuladorExamenAWS-SolutionsArchitect.git
cd SimuladorExamenAWS-SolutionsArchitect
```

2. **Instalar dependencias**

```bash
cd app
npm install
```

3. **Validar datos (opcional pero recomendado)**

```bash
cd ..
node scripts/validate-questions.js
```

4. **Iniciar servidor de desarrollo**

```bash
cd app
npm run dev
```

5. **Abrir en navegador**

Visita [http://localhost:5173](http://localhost:5173)

## 🎮 Uso

### Modo Examen Completo

1. En el home, click en **"Examen Completo"**
2. Selecciona uno de los 14 exámenes disponibles
3. El cronómetro iniciará automáticamente (132 minutos)
4. Responde las 66 preguntas
5. Al finalizar, verás tu score y análisis detallado
6. El progreso se guarda automáticamente en LocalStorage

### Modo Flash Study

1. En el home, selecciona **"Flash Study"**
2. Elige la cantidad de preguntas (10, 20 o 30)
3. Responde sin presión de tiempo
4. Ideal para repasar temas específicos

### Ver Progreso

1. Click en **"Mi Progreso"**
2. Visualiza:
   - Exámenes completados
   - Score promedio
   - Evolución gráfica
   - Dominios fuertes/débiles
   - Predicción de score real

## 📁 Estructura del Proyecto

```
SimuladorExamenAWS-SolutionsArchitect/
├── app/                          # Aplicación React
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── QuestionView.jsx
│   │   │   ├── ExplanationView.jsx
│   │   │   ├── Timer.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── ScoreCard.jsx
│   │   ├── pages/                # Páginas principales
│   │   │   ├── Home.jsx
│   │   │   ├── ExamMode.jsx
│   │   │   ├── FlashMode.jsx
│   │   │   └── Progress.jsx
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useQuestions.js
│   │   │   ├── useProgress.js
│   │   │   ├── useTimer.js
│   │   │   └── useScoring.js
│   │   ├── utils/                # Utilidades
│   │   │   ├── storage.js        # LocalStorage helpers
│   │   │   └── scoring.js        # Scoring logic
│   │   ├── data/                 # Datos JSON
│   │   │   ├── SAA-C03-QuestionBank-923.json
│   │   │   ├── exams-metadata.json
│   │   │   └── exams-full.json
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   └── favicon.svg
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── scripts/                      # Scripts de utilidad
│   └── validate-questions.js     # Validación de datos
├── docs/                         # Documentación
│   ├── PRD-SAA-C03-SIMULATOR.md
│   └── BRIEFING-PARA-KIRO.md
├── vercel.json                   # Config de Vercel
└── README.md
```

## 🚀 Deployment

### Vercel (Recomendado)

1. **Instalar Vercel CLI**

```bash
npm i -g vercel
```

2. **Deploy**

```bash
vercel
```

3. **Production Deploy**

```bash
vercel --prod
```

### Build Manual

```bash
cd app
npm run build
```

Los archivos estáticos se generan en `app/dist/`

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
VITE_APP_NAME=SAA-C03 Simulator
VITE_APP_VERSION=1.0.0
```

## 📊 Datos del Examen

### Banco de Preguntas

- **Total:** 923 preguntas únicas
- **Fuente:** Preguntas reales del examen SAA-C03
- **Formato:** JSON estructurado

### Estructura de Pregunta

```json
{
  "question_id": 36,
  "domain": "Cost-Optimized Architectures",
  "difficulty": 2,
  "question_en": "A company runs a multi-tier application...",
  "options": {
    "A": "Use Amazon EC2 instances...",
    "B": "Use AWS Lambda functions...",
    "C": "Use Amazon RDS...",
    "D": "Use Amazon DynamoDB..."
  },
  "correct_answer": "B",
  "explanation": {
    "full_text": "Complete explanation...",
    "why_correct": "Lambda is cost-effective because...",
    "why_wrong": {
      "A": "EC2 requires provisioning...",
      "C": "RDS has ongoing costs...",
      "D": "Not suitable for..."
    },
    "aws_services": ["Lambda", "EventBridge", "RDS"],
    "architectural_concept": "Cost Optimization",
    "exam_tips": "AWS uses COST-EFFECTIVE when...",
    "memorize": ["Key point 1", "Key point 2"]
  }
}
```

### Exámenes

- **Total:** 14 exámenes completos
- **Preguntas por examen:** 66 (excepto el último con 65)
- **Sin repetición:** Cada pregunta aparece en un solo examen
- **Distribución:** Balanceada por dominio AWS

## 🧪 Testing

### Validación de Datos

```bash
node scripts/validate-questions.js
```

Este script verifica:
- ✅ Todas las preguntas tienen IDs únicos
- ✅ Opciones completas (A, B, C, D)
- ✅ Respuesta correcta válida
- ✅ Explicaciones presentes
- ✅ Sin duplicados entre exámenes
- ✅ Consistencia de metadata

### Testing Manual

Ver [docs/TESTING.md](docs/TESTING.md) para guía completa de testing manual.

## 📈 Roadmap

### ✅ Phase 1: MVP (Completado)
- [x] 923 preguntas
- [x] 14 exámenes sin repetición
- [x] Modo Examen con timer
- [x] Modo Flash Study
- [x] Progress tracking
- [x] Mobile responsive

### 🚧 Phase 2: Mejoras (En progreso)
- [ ] Dark mode
- [ ] Gráficos mejorados
- [ ] Export progreso a PDF
- [ ] Keyboard shortcuts
- [ ] PWA con offline support

### 🔮 Phase 3: Pro Features (Futuro)
- [ ] Backend (Supabase)
- [ ] Multi-dispositivo sync
- [ ] Leaderboard
- [ ] Compartir resultados
- [ ] Más certificaciones (DVA, SAP)

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Mantén el código limpio y documentado
- Sigue las convenciones de estilo existentes
- Agrega tests si es posible
- Actualiza la documentación

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Ian Laurel Pastene**
- Website: [ianlaurelpastene.com](https://ianlaurelpastene.com)
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Ian Laurel Pastene](https://linkedin.com/in/tu-perfil)

## 🙏 Agradecimientos

- AWS por la certificación SAA-C03
- Comunidad de desarrolladores que comparten conocimiento
- Todos los que contribuyen a proyectos open source

## 📞 Soporte

¿Preguntas o problemas? 

- 📧 Email: ian@ianlaurelpastene.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/SimuladorExamenAWS-SolutionsArchitect/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/tu-usuario/SimuladorExamenAWS-SolutionsArchitect/discussions)

---

<div align="center">

**⭐ Si este proyecto te ayudó a pasar tu certificación, considera darle una estrella! ⭐**

Made with ❤️ and ☕ by [Ian Laurel Pastene](https://ianlaurelpastene.com)

</div>
