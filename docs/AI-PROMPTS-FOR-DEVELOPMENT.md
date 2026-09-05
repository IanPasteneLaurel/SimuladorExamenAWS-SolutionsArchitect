# 🤖 AI Development Prompts — Uso Directo con Kiro/Claude

**Copia y pega estos prompts tal como están a tu AI favorita**

---

## 🎯 PROMPT 1: Setup Inicial Completo

```markdown
Necesito que crees un simulador educativo de exámenes AWS SAA-C03 usando React + Tailwind CSS.

## REQUISITOS TÉCNICOS

### Stack:
- React 18 + Vite
- React Router v6 (routing)
- Tailwind CSS (estilos)
- Recharts (gráficos)
- LocalStorage (persistencia)
- Sin backend

### Estructura del Proyecto:
```
saa-c03-simulator/
├── src/
│   ├── hooks/
│   │   ├── useQuestions.js
│   │   ├── useProgress.js
│   │   ├── useTimer.js
│   │   └── useScoring.js
│   ├── components/
│   │   ├── QuestionView.jsx
│   │   ├── ExplanationView.jsx
│   │   ├── Timer.jsx
│   │   ├── ProgressBar.jsx
│   │   └── ScoreCard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── ExamMode.jsx
│   │   ├── FlashMode.jsx
│   │   └── Progress.jsx
│   ├── styles/tailwind.css
│   ├── utils/scoring.js
│   └── App.jsx
└── [resto de config]
```

### Archivo de Datos:
El usuario proporciona `SAA-C03-QuestionBank-923.json` con estructura:
```json
{
  "36": {
    "question_id": 36,
    "domain": "Cost-Optimized Architectures",
    "difficulty": 2,
    "question_en": "...",
    "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
    "correct_answer": "C",
    "explanation": {
      "full_text": "...",
      "why_correct": "...",
      "why_wrong": {"A": "...", "B": "...", "D": "..."},
      "aws_services": [...],
      "architectural_concept": "...",
      "exam_tips": "...",
      "memorize": [...]
    }
  }
}
```

También proporciona:
- `exams-full.json`: 14 exámenes (66 + 65 preguntas)
- `exams-metadata.json`: índice de exámenes

## FUNCIONALIDADES REQUERIDAS

1. **Dashboard/Home**
   - Logo + título "SAA-C03 Simulator"
   - Tarjetas de estadísticas (exámenes, score promedio, correctas)
   - Botones principales:
     - "🏋️ Examen Completo" → selector 1-14
     - "⚡ Flash 10" → 10 random preguntas
     - "⚡ Flash 20" → 20 random preguntas
     - "⚡ Flash 30" → 30 random preguntas
     - "📊 Mi Progreso" → analytics
   - Footer con versión

2. **Modo Examen Completo**
   - 66 preguntas por examen
   - Timer: 132 minutos (pausable)
   - Progreso bar (visual de 1-66)
   - Mostrar pregunta + 4 opciones
   - Al seleccionar → muestra explicación
   - Explicación incluye:
     - ✅/❌ si correcta/incorrecta
     - Servicios AWS (badges)
     - Concepto arquitectónico
     - ¿Por qué correcta?
     - ¿Por qué NO las otras?
     - Tips de examen
     - Puntos para memorizar
   - Botón "Siguiente Pregunta"
   - Al terminar → score + análisis
   - Guardar en LocalStorage

3. **Flash Study Mode**
   - Selecciona random N preguntas (10/20/30)
   - Muestra pregunta + opciones
   - SIN cronómetro
   - Explicación completa
   - Botones: Anterior/Siguiente
   - Al terminar → score + opciones (más flash/home/progreso)

4. **Dashboard de Progreso**
   - Estadísticas: exámenes, score promedio, correctas total
   - Gráfico 1: Evolución de score (línea con últimos 10)
   - Gráfico 2: Correctas por dominio (barras)
   - Gráfico 3: % por dominio (pastel)
   - Tabla: historial últimos 20 intentos
   - Predicción: score real estimado ± margen
   - Reset todo (con confirmación)

5. **LocalStorage Persistence**
   - Auto-guardar después cada examen
   - Auto-guardar después cada flash
   - Restaurar al recargar página

## ESPECIFICACIONES DE DISEÑO

### Colores
- Primary (AWS Blue): #0066CC
- Success (Green): #28A745
- Error (Red): #DC3545
- Background: #F5F7FA
- Surface: #FFFFFF

### Responsive
- Mobile (<768px): stack vertical
- Tablet (768-1024px): 2 columns
- Desktop (>1024px): full layout
- Touch targets ≥44px móvil
- Texto ≥16px móvil

### Componentes UI
- Buttons: primary/secondary/danger estados
- Cards: white bg, subtle shadow, rounded
- Progress bar: animated, blue gradient
- Timer: fixed top-right, monospace 32px

## INTERACCIONES REQUERIDAS

- Click opción → selecciona (highlight azul)
- Timer puede pausarse (click para toggle)
- Explicación aparece DESPUÉS de responder (no puedes cambiar)
- Progreso se guarda automáticamente en LocalStorage
- Gráficos deben ser reactivos (Recharts)
- Smooth transitions en cambio de preguntas

## DATOS IMPORTANTES

- Total preguntas: 923
- Total exámenes: 14 (sin repetición)
- Tamaño: 13 de 66 preguntas + 1 de 65
- Dominios: 5 (Secure, High-Perf, Resilient, Cost-Opt, Excellent)

## CRITERIOS DE ÉXITO

- ✅ Todas las 923 preguntas cargan
- ✅ 14 exámenes funcionan sin repetición
- ✅ Timer funciona (132 min, pausable)
- ✅ Score calcula correctamente (0-1000)
- ✅ LocalStorage guarda progreso
- ✅ Mobile responsive
- ✅ No hay errores console
- ✅ Transiciones smooth

## NOTA IMPORTANTE

El usuario va a proporcionar los 3 archivos JSON. Tu responsabilidad es:
1. Crear la estructura del proyecto
2. Implementar todos los hooks
3. Implementar todos los componentes
4. Crear todas las páginas
5. Configurar routing
6. Configurar Tailwind
7. Asegurar que TODO funcione

Por favor crea el código COMPLETO y FUNCIONAL (no pseudocódigo).
Si algo es muy largo, dividelo en múltiples archivos pero asegúrate de que sea copy-paste ready.
```

