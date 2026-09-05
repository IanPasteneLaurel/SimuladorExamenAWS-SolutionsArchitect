# 📋 SAA-C03 Simulator — Product Requirements Document (PRD)

**Versión:** 1.0  
**Fecha:** 30 de agosto, 2026  
**Autor:** Ian Laurel Pastene  
**Estado:** Ready for Development  

---

## 🎯 EXECUTIVE SUMMARY

Crear un **simulador interactivo y educativo** para preparación del examen AWS Certified Solutions Architect – Associate (SAA-C03). Herramienta offline-first, responsive, con 923 preguntas reales, explicaciones de nivel instructor, y tracking inteligente de progreso.

### Objetivos Principales
- ✅ Pasar certificación SAA-C03 (usuario final)
- ✅ Lead magnet para consultoría (negocio)
- ✅ Herramienta reutilizable para otros certifications (futuro)

### KPIs de Éxito
- Simulador funcional en producción
- 100% de preguntas disponibles sin repetición
- Score predictor dentro de ±50 puntos del real
- Progreso guardado localmente
- Deployment en Vercel con auto-CI/CD

---

## 📊 DATOS DEL PROYECTO

### Banco de Preguntas
- **Total:** 923 preguntas
- **Distribución por dominio:**
  - Design Secure Architectures: 347 (37.6%)
  - Design High-Performing Architectures: 244 (26.4%)
  - Design Resilient Architectures: 131 (14.2%)
  - Design Cost-Optimized Architectures: 140 (15.2%)
  - Design Operationally Excellent Architectures: 61 (6.6%)

### Estructura de Exámenes
- **14 exámenes totales** (sin repetición de preguntas)
  - 13 exámenes de 66 preguntas = 858
  - 1 examen de 65 preguntas = 65
  - **Total distribuido:** 923/923 ✅

### Campos por Pregunta
```json
{
  "question_id": 36,
  "domain": "Cost-Optimized Architectures",
  "difficulty": 2,
  "question_en": "Full question text...",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "C",
  "explanation": {
    "full_text": "Complete explanation from PDF",
    "why_correct": "Why option C is correct",
    "why_wrong": {
      "A": "Why A is wrong",
      "B": "Why B is wrong",
      "D": "Why D is wrong"
    },
    "aws_services": ["Lambda", "EventBridge", "RDS"],
    "architectural_concept": "Cost Optimization",
    "keywords": ["MOST", "COST-EFFECTIVE"],
    "pattern": "Serverless Scheduled Tasks",
    "related_topics": ["Serverless", "Event-driven"],
    "exam_tips": "AWS uses this pattern when...",
    "memorize": ["Key point 1", "Key point 2", "Key point 3"],
    "difficulty_rating": 2,
    "related_services": [...]
  }
}
```

---

## 🎨 EXPERIENCIA DE USUARIO (UX)

### User Personas

#### Persona 1: "Carlos, el Aprendiz"
- **Edad:** 26-35 años
- **Experiencia:** Junior AWS, sin cert
- **Objetivo:** Pasar SAA-C03 en 3 meses
- **Uso:** 1-2 horas diarias
- **Dispositivo:** Laptop + teléfono
- **Punto de dolor:** No sabe qué estudiar primero

#### Persona 2: "María, la Profesional"
- **Edad:** 30-45 años
- **Experiencia:** Senior AWS, otras certs
- **Objetivo:** Certificarse rápido, practicar
- **Uso:** 30 min cada mañana
- **Dispositivo:** iPad + Mac
- **Punto de dolor:** Falta de feedback en tiempo real

#### Persona 3: "Alex, el Instructor"
- **Edad:** 35-50 años
- **Experiencia:** Teach AWS + consultant
- **Objetivo:** Compartir con estudiantes
- **Uso:** Compartir link, mostrar estadísticas
- **Dispositivo:** Cualquiera
- **Punto de dolor:** Sin control de métricas

### User Journeys

#### Journey 1: "Primer Examen"
```
1. Abre simulador
   ↓ Ve dashboard vacío
2. Click "Examen Completo"
   ↓ Selecciona Examen 1
3. Empieza a responder preguntas
   ↓ Cronómetro comienza (132 min)
4. Selecciona opción
   ↓ Ve explicación
5. Siguiente pregunta (repite 66x)
   ↓ 
6. Última pregunta
   ↓ Click "Terminar"
7. Ve score + análisis
   ↓
8. Guarda en progreso (automático)
9. Vuelve a home
```

