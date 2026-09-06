# 👨‍💻 QA Testing Profile - SAA-C03 Simulator

**Perfil de Testing Completo con Criterios de Aceptación Estrictos**

---

## 📋 Información del Documento

- **Versión**: 1.0.0
- **Tipo**: Quality Assurance Testing Profile
- **Alcance**: Testing funcional, no funcional, regresión y aceptación
- **Estado**: Ready for Execution
- **Última actualización**: Enero 2025

---

## 🎯 Objetivo del QA

Validar que el **Simulador de Examen AWS SAA-C03** cumple con todos los requisitos funcionales y no funcionales especificados en el PRD, garantizando una experiencia de usuario libre de errores críticos y lista para producción.

---

## 📊 Criterios de Aceptación Global

El simulador se considera **ACEPTADO** solo si cumple:

✅ **100%** de casos críticos pasados (Prioridad P0)  
✅ **≥95%** de casos de alta prioridad pasados (P1)  
✅ **≥90%** de casos de prioridad media pasados (P2)  
✅ **0** bugs bloqueantes encontrados  
✅ **≤3** bugs críticos encontrados (con workaround)  
✅ **Performance score ≥90** en Lighthouse  
✅ **Accessibility score ≥90** en Lighthouse  

---

## 🔍 Scope de Testing

### ✅ In Scope
- Funcionalidad completa de Modo Examen
- Funcionalidad completa de Modo Flash
- Sistema de Progress Tracking
- Persistencia de datos (LocalStorage)
- Navegación y routing
- Responsive design (mobile, tablet, desktop)
- Performance y tiempos de carga
- Seguridad básica (XSS, headers)
- Compatibilidad cross-browser
- Accesibilidad (WCAG 2.1 AA)

### ❌ Out of Scope
- Backend/API testing (no aplica - offline-first)
- Testing de autenticación (no implementado)
- Testing de pagos (no implementado)
- Load testing / Stress testing (futuro)
- Penetration testing avanzado (futuro)

---

## 🧪 Test Cases - Modo Examen Completo

### TC-001: Selección de Examen (P0 - Crítico)

**Precondiciones**:
- Servidor local corriendo en http://localhost:5173
- Navegador con JavaScript habilitado
- LocalStorage habilitado

**Pasos**:
1. Navegar a http://localhost:5173/
2. Verificar que página home carga completamente
3. Click en botón "Examen Completo"
4. Verificar navegación a /exam
5. Verificar que se muestran 14 botones de exámenes

**Resultado Esperado**:
- ✅ Home carga en < 2 segundos
- ✅ Botón "Examen Completo" visible y clickeable
- ✅ Navegación a /exam exitosa (URL cambia)
- ✅ 14 botones numerados visibles en grid
- ✅ Cada botón muestra "Examen N" y "66 preguntas"
- ✅ Hover effect en botones funciona
- ✅ No hay errores en consola

**Criterios de Aceptación**:
- [ ] Tiempo de carga inicial ≤ 2 segundos
- [ ] Todos los 14 exámenes visibles simultáneamente
- [ ] Click en cualquier examen funciona
- [ ] UI responsive (se adapta a viewport)
- [ ] 0 errores en consola del navegador

**Prioridad**: P0 (Bloqueante)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-002: Inicio de Examen y Timer (P0 - Crítico)

**Precondiciones**:
- En página /exam con 14 exámenes visibles

**Pasos**:
1. Click en "Examen 1"
2. Verificar navegación a /exam/1
3. Verificar que timer aparece inmediatamente
4. Observar timer por 5 segundos
5. Verificar que cuenta regresivo (132:00 → 131:55)

**Resultado Esperado**:
- ✅ Navegación instantánea a /exam/1
- ✅ Primera pregunta carga en < 1 segundo
- ✅ Timer visible arriba a la derecha
- ✅ Timer inicia en 132:00 (132 minutos)
- ✅ Timer cuenta regresivo cada segundo
- ✅ Formato MM:SS correcto
- ✅ Progress bar muestra "Pregunta 1 de 66"

**Criterios de Aceptación**:
- [ ] Timer inicia automáticamente al cargar examen
- [ ] Precisión del timer ±1 segundo cada 60 segundos
- [ ] Timer visible en todo momento (no se oculta)
- [ ] No hay lag ni stuttering en countdown
- [ ] Progress bar sincronizado con pregunta actual

**Prioridad**: P0 (Bloqueante)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-003: Funcionalidad de Pausa del Timer (P1 - Alta)

**Precondiciones**:
- Examen 1 iniciado, timer corriendo

**Pasos**:
1. Observar timer actual (ej: 131:45)
2. Click en el timer
3. Esperar 5 segundos
4. Verificar que timer no cambió
5. Click en timer nuevamente
6. Verificar que timer resume

**Resultado Esperado**:
- ✅ Timer se pausa al hacer click
- ✅ Indicador visual de pausa (color cambia a amarillo/naranja)
- ✅ Timer no cuenta mientras está pausado
- ✅ Segundo click resume el timer
- ✅ Timer vuelve a color normal (verde)
- ✅ Cuenta regresiva continúa desde donde pausó