---

## 🎯 PROMPT 2: Hooks Individuales

```markdown
Necesito que implementes el hook `useScoring` que calcule el score de un examen.

### Entrada:
- `answers`: objeto { question_id: 'A'|'B'|'C'|'D' }
- `questions`: array de objetos con { question_id, correct_answer }

### Salida:
```javascript
{
  correct: number,      // cantidad de respuestas correctas
  total: number,        // total de preguntas
  percentage: number,   // porcentaje (0-100)
  score: number,        // score AWS (0-1000)
  byDomain: {
    'Secure Architectures': { correct: 20, total: 30, percentage: 66.7 },
    'High-Performing Architectures': { correct: 15, total: 16, percentage: 93.7 },
    // ... resto de dominios
  }
}
```

### Fórmula de Score:
```
score = (correct / total) * 1000
porcentaje = (correct / total) * 100
```

### Validaciones:
- Si no hay respuestas → retorna 0
- Si preguntas vacío → error
- Si answer no está en opciones → ignorar (no contar)

### Bonus (si es posible):
- Detectar si es "pasar" (>500) o "fallar" (<500)
- Calcular dominio más débil
- Estimar diferencia vs score real

Por favor crea el código completo con:
- Export default function
- Validaciones
- Comentarios claros
- Test cases simples al final
```

---

## 🎯 PROMPT 3: Timer Funcional

```markdown
Necesito un hook `useTimer` que maneje un cronómetro regresivo con pausa.

### Requisitos:

**Entrada:**
- `initialSeconds`: número de segundos iniciales (default: 7920 para 132 min)

**Salida (objeto retornado):**
```javascript
{
  timeLeft: number,           // segundos restantes
  minutes: number,            // minutos (calculados)
  seconds: number,            // segundos (resto)
  isRunning: boolean,         // ¿está corriendo?
  isTimeUp: boolean,          // ¿se acabó el tiempo?
  togglePause: function,      // pause/resume
  reset: function             // reiniciar timer
}
```

**Comportamiento:**
- Comienza contando DOWN cada segundo
- `togglePause()` pausa/reanuda
- Cuando llega a 0, se detiene automáticamente
- `reset()` vuelve a `initialSeconds`
- Usa `setInterval` correctamente (cleanup)

**Ejemplo de uso:**
```javascript
const timer = useTimer(7920)
console.log(timer.minutes + ':' + timer.seconds) // 132:00
timer.togglePause() // pausa
timer.togglePause() // reanuda
```

**Importante:**
- No crear múltiples intervals (cleanup en useEffect)
- Performance optimizado (no re-render innecesarios)
- Debe funcionar con componentes React normales

Código completo, por favor.
```