#### Journey 2: "Flash Study"
```
1. Home
2. Click "Flash 20"
3. Random 20 preguntas
4. Sin cronómetro
5. Explica cada una
6. Completa
7. Ve score sesión
8. Opción: más flash o home
```

#### Journey 3: "Análisis de Progreso"
```
1. Click "Mi Progreso"
2. Ve gráficos de evolución
3. Score promedio
4. Exámenes completados
5. Dominios fuertes/débiles
6. Predicción de score real
```

---

## 🏗️ ARQUITECTURA DEL SIMULADOR

### Módulos Principales

#### 1️⃣ **Dashboard / Home**
**Propósito:** Punto de entrada único

**Secciones:**
- Header: "SAA-C03 Simulator"
- Stats card (si hay progreso)
  - Exámenes completados
  - Score promedio
  - % de completitud
  - Próximo objetivo
- Call-to-Action buttons:
  - "🏋️ Examen Completo" → Selector de examen (1-14)
  - "⚡ Flash 10/20/30" → 3 botones
  - "📊 Mi Progreso" → Analytics
  - "⚙️ Configuración" (futuro)
- Footer: Links, versión, timestamp

**Interacciones:**
- Hover effects en botones
- Estadísticas en tiempo real
- Reset progress (confirmación)

**Data:**
- localStorage: `saa-c03-progress`
- Campos: examsCompleted[], totalCorrect, totalAnswered

---

#### 2️⃣ **Modo Examen (Full Practice)**

**Propósito:** Simular ambiente real del examen AWS

**Duración:** 132 minutos (66 preguntas × 2 min promedio)

**Estructura:**
```
┌─────────────────────────────────────────┐
│ Timer (pausable) │ Examen 1/14 │ 66/66  │
├─────────────────────────────────────────┤
│                                         │
│  Pregunta 15 de 66                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [Secure Architectures]                │
│                                         │
│  A company runs a multi-tier            │
│  application with...                    │
│  [PREGUNTA COMPLETA]                    │
│                                         │
├─────────────────────────────────────────┤
│  [ ] A) Describe opción A               │
│                                         │
│  [ ] B) Describe opción B               │
│                                         │
│  [ ] C) Describe opción C               │
│                                         │
│  [ ] D) Describe opción D               │
│                                         │
├─────────────────────────────────────────┤
│           [Siguiente Pregunta]          │
└─────────────────────────────────────────┘

DESPUÉS DE RESPONDER:
┌─────────────────────────────────────────┐
│ ✅ CORRECTO! │ Score actual: 15/66      │
├─────────────────────────────────────────┤
│                                         │
│ EXPLICACIÓN                             │
│ ═════════════════════════════════════   │
│ ✅ Respuesta correcta: C                │
│                                         │
│ 🏗️ Servicios AWS:                      │
│ • Lambda                                │
│ • EventBridge                           │
│ • RDS                                   │
│                                         │
│ 🧠 Concepto:                            │
│ Cost Optimization - Serverless          │
│                                         │
│ ✅ ¿Por qué C es correcta?              │
│ Lambda is cost-effective for...         │
│                                         │
│ ❌ ¿Por qué NO las otras?               │
│ A: EC2 requires provisioning...         │
│ B: RDS has ongoing costs...             │
│ D: Not suitable for...                  │
│                                         │
│ 💡 Tips de Examen:                      │
│ AWS uses COST-EFFECTIVE cuando...       │
│                                         │
│ 🎯 Memoriza:                            │
│ ✓ Lambda = event-driven = cost-opt      │
│ ✓ EventBridge = orchestration           │
│ ✓ Pattern: Scheduled tasks              │
│                                         │
│ ⭐⭐ Dificultad: Medio                   │
│                                         │
├─────────────────────────────────────────┤
│       [Siguiente Pregunta →]            │
└─────────────────────────────────────────┘
```

**Interacciones:**
- Click opción → seleccionar
- Opción seleccionada: highlight azul
- Después de seleccionar → muestra explicación
- Timer cuenta regresivamente
- Click timer → pausar/reanudar
- Progreso bar real-time
- Keyboard: Enter = siguiente, Arrow keys = navegar opciones (futuro)

**Logic:**
- 66 preguntas por examen
- Timer corre solo en "active" (no pausa automática)
- Explicación aparece DESPUÉS de responder
- No puedes cambiar respuesta (immutable)
- Al terminar → automático a scoring