**Criterios de Aceptación**:
- [ ] Pausa responde al primer click (< 100ms)
- [ ] Timer congelado mantiene valor exacto
- [ ] Resume mantiene sincronización perfecta
- [ ] Cambios visuales claros (usuario sabe el estado)
- [ ] Funciona múltiples veces (pause/resume/pause)

**Prioridad**: P1 (Alta)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-004: Visualización de Pregunta (P0 - Crítico)

**Precondiciones**:
- Examen iniciado, en pregunta 1

**Pasos**:
1. Leer texto completo de la pregunta
2. Verificar que opciones A, B, C, D están visibles
3. Verificar badge del dominio (ej: "Secure Architectures")
4. Scroll si es necesario para ver todo
5. Verificar que no hay truncamiento

**Resultado Esperado**:
- ✅ Texto de pregunta completo y legible
- ✅ 4 opciones (A, B, C, D) claramente separadas
- ✅ Badge de dominio visible arriba
- ✅ Texto no cortado ni con "..."
- ✅ Font size ≥ 14px en desktop, ≥ 16px en mobile
- ✅ Contraste suficiente (ratio ≥ 4.5:1)
- ✅ Scroll smooth si contenido es largo

**Criterios de Aceptación**:
- [ ] Pregunta completa visible sin scroll (o con scroll smooth)
- [ ] Todas las opciones legibles sin overlap
- [ ] Radio buttons o checkboxes claramente clickeables
- [ ] Espaciado adecuado entre opciones (≥ 16px)
- [ ] No hay texto cortado o mal renderizado
- [ ] Funciona en viewport de 375px (mobile)

**Prioridad**: P0 (Bloqueante)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-005: Selección de Respuesta (P0 - Crítico)

**Preconditions**:
- En pregunta 1, ninguna opción seleccionada

**Pasos**:
1. Click en opción A
2. Verificar que A se marca/resalta
3. Esperar 500ms
4. Verificar que aparece explicación

**Resultado Esperado**:
- ✅ Opción A se resalta visualmente (border azul o background)
- ✅ Solo UNA opción puede estar seleccionada
- ✅ Explicación aparece automáticamente después de selección
- ✅ Indicador visual de correcto ✅ o incorrecto ❌
- ✅ Score actualizado visible (ej: "0/1" → "1/1" si correcta)

**Criterios de Aceptación**:
- [ ] Click en opción responde inmediatamente (< 100ms)
- [ ] Selección es clara y distinguible
- [ ] Solo se puede seleccionar UNA opción (single choice)
- [ ] Explicación carga en < 500ms
- [ ] No se puede cambiar respuesta después de seleccionar
- [ ] Sistema previene double-click bugs

**Prioridad**: P0 (Bloqueante)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-006: Explicación Detallada (P1 - Alta)

**Preconditions**:
- Respuesta seleccionada, explicación visible

**Pasos**:
1. Leer sección "¿Por qué esta respuesta?"
2. Verificar sección "Servicios AWS"
3. Verificar sección "Concepto Arquitectónico"
4. Verificar sección "Tips de Examen"
5. Verificar sección "Para Memorizar"
6. Scroll completo de la explicación

**Resultado Esperado**:
- ✅ Explicación de respuesta correcta presente
- ✅ Explicación de por qué cada otra opción es incorrecta
- ✅ Lista de servicios AWS con badges/pills
- ✅ Concepto arquitectónico mencionado
- ✅ Tips específicos del examen
- ✅ Puntos para memorizar (bullets)
- ✅ Formato claro con iconos y secciones

**Criterios de Aceptación**:
- [ ] Texto de explicación ≥ 50 caracteres (no vacío)
- [ ] Servicios AWS como badges clickeables (opcional)
- [ ] Estructura clara con headers y spacing
- [ ] Iconos apropiados (✅ ❌ 💡 🏗️)
- [ ] Legible sin zoom (font ≥ 14px)
- [ ] Scroll smooth dentro del contenedor

**Prioridad**: P1 (Alta)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-007: Navegación Entre Preguntas (P0 - Crítico)

**Preconditions**:
- Pregunta 1 respondida, explicación vista

**Pasos**:
1. Click en botón "Siguiente Pregunta"
2. Verificar que carga pregunta 2
3. Verificar que progress bar actualiza a "2/66"
4. Responder pregunta 2
5. Click "Siguiente"
6. Repetir hasta pregunta 5

**Resultado Esperado**:
- ✅ Navegación instantánea entre preguntas (< 200ms)
- ✅ Progress bar incrementa correctamente
- ✅ Nueva pregunta se muestra completa
- ✅ Estado anterior NO se puede modificar
- ✅ Score acumulativo visible
- ✅ Timer continúa corriendo

**Criterios de Aceptación**:
- [ ] Transición smooth entre preguntas
- [ ] NO hay botón "Anterior" (respuestas son finales)
- [ ] Progress bar siempre sincronizado
- [ ] No hay memory leaks (60fps mantenido)
- [ ] Timer nunca se resetea
- [ ] Cada pregunta es única (no repeticiones)