---

## 🎯 PROMPT 4: QuestionView Component

```markdown
Necesito el componente `QuestionView.jsx` que muestre una pregunta con 4 opciones.

### Props:
```javascript
{
  question: {
    question_id: number,
    domain: string,
    question_en: string,
    options: { A: string, B: string, C: string, D: string }
  },
  onAnswer: function(letter),  // callback cuando selecciona opción
  selectedAnswer: string | null // qué opción está seleccionada
}
```

### Renderizado:
```
┌─────────────────────────────────────┐
│ [Domain Badge]                      │
├─────────────────────────────────────┤
│ ¿Pregunta completa?                 │
│                                     │
│ Some context and description...     │
├─────────────────────────────────────┤
│ ☐ A) First option description       │
│ ☐ B) Second option description      │
│ ☐ C) Third option description       │
│ ☐ D) Fourth option description      │
└─────────────────────────────────────┘
```

### Interactividad:
- Click en opción A/B/C/D → `onAnswer('A')` etc
- Opción seleccionada: blue border + blue background
- Opción no seleccionada: gray border, hover blue
- Domain badge: background color diferente
- Disable mientras se espera respuesta (futuro)

### Tailwind Classes (usa estos):
- Card: bg-white shadow-lg rounded-lg
- Domain badge: bg-blue-100 text-blue-800
- Button option: border-2 rounded-lg p-4 transition
- Selected: border-blue-500 bg-blue-50
- Not selected: border-gray-200 hover:border-blue-300

### Especificaciones:
- Pregunta debe ser readable (font-bold, text-xl)
- Opciones deben ser clickeables (min 44px altura en móvil)
- Spacing: padding 24px en desktop, 16px en móvil
- Responsive: fullwidth en móvil

Código completo con Tailwind, por favor.
```

---

## 🎯 PROMPT 5: ExplanationView Component

```markdown
Necesito el componente `ExplanationView.jsx` que muestre explicación completa de una pregunta.

### Props:
```javascript
{
  question: {
    question_id: number,
    correct_answer: string,
    explanation: {
      full_text: string,
      why_correct: string,
      why_wrong: { A: string, B: string, C: string, D: string },
      aws_services: string[],
      architectural_concept: string,
      exam_tips: string,
      memorize: string[],
      difficulty_rating: number (1-5)
    }
  },
  userAnswer: string  // lo que el usuario respondió (A/B/C/D)
}
```

### Renderizado (Sections):
```
1. ✅ CORRECTA/INCORRECTA (con color verde/rojo)
   "Respuesta correcta: C"

2. 🏗️ SERVICIOS AWS (badges)
   Lambda | EventBridge | RDS | S3

3. 🧠 CONCEPTO ARQUITECTÓNICO
   "Cost Optimization - Serverless Pattern"

4. ✅ ¿POR QUÉ ES CORRECTA?
   "Lambda is cost-effective because..."

5. ❌ ¿POR QUÉ NO LAS OTRAS?
   A) "EC2 requires ongoing provisioning..."
   B) "RDS has continuous costs..."
   D) "This pattern doesn't apply..."

6. 💡 TIPS DE EXAMEN
   "AWS uses COST-EFFECTIVE when referring to..."

7. 🎯 MEMORIZA
   ✓ Lambda = event-driven = cost-optimized
   ✓ EventBridge = orchestration
   ✓ Scheduled pattern uses Lambda + EventBridge

8. ⭐ DIFICULTAD
   ⭐⭐ (2/5)
```

### Estilos:
- Background: gradient from-blue-50 to-indigo-50
- Sections: separadas, padding, border-left accent
- Colores:
  - Correcto: green (bg-green-100, text-green-800)
  - Incorrecto: red (bg-red-100, text-red-800)
  - Servicios: blue badges
  - Text: dark gray

### Interactividad:
- Expandir/contraer secciones (futuro)
- Hover en servicios (tooltip, futuro)

### Importante:
- Mostrar TODA la información
- Legible y bien espaciado
- Responsive
- Scroll smooth en móvil

Código completo, por favor.
```