**Data guardada:**
```json
{
  "exam_id": 1,
  "start_time": "2026-08-30T15:30:00Z",
  "end_time": "2026-08-30T17:42:00Z",
  "duration_minutes": 132,
  "answers": {
    "36": "C",
    "42": "A",
    // ... 64 más
  },
  "score": 850,
  "correct": 56,
  "total": 66,
  "percentage": 84.8,
  "by_domain": {
    "Secure": { "correct": 20, "total": 30 },
    "HighPerf": { "correct": 15, "total": 16 },
    // ...
  }
}
```

---

#### 3️⃣ **Flash Study Mode**

**Propósito:** Quick learning, revisión, warm-up

**Opciones:** 10, 20, 30 preguntas

**Características:**
- Selección random del banco completo
- SIN cronómetro
- Explicación completa después de cada pregunta
- Puedes repasar preguntas (scroll arriba)
- Speed de aprendizaje → depende del usuario
- No hay "time's up" (alivio de presión)

**Estructura:**
```
┌─────────────────────────────────────┐
│ ← Volver | Flash 20 | 3/20 | ⏱️ 4:23│
├─────────────────────────────────────┤
│ [Pregunta + opciones]               │
│ (igual a Modo Examen)               │
├─────────────────────────────────────┤
│ [Explicación completa]              │
│ (igual a Modo Examen)               │
├─────────────────────────────────────┤
│ [Siguiente Pregunta →]              │
└─────────────────────────────────────┘

AL TERMINAR:
┌─────────────────────────────────────┐
│ ✅ COMPLETADO FLASH 20              │
├─────────────────────────────────────┤
│ Score: 18/20 (90%)                  │
│ Tiempo: 12 minutos                  │
│                                     │
│ [← Más Flash] [Home] [Progreso →]  │
└─────────────────────────────────────┘
```

**Data guardada:**
```json
{
  "type": "flash",
  "session_id": "flash_2026-08-30_15:30:00",
  "count": 20,
  "questions": [36, 42, 128, ...],
  "answers": {
    "36": "C",
    "42": "A",
    // ...
  },
  "score": 18,
  "total": 20,
  "percentage": 90,
  "duration_minutes": 12,
  "timestamp": "2026-08-30T15:30:00Z"
}
```

---

#### 4️⃣ **Progress / Analytics Dashboard**

**Propósito:** Visualizar evolución y predicción

**Secciones:**

**A) Tarjetas Resumen**
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│   14     │ │   842    │ │   648    │
│Exámenes  │ │Score Prom│ │Correctas │
└──────────┘ └──────────┘ └──────────┘
```

**B) Gráficos**
- Line chart: Score evolution (últimos 10 exámenes)
- Bar chart: Preguntas correctas por dominio
- Pie chart: Distribución de dominios completados
- Gauge: Predicción de score real (0-1000 → rojo/verde)

**C) Historial de Exámenes**
```
Examen #1  | 23 ago | 780 (52/66) | Secure ▓▓░░
Examen #2  | 24 ago | 820 (54/66) | HighPerf ▓▓▓░
Examen #3  | 25 ago | 850 (56/66) | Resilient ▓▓▓░
[...]
```

**D) Por Dominio**
```
Secure Architectures (30%)
└─ Intentos: 5
└─ Promedio: 85%
└─ Temas débiles: VPC, Security Groups

High-Performing (24%)
└─ Intentos: 4
└─ Promedio: 82%
└─ Temas débiles: Auto Scaling, RDS
```

**E) Predicción**
```
Score Real Predicho: 820 ± 40
(Basado en 12 exámenes, 564/792 correctas)

Confianza: 85% (recomendación: 3 más exámenes)

Recomendaciones:
• Dominio débil: Cost-Optimized (70%)
• Próximo: Flash 30 sobre Cost
• Luego: Full exam sobre Resilient
```

**Interacciones:**
- Hover en gráficos → tooltip con datos
- Click examen → detalle (qué preguntas erró)
- Click dominio → sesión flash automática sobre ese
- Reset → confirmación (perder todo)
- Export → JSON o PDF (futuro)

---

#### 5️⃣ **Question Detail View** (Futuro)

**Propósito:** Revisar preguntas específicas

**Datos mostrados:**
- Pregunta completa
- Tu respuesta vs correcta
- Explicación
- % de usuarios que acertó
- Comentarios de comunidad (futuro)

---

### Flujos Principales

#### Flow 1: Examen Completo
```
Home 
  ↓ [Examen Completo]