**Prioridad**: P0 (Bloqueante)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-008: Completar Examen Completo (P0 - Crítico)

**Preconditions**:
- En pregunta 66 (última del examen)

**Pasos**:
1. Responder pregunta 66
2. Verificar que botón dice "Ver Resultados" (no "Siguiente")
3. Click en "Ver Resultados"
4. Verificar navegación a página de resultados
5. Verificar que timer se detiene

**Resultado Esperado**:
- ✅ Botón cambia a "Ver Resultados" en pregunta 66
- ✅ Click navega a página de score
- ✅ Timer se detiene automáticamente
- ✅ Tiempo total usado visible
- ✅ Score calculado y visible (0-1000)
- ✅ Desglose: correctas/total (ej: 56/66)
- ✅ Porcentaje visible (ej: 84.8%)

**Criterios de Aceptación**:
- [ ] Cálculo de score matemáticamente correcto
- [ ] Score en escala 0-1000 (no 0-100)
- [ ] Tiempo transcurrido preciso (±2 segundos)
- [ ] No se puede volver a responder preguntas
- [ ] Resultados muestran breakdown por dominio
- [ ] Datos guardados en LocalStorage inmediatamente

**Prioridad**: P0 (Bloqueante)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-009: Pantalla de Resultados (P1 - Alta)

**Preconditions**:
- Examen completado, en página de resultados

**Pasos**:
1. Verificar score principal destacado
2. Verificar estadísticas: correctas, incorrectas, porcentaje
3. Verificar breakdown por dominio AWS (5 dominios)
4. Verificar tiempo total usado
5. Verificar fecha/hora del examen
6. Verificar botones de acción disponibles

**Resultado Esperado**:
- ✅ Score grande y visible (ej: 848)
- ✅ Indicador visual: aprobado (verde ≥720) o reprobado (rojo <720)
- ✅ Correctas/Total con porcentaje
- ✅ Tabla o cards con 5 dominios:
  - Secure Architectures
  - High-Performing Architectures
  - Cost-Optimized Architectures
  - Resilient Architectures
  - Operationally Excellent Architectures
- ✅ Cada dominio muestra: correctas/total y %
- ✅ Tiempo usado en formato legible (ej: "45 minutos")
- ✅ Botones: "Otro Examen", "Volver al Home", "Ver Progreso"

**Criterios de Aceptación**:
- [ ] Score calculation: (correctas/66) * 1000
- [ ] Color coding: verde si ≥720, rojo si <720
- [ ] Breakdown por dominio suma 66 preguntas total
- [ ] Tiempo nunca negativo o > 132 minutos
- [ ] Todos los botones funcionales
- [ ] Diseño celebratorio si score alto (>850)

**Prioridad**: P1 (Alta)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

## 🧪 Test Cases - Modo Flash Study

### TC-010: Selección de Flash Study (P1 - Alta)

**Preconditions**:
- En home page

**Pasos**:
1. Click en botón "Flash Study"
2. Verificar navegación a /flash
3. Verificar 3 opciones: 10, 20, 30
4. Click en "20 preguntas"
5. Verificar navegación a /flash/20

**Resultado Esperado**:
- ✅ Navegación smooth a /flash
- ✅ 3 botones grandes claramente visibles
- ✅ Cada botón muestra número de preguntas
- ✅ Click en cualquier opción funciona
- ✅ Navegación a /flash/[count] correcta
- ✅ Primera pregunta carga inmediatamente

**Criterios de Aceptación**:
- [ ] Todas las 3 opciones (10, 20, 30) funcionan
- [ ] No hay timer visible en flash mode
- [ ] Progress bar muestra "Pregunta 1 de [count]"
- [ ] Preguntas son aleatorias (no siempre las mismas)
- [ ] Carga en < 1 segundo

**Prioridad**: P1 (Alta)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-011: Flash Mode Sin Timer (P0 - Crítico)

**Preconditions**:
- Flash 20 iniciado

**Pasos**:
1. Verificar que NO hay timer visible
2. Responder pregunta 1 sin prisa
3. Esperar 10 segundos
4. Verificar que no hay cuenta regresiva
5. Navegar a siguiente pregunta

**Resultado Esperado**:
- ✅ NO hay timer en pantalla
- ✅ NO hay límite de tiempo
- ✅ Usuario puede tomarse el tiempo que quiera
- ✅ Navegación funciona igual que exam mode
- ✅ Explicaciones aparecen igual

**Criterios de Aceptación**:
- [ ] Timer completamente ausente (no oculto)
- [ ] No hay timeout automático
- [ ] No hay presión de tiempo
- [ ] Funcionalidad idéntica a exam mode excepto timer
- [ ] Puede pausar/resumir sesión (cerrar/reabrir navegador)

**Prioridad**: P0 (Diferenciador crítico)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-012: Completar Flash Session (P1 - Alta)

**Preconditions**:
- Flash 20, en pregunta 20