---

## 🎯 PROMPT 6: Home Page

```markdown
Necesito la página `Home.jsx` que sea el dashboard principal del simulador.

### Estructura:
```
┌─────────────────────────────────────┐
│ SAA-C03 Simulator (título grande)   │
│ AWS Solutions Architect Associate   │
├─────────────────────────────────────┤
│ [Si hay progreso, mostrar stats]    │
│ ┌─────────────┬─────────────┐       │
│ │  14 Examen  │  842 Score  │       │
│ │  Completad  │  Promedio   │       │
│ └─────────────┴─────────────┘       │
├─────────────────────────────────────┤
│ [BOTÓN PRINCIPAL]                   │
│ 🏋️ Examen Completo (66 preguntas)  │
│ [Select exam 1-14 dropdown]         │
│                                     │
│ [FLASH STUDY BUTTONS]               │
│ ⚡ Flash 10  | ⚡ Flash 20 |⚡ Flash 30│
│                                     │
│ [SECONDARY BUTTON]                  │
│ 📊 Mi Progreso                      │
│                                     │
│ [SECONDARY BUTTON]                  │
│ ⚙️ Configuración (futuro)           │
├─────────────────────────────────────┤
│ Footer: v1.0 | © 2026 | GitHub/etc  │
└─────────────────────────────────────┘
```

### Hooks Necesarios:
- `useQuestions()`: acceder al banco
- `useProgress()`: obtener stats
- `useNavigate()`: router

### Funcionalidad:
- Si NO hay progreso:
  - Ocultar stats
  - Botón "Empezar" destacado
- Si HAY progreso:
  - Mostrar stats
  - Mostrar exámenes completados
  - Mostrar score promedio
- Selector de examen:
  - Dropdown 1-14
  - Por defecto: 1
  - Al seleccionar → navigate a `/exam/:examId`
- Flash buttons:
  - Click 10 → navigate a `/flash/10`
  - Click 20 → navigate a `/flash/20`
  - Click 30 → navigate a `/flash/30`
- Progreso button:
  - Click → navigate a `/progress`

### Diseño:
- Hero gradient: blue → purple
- Botones principales: white on blue
- Botones secundarios: semi-transparent white
- Stats cards: white semi-transparent background
- Responsive: mobile-first

### Colores (Tailwind):
- Background: bg-gradient-to-br from-blue-500 to-purple-600
- Botones: 
  - Primary: bg-white text-blue-600
  - Secondary: bg-indigo-400 text-white
- Cards: bg-white/10 backdrop-blur

Código completo, por favor.
```

---

## 🎯 PROMPT 7: ExamMode Page

```markdown
Necesito la página `ExamMode.jsx` que sea el modo examen completo.

### Route Params:
- `examId`: número 1-14

### Estructura General:
```
[Timer flotante arriba-derecha]

[Progress bar]
Pregunta 15 de 66 | 23%

[QuestionView component]

[Después de responder → ExplanationView component]

[Botón Siguiente/Terminar]
```

### Lógica Principal:

1. **Al cargar:**
   - `useParams()` obtiene examId
   - `useQuestions().getExam(examId)` obtiene 66 preguntas
   - Iniciar timer (132 min)
   - Mostrar pregunta 1

2. **Al seleccionar opción:**
   - `onAnswer(letter)` guarda respuesta
   - Muestra explicación automáticamente
   - No se puede cambiar respuesta

3. **Al click "Siguiente":**
   - Si NO es última pregunta:
     - Siguiente pregunta
     - Ocultar explicación
     - Timer sigue contando
   - Si ES última pregunta:
     - Calcular score (hook useScoring)
     - Guardar en progress (useProgress.completeExam)
     - Navigate a `/progress`

4. **Si timer llega a 0:**
   - Automáticamente terminar examen
   - Mostrar score
   - Guardar progreso

### Hooks Necesarios:
- `useQuestions()`: getExam(examId)
- `useProgress()`: completeExam()
- `useTimer()`: timer logic
- `useScoring()`: calcular score

### Componentes Necesarios:
- `Timer`: muestra timer flotante
- `QuestionView`: muestra pregunta
- `ExplanationView`: muestra explicación
- `ProgressBar`: muestra progreso

### State Local:
```javascript
const [currentIdx, setCurrentIdx] = useState(0)
const [answers, setAnswers] = useState({}) // { question_id: 'A' }
const [showExplanation, setShowExplanation] = useState(false)
```

### Especificaciones:
- Progress bar debe animarse (width cambiar suavemente)
- Timer debe ser pausable
- Explicación aparece DESPUÉS de responder
- Botón "Siguiente" enabled solo si respondió
- Al terminar → score page (futuro: separar componente)

Código completo, por favor.
```