Selector de Examen (1-14)
  ↓ [Examen 1]
Start Exam (timer comienza)
  ↓ [66 preguntas]
  Pregunta 1
    ↓ [Selecciona opción]
    ↓ Ver explicación
    ↓ [Siguiente]
  Pregunta 2-65 (repite)
  Pregunta 66
    ↓ [Siguiente/Terminar]
Scoring Page
  ↓ [Ver análisis]
Save Progress (automático)
  ↓ [Home / Progreso]
Home
```

#### Flow 2: Flash Quick
```
Home
  ↓ [Flash 20]
Random 20 from 923
  ↓ [Start]
Pregunta 1-20
  ↓ (sin timer)
Resultado
  ↓
Opciones (más / home / progreso)
```

#### Flow 3: Progress Check
```
Home
  ↓ [Mi Progreso]
Analytics Page
  ↓ Ver gráficos
  ↓ Ver historial
  ↓ Ver predicción
  ↓ Ver debilidades
  ↓ [Hacer flash sobre dominio débil]
```

---

## 🎨 DISEÑO VISUAL

### Paleta de Colores

```
Primary (Azul AWS):     #0066CC
Primary Dark:           #003D7A
Accent (Púrpura):       #9933FF
Success (Verde):        #28A745
Error (Rojo):           #DC3545
Warning (Naranja):      #FFC107
Background:             #F5F7FA
Surface:                #FFFFFF
Text Primary:           #1A1A1A
Text Secondary:         #666666
Border:                 #E0E0E0
```

### Tipografía

```
Headings:   Inter Bold, 24-48px
Body:       Inter Regular, 14-16px
Code:       Monaco/Courier, 12-14px
Weights:    400 (regular), 600 (semibold), 700 (bold)
```

### Components

**Button**
```
Primary:    Blue bg, white text, rounded
Secondary:  White bg, blue border, blue text
Danger:     Red bg, white text
Disabled:   Gray bg, gray text, no hover
Sizes:      sm (32px), md (40px), lg (48px)
States:     default, hover, active, disabled, loading
```

**Card**
```
White bg, subtle shadow, rounded corners
Padding: 24px
Hover: subtle shadow increase
```

**Input/Select**
```
Blue border on focus, rounded
Placeholder: light gray
Padding: 12px
Error state: red border + error message
```

**Progress Bar**
```
Background: light gray
Foreground: blue gradient
Height: 8px
Animated: yes, smooth easing
```

**Timer**
```
Fixed position: top-right
Big font: 32px monospace
Shows MM:SS
Click to pause/resume
Color changes:
  - Green: running
  - Yellow: paused
  - Red: time's up
```

### Responsive Design

```
Mobile (<768px):
  - Stack layout (vertical)
  - Fullscreen modals
  - Touch-friendly buttons (min 44px)
  - Large text (16px min)

Tablet (768px-1024px):
  - 2-column layout
  - Optimized spacing
  - Medium text (14-16px)

Desktop (>1024px):
  - Max-width 1200px
  - 3-column layout (futuro)
  - Normal text (14-15px)
  - Sidebar (futuro)
```

---

## ⚙️ ARQUITECTURA TÉCNICA

### Tech Stack

```
Frontend:
  - React 18 (library)
  - Vite (build tool)
  - React Router v6 (routing)
  - Tailwind CSS (styling)
  - Recharts (charts)
  - Lucide React (icons)

State:
  - useState/useContext (local state)
  - Custom hooks (logic)
  - LocalStorage (persistence)

Data:
  - JSON files (questions)
  - LocalStorage (progress)
  
Deploy:
  - Vercel (hosting)
  - GitHub (version control)
  - Auto CI/CD