**Pasos**:
1. Responder pregunta 20
2. Click "Ver Resultados"
3. Verificar pantalla de resultados flash
4. Verificar opciones post-flash

**Resultado Esperado**:
- ✅ Pantalla de resultados similar a exam mode
- ✅ Score mostrado (correctas/20)
- ✅ Porcentaje calculado
- ✅ Tiempo total usado mostrado (sin límite)
- ✅ Botones: "Otra Sesión Flash", "Home", "Ver Progreso"
- ✅ Datos guardados en LocalStorage

**Criterios de Aceptación**:
- [ ] Score correcto (sobre 20, no sobre 66)
- [ ] Tiempo puede ser cualquier valor (sin límite)
- [ ] "Otra Sesión" genera nuevas preguntas aleatorias
- [ ] Guardado en LocalStorage bajo flashcardsCompleted[]
- [ ] No se mezcla con examsCompleted[]

**Prioridad**: P1 (Alta)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

## 🧪 Test Cases - Progress Tracking

### TC-013: Vista de Progreso Sin Datos (P2 - Media)

**Preconditions**:
- LocalStorage vacío (sin exámenes completados)

**Pasos**:
1. Navegar a /progress
2. Verificar mensaje de estado vacío

**Resultado Esperado**:
- ✅ Página carga sin errores
- ✅ Mensaje: "Aún no has completado ningún examen"
- ✅ Ilustración o empty state visual
- ✅ Botón para "Iniciar Primer Examen"
- ✅ No hay gráficos (o gráficos vacíos con mensaje)

**Criterios de Aceptación**:
- [ ] No hay crashes cuando no hay datos
- [ ] UI es clara y guía al usuario
- [ ] Botón funciona y navega a /exam
- [ ] No hay errores de JavaScript en consola

**Prioridad**: P2 (Media)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-014: Vista de Progreso Con Datos (P1 - Alta)

**Preconditions**:
- Al menos 3 exámenes completados

**Pasos**:
1. Navegar a /progress
2. Verificar stats cards arriba
3. Verificar gráfico de evolución (line chart)
4. Verificar gráfico de dominios (bar chart)
5. Verificar tabla de historial
6. Scroll completo de la página

**Resultado Esperado**:
- ✅ Stats cards muestran:
  - Total exámenes completados
  - Score promedio
  - Total de preguntas correctas
  - Predicción de score real
- ✅ Line chart con evolución de scores
- ✅ Bar chart con desempeño por dominio
- ✅ Tabla con últimos exámenes (fecha, score, tiempo)
- ✅ Indicador de dominio más débil
- ✅ Recomendación de qué estudiar

**Criterios de Aceptación**:
- [ ] Stats calculadas correctamente
- [ ] Gráficos se renderizan sin errores
- [ ] Responsive en mobile (gráficos se adaptan)
- [ ] Colores consistentes con theme
- [ ] Tabla ordenada por fecha (más reciente primero)
- [ ] Performance: render en < 2 segundos

**Prioridad**: P1 (Alta)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-015: Predictor de Score Real (P2 - Media)

**Preconditions**:
- Al menos 5 exámenes completados

**Pasos**:
1. En /progress, localizar sección "Predicción"
2. Verificar score predicho
3. Verificar margen de error
4. Verificar nivel de confianza
5. Verificar recomendaciones

**Resultado Esperado**:
- ✅ Score predicho entre 0-1000
- ✅ Margen de error (ej: ±40)
- ✅ Confianza en % (ej: 85%)
- ✅ Mensaje interpretativo:
  - "Muy probable que apruebes" si ≥720
  - "Necesitas mejorar" si <720
- ✅ Recomendación de cuántos exámenes más hacer

**Criterios de Aceptación**:
- [ ] Predicción basada en promedio ponderado
- [ ] Margen de error disminuye con más exámenes
- [ ] Confianza aumenta con más datos
- [ ] Lógica: confidence = min(exams / 12, 1.0)
- [ ] Mensajes motivacionales apropiados

**Prioridad**: P2 (Media - Nice to have)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

## 🧪 Test Cases - Persistencia de Datos

### TC-016: LocalStorage - Guardar Progreso (P0 - Crítico)

**Preconditions**:
- LocalStorage habilitado en navegador

**Pasos**:
1. Completar 1 examen completo
2. F12 → Application → Local Storage
3. Verificar key: "saa-c03-progress"
4. Inspeccionar valor JSON
5. Verificar estructura de datos

**Resultado Esperado**:
- ✅ Key "saa-c03-progress" existe
- ✅ Valor es JSON válido
- ✅ Estructura contiene:
  - examsCompleted: array
  - flashcardsCompleted: array
  - totalCorrect: number
  - totalAnswered: number
  - createdAt: timestamp
  - lastUpdated: timestamp
- ✅ Examen guardado en examsCompleted con todos los campos

**Criterios de Aceptación**:
- [ ] JSON es válido (parseable)
- [ ] Todos los campos requeridos presentes
- [ ] Timestamps en formato ISO8601
- [ ] Respuestas completas guardadas
- [ ] Score calculado correctamente
- [ ] No hay datos sensibles (passwords, etc.)