---

## 🎯 PROMPT 8: Progress Dashboard Page

```markdown
Necesito la página `Progress.jsx` que muestre análisis completo.

### Hooks Necesarios:
- `useProgress()`: obtener todos los datos
- `useNavigate()`: para botones

### Secciones:

**1. Stats Cards (3 en fila)**
- Exámenes completados
- Score promedio
- Total de correctas
- Números grandes, coloreados

**2. Gráfico 1: Evolución de Score (LineChart Recharts)**
- X: últimos 10 exámenes
- Y: score (0-1000)
- Línea azul con puntos
- Tooltip al hover
- Animado

**3. Gráfico 2: Correctas por Dominio (BarChart)**
- X: Secure, HighPerf, Resilient, CostOpt, Excellent
- Y: cantidad de correctas
- Barras azules
- Tooltip muestra { correct: 20, total: 30 }

**4. Gráfico 3: Distribución por Dominio (PieChart)**
- 5 colores diferentes
- Leyenda
- % labels
- Click en slice (futuro: filtrar)

**5. Tabla: Historial**
```
Examen  | Fecha    | Score | Correctas | Dominio Fuerte
--------|----------|-------|-----------|----------------
#14     | 30 ago   | 920   | 61/66     | Secure ▓▓▓
#13     | 29 ago   | 850   | 56/66     | HighPerf ▓▓░
#12     | 28 ago   | 800   | 53/66     | Resilient ▓░░
```
- Últimos 20 intentos
- Scrolleable
- Click en fila → detalle (futuro)

**6. Predicción**
```
┌─────────────────────────────────────┐
│ 📊 PREDICCIÓN DE SCORE REAL         │
├─────────────────────────────────────┤
│ Score predicho: 820 ± 40             │
│ Basado en: 12 exámenes (564/792)    │
│ Confianza: 85%                      │
├─────────────────────────────────────┤
│ Recomendaciones:                    │
│ • Dominio débil: Cost-Optimized 70% │
│ • Próximo: Flash 30 sobre Cost      │
│ • Luego: Full exam sobre Resilient  │
└─────────────────────────────────────┘
```

**7. Botones de Acción**
- [← Volver]
- [Flash sobre dominio débil]
- [Reiniciar todo] (con confirmación)
- [Exportar] (futuro: JSON)

### Fórmula de Predicción:
```javascript
prediction = {
  score: Math.round(avgScore),
  margin: calculateMargin(examsCount),
  confidence: Math.min((examsCount / 15) * 100, 100)
}
// margin decreases as examsCount increases
```

### Responsive:
- Mobile: stack vertical
- Desktop: 2-3 columnas

### Colores (Recharts):
- Chart 1 (Line): #0066CC
- Chart 2 (Bar): #0066CC
- Chart 3 (Pie): #0066CC, #9933FF, #28A745, #FFC107, #DC3545

Código completo con Recharts, por favor.
```

---

## 📋 PROMPT 9: Setup Inicial del Proyecto

```markdown
Necesito el setup inicial completo del proyecto.

### Crear esta estructura:

**1. package.json**
```json
{
  "name": "saa-c03-simulator",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "recharts": "^2.8.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.5",
    "tailwindcss": "^3.3.3",
    "postcss": "^8.4.27",
    "autoprefixer": "^10.4.15"
  }
}
```

**2. vite.config.js**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
```

**3. tailwind.config.js**
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
```

**4. postcss.config.js**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

**5. .env.example**
```
# Sin variables de env para MVP
# Añadir cuando haya backend
```

**6. .gitignore**
```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
.vercel
```

**7. README.md**
```markdown
# SAA-C03 Simulator

AWS Certified Solutions Architect – Associate exam simulator.

## Features
- 923 preguntas
- 14 exámenes sin repetición
- Flash study (10/20/30)
- Progreso tracking
- Mobile responsive

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`

## Deploy
\`\`\`bash
vercel
\`\`\`
```

**8. vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