No Backend Required (PWA)
```

### Project Structure

```
saa-c03-simulator/
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── data/
│   │   ├── SAA-C03-QuestionBank-923.json
│   │   ├── exams-metadata.json
│   │   └── exams-full.json
│   ├── hooks/
│   │   ├── useQuestions.js       (load questions)
│   │   ├── useProgress.js        (track progress)
│   │   ├── useTimer.js           (countdown timer)
│   │   └── useScoring.js         (calculate score)
│   ├── components/
│   │   ├── QuestionView.jsx      (question + options)
│   │   ├── ExplanationView.jsx   (detailed explanation)
│   │   ├── Timer.jsx             (timer display)
│   │   ├── ProgressBar.jsx       (progress indicator)
│   │   ├── ScoreCard.jsx         (score display)
│   │   ├── StatCard.jsx          (stat box)
│   │   └── Layout.jsx            (main layout)
│   ├── pages/
│   │   ├── Home.jsx              (dashboard)
│   │   ├── ExamMode.jsx          (full exam)
│   │   ├── FlashMode.jsx         (quick study)
│   │   ├── Progress.jsx          (analytics)
│   │   └── NotFound.jsx          (404)
│   ├── styles/
│   │   └── tailwind.css
│   ├── utils/
│   │   ├── storage.js            (localStorage helpers)
│   │   ├── scoring.js            (score calculation)
│   │   └── constants.js          (global constants)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── vercel.json
└── README.md
```

### Data Models

**Question Model**
```javascript
{
  question_id: number,
  domain: string,
  difficulty: number (1-5),
  question_en: string,
  options: {
    A: string,
    B: string,
    C: string,
    D: string
  },
  correct_answer: string ('A'|'B'|'C'|'D'),
  explanation: {
    full_text: string,
    why_correct: string,
    why_wrong: { A: string, B: string, D: string },
    aws_services: string[],
    architectural_concept: string,
    keywords: string[],
    pattern: string,
    related_topics: string[],
    exam_tips: string,
    memorize: string[],
    difficulty_rating: number,
    related_services: string[]
  }
}
```

**Progress Model**
```javascript
{
  examsCompleted: [
    {
      exam_id: number,
      start_time: ISO8601,
      end_time: ISO8601,
      duration_minutes: number,
      answers: { question_id: answer },
      score: number (0-1000),
      correct: number,
      total: number,
      percentage: number,
      by_domain: { domain: { correct, total } }
    }
  ],
  flashcardsCompleted: [
    {
      session_id: string,
      count: number,
      questions: number[],
      answers: { question_id: answer },
      score: number,
      total: number,
      percentage: number,
      duration_minutes: number,
      timestamp: ISO8601
    }
  ],
  totalCorrect: number,
  totalAnswered: number,
  createdAt: ISO8601,
  lastUpdated: ISO8601
}
```

---

## 🔧 ESPECIFICACIONES DE FEATURES

### Feature 1: Examen Completo

**Requirement:** Usuario puede tomar examen de 66 preguntas con cronómetro

**Acceptance Criteria:**
- [ ] Timer comienza en 132 minutos (7920 segundos)
- [ ] Timer cuenta regresivamente cada segundo
- [ ] Timer muestra en formato MM:SS
- [ ] Click timer → pausar/reanudar
- [ ] Al seleccionar opción → explicación aparece
- [ ] Siguiente pregunta → carga instantáneamente
- [ ] Progreso bar refleja posición (1-66)
- [ ] Al terminar → automáticamente calcula score
- [ ] No se puede cambiar respuesta (immutable)
- [ ] Datos guardados en LocalStorage

**Score Calculation:**
```
- Correctas: 56/66
- % = (56/66) * 100 = 84.8%
- Score = % * 10 = 848 (redondeado)
- Escala: 0-1000 (AWS estándar)
```

### Feature 2: Flash Study

**Requirement:** Usuario puede estudiar 10, 20 o 30 preguntas sin cronómetro

**Acceptance Criteria:**
- [ ] 3 botones en home: 10, 20, 30
- [ ] Click selecciona random N preguntas
- [ ] Muestra pregunta + opciones
- [ ] NO hay cronómetro
- [ ] Click opción → explicación
- [ ] Botones: Siguiente, Anterior
- [ ] Al terminar → score y opciones (más/home/progreso)
- [ ] Duración → contabilizada pero sin presión

### Feature 3: Progress Tracking

**Requirement:** Usuario ve su evolución

**Acceptance Criteria:**
- [ ] Stats: Exámenes, Score promedio, Correctas total
- [ ] Gráfico: Score evolution (línea)
- [ ] Gráfico: Correctas por dominio (barras)
- [ ] Gráfico: % por dominio (pastel)
- [ ] Historial: Tabla con últimos 20 intentos
- [ ] Predicción: Score real estimado ± margen
- [ ] Recomendaciones: Qué estudiar next
- [ ] Export: JSON de progreso (futuro)

### Feature 4: Explicaciones Detalladas

**Requirement:** Usuario entiende por qué cada respuesta

**Acceptance Criteria:**
- [ ] ✅ Respuesta correcta vs opción seleccionada
- [ ] 🏗️ Servicios AWS relacionados (badges)
- [ ] 🧠 Concepto arquitectónico
- [ ] ✅ Explicación de por qué es correcta
- [ ] ❌ Explicación de por qué cada otra NO es correcta
- [ ] 🎯 Puntos para memorizar (3-5)
- [ ] 💡 Tips de examen
- [ ] ⭐ Dificultad visual (stars)
- [ ] 📚 Temas relacionados (links, futuro)

### Feature 5: Persistencia (LocalStorage)

**Requirement:** Progreso se guarda automáticamente

**Acceptance Criteria:**
- [ ] Después de cada examen → guardar
- [ ] Después de cada flash → guardar
- [ ] Cambiar de página → progreso persiste
- [ ] Cerrar navegador → al volver, progreso está
- [ ] Reset → confirmación (no accidental)
- [ ] Exportar progreso → JSON (futuro)
- [ ] Sincronizar multi-dispositivo (futuro, backend)

### Feature 6: Mobile Responsive

**Requirement:** Funciona en móvil, tablet, desktop

**Acceptance Criteria:**
- [ ] Mobile (<768px): stack vertical, touch-friendly
- [ ] Tablet (768-1024px): 2 column, optimizado
- [ ] Desktop (>1024px): full experience
- [ ] Touch targets ≥44px en móvil
- [ ] Texto ≥16px en móvil
- [ ] Scroll smooth
- [ ] No horizontal scroll
- [ ] Landscape ↔ portrait: adaptable

---

## 📈 ROADMAP

### Phase 1: MVP (AHORA)
- [x] Banco de preguntas (923)
- [x] Exámenes (14)
- [x] Modo Examen
- [x] Flash Study
- [x] Progress básico
- [x] LocalStorage
- [x] Mobile responsive

### Phase 2: Improved (Mes 2)
- [ ] Dark mode
- [ ] Gráficos mejorados (Recharts)
- [ ] Análisis por dominio detallado
- [ ] Exportar progreso (PDF)
- [ ] Keyboard shortcuts
- [ ] Offline badge

### Phase 3: Pro (Mes 3)
- [ ] Backend (Supabase)
- [ ] Multi-dispositivo
- [ ] Leaderboard
- [ ] Compartir resultados
- [ ] Marketplace de exámenes (otros certs)

### Phase 4: Monetización (Futuro)
- [ ] Free tier (5 exámenes)
- [ ] Pro tier ($99/año)
- [ ] Team tier ($499/año)
- [ ] Certificaciones adicionales (DVA, SAP)

---

## 🧪 TESTING STRATEGY

### Manual Testing

**Examen:**
- [ ] Timer cuenta correctamente
- [ ] Todas las 66 preguntas cargan
- [ ] Click opción → explicación aparece
- [ ] Score calcula correctamente
- [ ] Progreso se guarda

**Flash:**
- [ ] Random 10/20/30 selecciona correcto
- [ ] Sin timer
- [ ] Explicaciones completas
- [ ] Score calcula OK

**Progress:**
- [ ] Estadísticas correctas
- [ ] Gráficos se renderizan
- [ ] Historial muestra intentos
- [ ] Reset funciona

**Mobile:**
- [ ] Responsive en iOS/Android
- [ ] Touch funciona
- [ ] Scroll smooth
- [ ] Orientación adapta

**LocalStorage:**
- [ ] Datos persisten
- [ ] Reset limpia todo
- [ ] Cross-tab sync (futuro)

### Automated Testing (Opcional)

```javascript
// useScoring.test.js
test('calculates score correctly', () => {
  const answers = { 1: 'A', 2: 'B', ... }
  const questions = [{ question_id: 1, correct: 'A' }, ...]
  const score = calculateScore(answers, questions)
  expect(score.correct).toBe(56)
  expect(score.percentage).toBe(84.8)
  expect(score.total).toBe(1000)
})
```

---

## 🚀 DEPLOYMENT

### Local Development
```bash
npm install
npm run dev
# http://localhost:5173
```

### Production Build
```bash
npm run build
# Genera /dist
```

### Vercel Deployment
```bash
vercel
# Auto setup
# CI/CD en cada push
```

### GitHub Integration
```
1. Push a main
2. Vercel detecta
3. Auto builds
4. Auto deploys
5. URL automática
```

---

## 📊 SUCCESS METRICS

| Métrica | Target | Actual |
|---------|--------|--------|
| **Preguntas disponibles** | 923 | 923 ✅ |
| **Exámenes sin repetición** | 14 | 14 ✅ |
| **Load time** | <2s | TBD |
| **Score accuracy** | ±50 pts | TBD |
| **Mobile score** | Lighthouse 80+ | TBD |
| **Uptime** | 99.9% | TBD |
| **Users passed cert** | 80% | TBD |

---

## 🎯 ACCEPTANCE CRITERIA (FINAL)

**El simulador está completo cuando:**

- [ ] Todas las 923 preguntas cargan correctamente
- [ ] 14 exámenes disponibles sin repetición
- [ ] Timer funciona (132 min, pausable)
- [ ] Explicaciones completas (14 campos)
- [ ] Flash Study (10/20/30 opciones)
- [ ] Progress tracking (stats, gráficos)
- [ ] LocalStorage funciona
- [ ] Mobile responsive (768px breakpoint)
- [ ] Deploy en Vercel funcionando
- [ ] CI/CD automático en push
- [ ] Documentación completa
- [ ] README actualizado
- [ ] Score predictor dentro de ±50 pts
- [ ] UX fluido (sin errores JS)

---

## 📝 NOTAS IMPORTANTES

### Assumptions
- Usuario tiene conexión al cargar JSON (carga una vez)
- LocalStorage disponible en navegador
- No requiere backend (MVP)
- PWA con offline support (futuro)

### Constraints
- Máximo 923 preguntas (no agregar más)
- Exámenes sin repetición (respeto total)
- LocalStorage límite ~5-10MB (OK para nosotros)
- Deploy gratuito (Vercel)

### Dependencies
- AWS Knowledge (preguntas están bien)
- React/JavaScript (desarrollo)
- Vercel account (deploy)
- GitHub account (version control)

---

## 📞 CONTACT & QUESTIONS

**Product Owner:** Ian Laurel Pastene  
**Email:** ian@ianlaurelpastene.com  
**Website:** ianlaurelpastene.com  
**GitHub:** https://github.com/tu-usuario/saa-c03-simulator

---

## 📚 APÉNDICES

### A) Estructura JSON Completa

[Ver SAA-C03-QuestionBank-923.json]

### B) Diagrama de Componentes

```
App
├── Home
│   ├── StatCard (3x)
│   └── ActionButtons (5x)
├── ExamMode
│   ├── Timer
│   ├── ProgressBar
│   ├── QuestionView
│   └── ExplanationView
├── FlashMode
│   ├── QuestionView
│   └── ExplanationView
└── Progress
    ├── StatCard (3x)
    ├── LineChart (Recharts)
    ├── BarChart (Recharts)
    ├── PieChart (Recharts)
    └── HistoryTable