**Prioridad**: P0 (Bloqueante)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-017: LocalStorage - Recuperar Progreso (P0 - Crítico)

**Preconditions**:
- Progreso guardado en LocalStorage (1+ examen)

**Pasos**:
1. Cerrar todas las ventanas del navegador
2. Reabrir navegador
3. Navegar a http://localhost:5173
4. Verificar que home muestra estadísticas
5. Ir a /progress
6. Verificar que exámenes aparecen

**Resultado Esperado**:
- ✅ Home carga con stats actualizadas
- ✅ "1 examen completado" visible
- ✅ Score promedio calculado
- ✅ /progress muestra historial completo
- ✅ Gráficos renderizan con datos
- ✅ No hay pérdida de información

**Criterios de Aceptación**:
- [ ] Datos persisten después de cerrar navegador
- [ ] Todos los exámenes recuperados íntegros
- [ ] Cálculos se mantienen correctos
- [ ] No hay corrupción de datos
- [ ] Performance no degradada por datos grandes

**Prioridad**: P0 (Bloqueante)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-018: LocalStorage - Reset de Progreso (P1 - Alta)

**Preconditions**:
- Progreso existente en LocalStorage

**Pasos**:
1. Ir a /progress
2. Localizar botón "Reiniciar Progreso"
3. Click en "Reiniciar Progreso"
4. Verificar modal de confirmación
5. Click "Cancelar" primero
6. Verificar que nada cambió
7. Click "Reiniciar Progreso" de nuevo
8. Click "Confirmar"
9. Verificar que LocalStorage se limpió

**Resultado Esperado**:
- ✅ Modal de confirmación aparece
- ✅ Modal tiene mensaje claro: "¿Seguro? Se perderá todo"
- ✅ Botón "Cancelar" cierra modal sin cambios
- ✅ Botón "Confirmar" borra datos
- ✅ LocalStorage queda vacío o con valor inicial
- ✅ Redirect automático a home
- ✅ Home muestra estado vacío

**Criterios de Aceptación**:
- [ ] No se puede borrar accidentalmente (requiere confirmación)
- [ ] Modal tiene warning icon (⚠️)
- [ ] Texto del modal es claro y directo
- [ ] "Cancelar" es opción por defecto (más destacada)
- [ ] Después de reset, app funciona como nueva instalación
- [ ] No quedan datos residuales

**Prioridad**: P1 (Alta - Seguridad de datos)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

## 🧪 Test Cases - Responsive Design

### TC-019: Mobile Portrait (375px) (P0 - Crítico)

**Preconditions**:
- Chrome DevTools abierto (F12)
- Device toolbar activado (Ctrl+Shift+M)
- Dispositivo: iPhone SE (375x667)

**Pasos**:
1. Navegar a home
2. Verificar layout vertical
3. Navegar a exam mode
4. Responder una pregunta
5. Verificar explicación
6. Navegar a /progress

**Resultado Esperado**:
- ✅ Home: Stack vertical, botones full-width
- ✅ Exam: Pregunta legible sin zoom
- ✅ Opciones con touch target ≥ 44px
- ✅ Timer visible arriba
- ✅ No hay scroll horizontal
- ✅ Texto ≥ 16px
- ✅ Botones accesibles sin overlap

**Criterios de Aceptación**:
- [ ] Todo el contenido accesible sin zoom
- [ ] Touch targets mínimo 44x44px
- [ ] Font size mínimo 16px (evita auto-zoom)
- [ ] Spacing adecuado entre elementos (≥ 12px)
- [ ] No hay elementos cortados o fuera de pantalla
- [ ] Gráficos responsive (se adaptan al ancho)

**Prioridad**: P0 (50%+ de usuarios en mobile)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-020: Tablet Portrait (768px) (P1 - Alta)

**Preconditions**:
- Device: iPad (768x1024)

**Pasos**:
1. Navegar a todas las páginas principales
2. Verificar uso del espacio
3. Verificar grids adaptativos

**Resultado Esperado**:
- ✅ Layout en 2 columnas donde aplica
- ✅ Grid de exámenes: 3-4 por fila
- ✅ Spacing generoso
- ✅ Gráficos más grandes que mobile
- ✅ Touch-friendly pero no oversized

**Criterios de Aceptación**:
- [ ] Aprovecha espacio disponible eficientemente
- [ ] No es solo mobile stretched
- [ ] Elementos no se ven perdidos en el espacio
- [ ] Touch targets 48x48px
- [ ] Font size 14-16px

**Prioridad**: P1 (Alta)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-021: Desktop (1920px) (P1 - Alta)

**Preconditions**:
- Viewport: 1920x1080

**Pasos**:
1. Navegar a home
2. Verificar max-width del contenido
3. Verificar hover effects
4. Verificar spacing

**Resultado Esperado**:
- ✅ Contenido centrado con max-width ~1200px
- ✅ Márgenes laterales generosos
- ✅ Hover effects en todos los botones
- ✅ Cursor: pointer en elementos clickeables
- ✅ Tipografía cómoda para lectura (14-16px)