**9. index.html**
```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SAA-C03 Simulator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**10. src/main.jsx**
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**11. src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**12. Carpetas a crear:**
```
src/
├── components/
├── hooks/
├── pages/
├── utils/
├── data/
├── styles/
```

Por favor, dame el código listo para hacer `npm install` y `npm run dev`.
```

---

## 📋 PROMPT 10: Completar Todo

```markdown
Necesito que implementes el simulador SAA-C03 COMPLETO siguiendo el PRD en:
[Link a PRD-SAA-C03-SIMULATOR.md]

## ARCHIVOS A GENERAR (TODOS)

Hooks (3):
- [ ] useQuestions.js
- [ ] useProgress.js
- [ ] useTimer.js
- [ ] useScoring.js

Componentes (5):
- [ ] QuestionView.jsx
- [ ] ExplanationView.jsx
- [ ] Timer.jsx
- [ ] ProgressBar.jsx
- [ ] ScoreCard.jsx

Páginas (4):
- [ ] Home.jsx
- [ ] ExamMode.jsx
- [ ] FlashMode.jsx
- [ ] Progress.jsx

Config (8):
- [ ] App.jsx
- [ ] App.css
- [ ] main.jsx
- [ ] index.html
- [ ] vite.config.js
- [ ] tailwind.config.js
- [ ] postcss.config.js
- [ ] package.json

Archivos de datos (3, el usuario los proporciona):
- [ ] src/data/SAA-C03-QuestionBank-923.json
- [ ] src/data/exams-full.json
- [ ] src/data/exams-metadata.json

Utilidades:
- [ ] src/utils/storage.js (localStorage helpers)
- [ ] src/utils/scoring.js (score calculation)

Extras:
- [ ] .gitignore
- [ ] .env.example
- [ ] README.md
- [ ] vercel.json

## REQUISITOS CRÍTICOS

1. ✅ Código COMPLETO (no pseudocódigo)
2. ✅ Copy-paste ready (funcionable)
3. ✅ Todos los imports correctos
4. ✅ Sin errores de sintaxis
5. ✅ Sin dependencias faltantes
6. ✅ Responsive (mobile first)
7. ✅ LocalStorage funcional
8. ✅ Transiciones smooth
9. ✅ Comentarios claros en código complejo

## CRITERIOS DE ACEPTACIÓN

- [ ] npm install → sin errores
- [ ] npm run dev → inicia en puerto 5173
- [ ] http://localhost:5173 → home carga
- [ ] Click "Examen 1" → carga 66 preguntas
- [ ] Timer funciona (cuenta regresiva)
- [ ] Seleccionar opción → muestra explicación
- [ ] Botón siguiente → pregunta siguiente
- [ ] Al terminar → calcula score
- [ ] Progreso se guarda en localStorage
- [ ] Click "Flash 10" → 10 random preguntas
- [ ] Click "Progreso" → muestra análisis
- [ ] Gráficos se renderizan (Recharts)
- [ ] Mobile responsive
- [ ] NO hay console errors

## INSTRUCCIONES GENERALES

- Usa Tailwind para TODO (no inline CSS)
- Componentes pequeños y reutilizables
- Hooks custom para lógica
- LocalStorage para persistencia
- Recharts para gráficos
- React Router para navegación
- Sin servidor, todo local

Por favor, entrega el CÓDIGO COMPLETO y FUNCIONABLE. 
Si es muy largo, divide en múltiples prompts pero asegúrate de que al final se pueda hacer npm run dev y que funcione.
```

---

## 💡 CÓMO USAR ESTOS PROMPTS

### Opción 1: Una por Una (Recomendado)
1. Usa Prompt 9 (Setup)
2. Luego cada hook con Prompt 2-5
3. Luego cada página con Prompt 6-8
4. Final: Prompt 10 para validar todo

### Opción 2: Todo de Golpe
- Usa Prompt 1 (completo)
- Luego Prompt 10 si falta algo

### Opción 3: Personalizadas
Combina prompts según necesites.

---

## 📝 NOTAS IMPORTANTES

- Reemplaza `[...]` con valores reales
- Estos prompts están optimizados para Claude/Kiro
- Son específicos y detallados (aumenta calidad de output)
- No necesitan "por favor" extra (ya están bien formados)
- Si algo falla, copia el prompt del componente que falló

---

**¡Listos para desarrollar!** 🚀