```

### C) Estado Global (useContext)

```javascript
// QuestionContext
{
  questions: Question[],
  currentExamId: number,
  currentQuestionIndex: number,
  answers: { [question_id]: string },
  isTimerRunning: boolean,
  timeLeft: number
}

// ProgressContext
{
  examsCompleted: Exam[],
  flashCardsCompleted: FlashCard[],
  totalCorrect: number,
  totalAnswered: number
}
```

### D) Scoring Formula

```
Score = (Correctas / Total) * 1000

Rango: 0-1000
- 0-500: Falló
- 500-700: Pasó pero necesita repaso
- 700-850: Pasó, bien preparado
- 850-1000: Excelente, listo para real
```

### E) Predicción de Score Real

```
Si tomó 5 exámenes:
- Promedio actual: 800
- Desviación: ±40
- Predicción: 800 (confianza 60%)

Si tomó 12 exámenes:
- Promedio actual: 820
- Desviación: ±25
- Predicción: 820 (confianza 90%)

Fórmula:
pred_score = avg_score
confidence = min(exams_taken / 15, 1.0) * 100
```

---

**Versión:** 1.0  
**Última actualización:** 30 de agosto, 2026  
**Estado:** READY FOR DEVELOPMENT  

---

## ✅ SIGN OFF

**Aprobado por:** Ian Laurel Pastene  
**Fecha:** 30 de agosto, 2026  
**Próximo milestone:** Inicio de desarrollo