**Criterios de Aceptación**:
- [ ] Contenido no pegado a bordes
- [ ] Max-width aplicado consistentemente
- [ ] Hover states sutiles pero claros
- [ ] No hay elementos que requieren scroll innecesario
- [ ] Performance 60fps en animaciones

**Prioridad**: P1 (Alta - Primary use case)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

## 🧪 Test Cases - Cross-Browser

### TC-022: Chrome/Edge (Chromium) (P0 - Crítico)

**Browser**: Chrome 120+ o Edge 120+

**Pasos**:
1. Ejecutar todos los TCs P0 anteriores
2. Verificar DevTools console (0 errores)
3. Verificar LocalStorage funciona
4. Verificar performance

**Criterios de Aceptación**:
- [ ] 100% de funcionalidad operativa
- [ ] 0 errores en consola
- [ ] LocalStorage funciona perfecto
- [ ] Performance score ≥ 90

**Prioridad**: P0 (Browser principal)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-023: Firefox (P1 - Alta)

**Browser**: Firefox 120+

**Pasos**:
1. Ejecutar TCs P0 críticos
2. Verificar CSS rendering
3. Verificar timer accuracy

**Criterios de Aceptación**:
- [ ] Funcionalidad completa
- [ ] CSS consistente con Chrome
- [ ] Timer preciso
- [ ] LocalStorage funciona

**Prioridad**: P1 (15-20% de usuarios)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-024: Safari (P1 - Alta)

**Browser**: Safari 16+ (Desktop o iOS)

**Pasos**:
1. Ejecutar TCs P0 críticos
2. Verificar LocalStorage
3. Verificar date/time handling

**Criterios de Aceptación**:
- [ ] Funcionalidad completa
- [ ] LocalStorage sin quirks
- [ ] Timestamps correctos
- [ ] No hay rendering bugs

**Prioridad**: P1 (20-25% de usuarios, especialmente mobile)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

## 🧪 Test Cases - Performance

### TC-025: Lighthouse Audit - Mobile (P0 - Crítico)

**Tool**: Chrome Lighthouse

**Pasos**:
1. F12 → Lighthouse tab
2. Device: Mobile
3. Categories: All
4. Click "Generate report"
5. Esperar resultados

**Resultado Esperado**:
- ✅ Performance: ≥ 90
- ✅ Accessibility: ≥ 90
- ✅ Best Practices: ≥ 95
- ✅ SEO: ≥ 95

**Criterios de Aceptación**:
- [ ] Performance score ≥ 90
- [ ] First Contentful Paint < 1.8s
- [ ] Speed Index < 3.4s
- [ ] Time to Interactive < 3.9s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Total Blocking Time < 200ms

**Prioridad**: P0 (Core Web Vitals)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-026: Bundle Size Analysis (P2 - Media)

**Tool**: npm run build + análisis

**Pasos**:
1. npm run build
2. ls -lh app/dist/assets/
3. Verificar tamaños de archivos

**Resultado Esperado**:
- ✅ question-data-*.js: 3-4 MB (aceptable por 923 preguntas)
- ✅ vendor-*.js: < 500 KB
- ✅ index-*.js: < 100 KB
- ✅ index-*.css: < 50 KB
- ✅ Total bundle: < 6 MB

**Criterios de Aceptación**:
- [ ] Bundle total < 6 MB
- [ ] Assets minificados
- [ ] Gzip/Brotli compression en producción
- [ ] No hay duplicación de código obvia

**Prioridad**: P2 (Optimizable en futuro)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

## 🧪 Test Cases - Security

### TC-027: XSS Prevention (P1 - Alta)

**Pasos**:
1. Inspeccionar HTML de preguntas
2. Buscar pregunta con caracteres especiales
3. Verificar que < > están escapados
4. F12 → Buscar <script> tags inline
5. Verificar que no hay eval() en código

**Resultado Esperado**:
- ✅ React escapa HTML automáticamente
- ✅ No hay <script> tags en DOM (excepto bundle)
- ✅ Caracteres < > renderizados como &lt; &gt;
- ✅ No hay eval() ni innerHTML directo
- ✅ LocalStorage solo contiene JSON

**Criterios de Aceptación**:
- [ ] Imposible inyectar <script> via preguntas
- [ ] React sanitiza automáticamente
- [ ] No se usa dangerouslySetInnerHTML
- [ ] CSP headers configurados (en Vercel)

**Prioridad**: P1 (Alta - Security fundamental)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-028: Security Headers (P1 - Alta)

**Environment**: Producción (Vercel)

**Pasos**:
1. Deploy a Vercel
2. F12 → Network tab
3. Inspeccionar response headers

**Resultado Esperado**:
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Strict-Transport-Security: max-age=...
- ✅ Referrer-Policy: strict-origin-when-cross-origin

**Criterios de Aceptación**:
- [ ] Todos los headers presentes
- [ ] HTTPS forzado
- [ ] No hay mixed content warnings

**Prioridad**: P1 (Alta - Producción only)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

## 🧪 Test Cases - Accessibility

### TC-029: Keyboard Navigation (P1 - Alta)

**Pasos**:
1. Navegar solo con teclado (sin mouse)
2. Tab entre elementos
3. Enter para seleccionar
4. Space para toggle

**Resultado Esperado**:
- ✅ Tab navega entre elementos interactivos
- ✅ Focus indicator visible (outline o border)
- ✅ Enter activa botones y links
- ✅ Space selecciona opciones
- ✅ Escape cierra modals
- ✅ Orden lógico de tab

**Criterios de Aceptación**:
- [ ] Todos los elementos accesibles por teclado
- [ ] Focus visible con contraste ≥ 3:1
- [ ] No hay keyboard traps
- [ ] Orden de tab lógico (top to bottom, left to right)
- [ ] Skip links disponibles (opcional)

**Prioridad**: P1 (WCAG 2.1 AA)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-030: Screen Reader Compatibility (P2 - Media)

**Tool**: NVDA (Windows) o VoiceOver (Mac)

**Pasos**:
1. Activar screen reader
2. Navegar por home
3. Iniciar un examen
4. Escuchar anuncios

**Resultado Esperado**:
- ✅ Landmarks (main, nav) identificados
- ✅ Headings jerárquicos (h1, h2, h3)
- ✅ Botones anunciados como "button"
- ✅ Links anunciados como "link"
- ✅ ARIA labels donde necesario
- ✅ Focus management correcto

**Criterios de Aceptación**:
- [ ] Contenido navegable por screen reader
- [ ] Anuncios claros y útiles
- [ ] No hay elementos ocultos confusos
- [ ] Alt text en imágenes (si hay)

**Prioridad**: P2 (Nice to have - WCAG AAA)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

## 🧪 Test Cases - Edge Cases

### TC-031: Timer Expiration (P1 - Alta)

**Preconditions**:
- Exam mode iniciado

**Pasos**:
1. Modificar timer manualmente (DevTools) a 00:05
2. Esperar que timer llegue a 00:00
3. Observar comportamiento

**Resultado Esperado**:
- ✅ Al llegar a 00:00, examen se auto-completa
- ✅ Redirect automático a página de resultados
- ✅ Preguntas sin responder cuentan como incorrectas
- ✅ Score calculado solo con respondidas
- ✅ Mensaje: "Tiempo expirado"

**Criterios de Aceptación**:
- [ ] No hay crash al expirar timer
- [ ] Transición automática smooth
- [ ] Score no es NaN o undefined
- [ ] Usuario entiende qué pasó

**Prioridad**: P1 (Puede ocurrir en uso real)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-032: LocalStorage Full (P2 - Media)

**Preconditions**:
- Simulador con varios exámenes completados

**Pasos**:
1. Llenar LocalStorage artificialmente (DevTools)
2. Intentar completar otro examen
3. Observar comportamiento

**Resultado Esperado**:
- ✅ Error manejado gracefully
- ✅ Mensaje: "Espacio de almacenamiento lleno"
- ✅ Sugerencia de limpiar datos antiguos
- ✅ No hay crash
- ✅ Usuario puede continuar (sin guardar)

**Criterios de Aceptación**:
- [ ] Try/catch alrededor de localStorage.setItem()
- [ ] Error message claro para el usuario
- [ ] Opción de exportar datos antes de limpiar
- [ ] App no se rompe

**Prioridad**: P2 (Raro pero posible)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-033: Network Offline (P1 - Alta)

**Preconditions**:
- App cargada en navegador

**Pasos**:
1. DevTools → Network tab
2. Throttling: Offline
3. Navegar entre páginas
4. Intentar completar examen

**Resultado Esperado**:
- ✅ App continúa funcionando normalmente
- ✅ Todas las preguntas cargadas en memoria
- ✅ Routing funciona (client-side)
- ✅ LocalStorage funciona
- ✅ No hay errores de red visibles al usuario

**Criterios de Aceptación**:
- [ ] 100% funcionalidad offline después de carga inicial
- [ ] No hay llamadas API (app es offline-first)
- [ ] Assets cacheados (considerar PWA en futuro)

**Prioridad**: P1 (Feature clave - offline-first)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

### TC-034: Multiple Tabs/Windows (P2 - Media)

**Preconditions**:
- Simulador abierto en 2 tabs

**Pasos**:
1. Tab 1: Completar examen
2. Tab 2: Navegar a /progress
3. Verificar sincronización

**Resultado Esperado**:
- ✅ LocalStorage compartido entre tabs
- ✅ Tab 2 puede no actualizar en tiempo real (aceptable)
- ✅ Refresh en Tab 2 muestra datos actualizados
- ✅ No hay conflictos de escritura
- ✅ No hay corrupción de datos

**Criterios de Aceptación**:
- [ ] No hay race conditions
- [ ] Último write gana (last-write-wins)
- [ ] No se pierden datos por multi-tab
- [ ] Considerar storage events (futuro)

**Prioridad**: P2 (Edge case)  
**Resultado**: ⬜ PENDING / ✅ PASS / ❌ FAIL

---

## 📊 Summary de Testing

### Distribución de Prioridades

| Prioridad | Cantidad | Porcentaje | Criterio de Aceptación |
|-----------|----------|------------|------------------------|
| P0 (Bloqueante) | 11 | 32% | 100% PASS obligatorio |
| P1 (Alta) | 17 | 50% | ≥95% PASS requerido |
| P2 (Media) | 6 | 18% | ≥90% PASS recomendado |
| **TOTAL** | **34** | **100%** | **≥95% global** |

---

## 📋 Test Execution Template

Usa esta tabla para trackear ejecución:

| Test ID | Nombre | Prioridad | Ejecutado | Resultado | Bugs | Notas |
|---------|--------|-----------|-----------|-----------|------|-------|
| TC-001 | Selección de Examen | P0 | ⬜ | ⬜ | - | - |
| TC-002 | Timer Inicio | P0 | ⬜ | ⬜ | - | - |
| TC-003 | Timer Pausa | P1 | ⬜ | ⬜ | - | - |
| ... | ... | ... | ... | ... | ... | ... |

**Símbolos**:
- ⬜ PENDING
- 🔄 IN PROGRESS
- ✅ PASS
- ❌ FAIL
- ⚠️ PASS WITH ISSUES

---

## 🐛 Bug Severity Classification

### 🔴 Bloqueante (Blocker)
- App no inicia
- Crash completo
- Pérdida de datos
- No se puede completar flujo crítico

### 🟠 Crítico (Critical)
- Feature principal no funciona
- Error visible al usuario
- Workaround complejo

### 🟡 Mayor (Major)
- Feature secundaria no funciona
- Error que afecta UX negativamente
- Workaround disponible

### 🟢 Menor (Minor)
- Issue cosmético
- Typo o texto incorrecto
- Performance degradada levemente

### ⚪ Trivial
- Sugerencia de mejora
- Inconsistencia visual menor

---

## ✅ Criterios de Sign-Off

El simulador puede pasar a **PRODUCCIÓN** solo si:

### ✅ Funcionales
- [ ] 100% de TCs P0 pasados (11/11)
- [ ] ≥95% de TCs P1 pasados (≥16/17)
- [ ] ≥90% de TCs P2 pasados (≥5/6)
- [ ] 0 bugs bloqueantes abiertos
- [ ] ≤3 bugs críticos abiertos (con workaround documentado)

### ✅ Performance
- [ ] Lighthouse Performance ≥ 90 (mobile)
- [ ] Lighthouse Accessibility ≥ 90
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.9s

### ✅ Security
- [ ] 0 vulnerabilidades críticas
- [ ] Security headers configurados
- [ ] XSS prevention validado

### ✅ Compatibility
- [ ] Chrome/Edge funcional 100%
- [ ] Firefox funcional ≥95%
- [ ] Safari funcional ≥95%
- [ ] Mobile (375px) funcional 100%

### ✅ Documentación
- [ ] Todos los bugs documentados
- [ ] Known issues listados
- [ ] Release notes preparadas

---

## 📝 Test Report Template

```markdown
# Test Execution Report - SAA-C03 Simulator

**Fecha**: [Date]
**Tester**: [Name]
**Versión**: 1.0.0
**Ambiente**: Local / Production

## Summary
- Total TCs: 34
- Ejecutados: X
- Pasados: X
- Fallados: X
- Pass Rate: XX%

## Breakdown por Prioridad
- P0: X/11 (XX%)
- P1: X/17 (XX%)
- P2: X/6 (XX%)

## Bugs Encontrados
| ID | Severidad | Descripción | Status |
|----|-----------|-------------|--------|
| BUG-001 | Critical | Timer no pausa correctamente | Open |
| ... | ... | ... | ... |

## Performance
- Lighthouse Score: XX/100
- Bundle Size: X.X MB
- Load Time: X.Xs

## Recomendación
☑️ APROBADO PARA PRODUCCIÓN
⚠️ APROBADO CON CONDICIONES
❌ NO APROBADO - REQUIERE FIXES

## Notas Adicionales
[Comentarios del QA]
```

---

## 🎓 Conclusión

Este perfil de QA proporciona una **base completa y operativa** para validar el Simulador SAA-C03 con criterios de aceptación estrictos de nivel producción.

**34 Test Cases** cubren:
- ✅ Funcionalidad completa (Exam, Flash, Progress)
- ✅ Persistencia de datos (LocalStorage)
- ✅ Responsive design (3 breakpoints)
- ✅ Cross-browser (3 browsers)
- ✅ Performance (Lighthouse)
- ✅ Security (XSS, headers)
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Edge cases (timer, offline, multi-tab)

**Próximo paso**: Ejecutar los tests y documentar resultados.

---

*Creado por: Sistema QA Automatizado*  
*Para: SAA-C03 Simulator v1.0.0*  
*Fecha: Enero 2025*
