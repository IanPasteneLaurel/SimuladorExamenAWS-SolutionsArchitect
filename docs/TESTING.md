# 🧪 Testing Guide - SAA-C03 Simulator

Guía completa de testing manual para validar que el simulador funciona correctamente antes y después del deployment.

## 📋 Tabla de Contenidos

- [Pre-requisitos](#pre-requisitos)
- [Testing Local](#testing-local)
- [Testing de Funcionalidad](#testing-de-funcionalidad)
- [Testing de UI/UX](#testing-de-uiux)
- [Testing Responsive](#testing-responsive)
- [Testing de Performance](#testing-de-performance)
- [Testing de Seguridad](#testing-de-seguridad)
- [Checklist Final](#checklist-final)

---

## Pre-requisitos

Antes de comenzar los tests:

```bash
# 1. Instalar dependencias
cd app
npm install

# 2. Validar datos
cd ..
node scripts/validate-questions.js

# 3. Iniciar servidor de desarrollo
cd app
npm run dev
```

Abrir navegador en: http://localhost:5173

---

## 🎯 Testing Local

### Test 1: Servidor de Desarrollo

**Objetivo**: Verificar que el servidor local funciona

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | `npm run dev` | Servidor inicia sin errores |
| 2 | Abrir http://localhost:5173 | Página carga en < 2 segundos |
| 3 | Verificar consola del navegador | Sin errores en consola |
| 4 | Hot reload: editar archivo | Cambios se reflejan automáticamente |

**✅ Criterio de Éxito**: Servidor inicia, página carga, no hay errores en consola

---

## 🔧 Testing de Funcionalidad

### Test 2: Página Home

**Objetivo**: Verificar dashboard principal

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Cargar home (/) | Se muestran stats cards |
| 2 | Verificar título | "SAA-C03 Exam Simulator" visible |
| 3 | Verificar subtítulo | "923 preguntas · 14 exámenes" |
| 4 | Stats iniciales | Muestran 0 o "-" si no hay progreso |
| 5 | Botones visibles | 3 botones: Examen, Flash, Progreso |

**✅ Criterio de Éxito**: Todos los elementos se muestran correctamente

---

### Test 3: Modo Examen Completo

**Objetivo**: Verificar flujo completo de examen

#### 3.1 Selección de Examen

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Click "Examen Completo" | Navega a /exam |
| 2 | Se muestran 14 exámenes | Grid con botones 1-14 |
| 3 | Click "Examen 1" | Navega a /exam/1 |
| 4 | Página carga | Primera pregunta visible |

#### 3.2 Durante el Examen

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Verificar timer | Muestra 132:00 (132 minutos) |
| 2 | Timer cuenta regresivo | Cada segundo disminuye |
| 3 | Click en timer | Pausa el timer |
| 4 | Click de nuevo | Resume el timer |
| 5 | Progress bar | Muestra "Pregunta 1 de 66" |
| 6 | Pregunta visible | Texto completo sin truncar |
| 7 | Opciones visibles | A, B, C, D completas |
| 8 | Click opción A | Se marca la opción |
| 9 | Aparece explicación | Muestra si es correcto/incorrecto |
| 10 | Explicación completa | Texto, servicios AWS, tips visibles |
| 11 | Botón "Siguiente" | Visible y clickeable |
| 12 | Click "Siguiente" | Carga pregunta 2 |
| 13 | Pregunta anterior | NO se puede cambiar respuesta |

#### 3.3 Finalizar Examen

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Responder las 66 preguntas | Progress: 66/66 |
| 2 | Última pregunta | Botón dice "Ver resultados" |
| 3 | Click "Ver resultados" | Navega a pantalla de score |
| 4 | Score visible | Número entre 0-1000 |
| 5 | Correctas/Total | Ej: "56/66" |
| 6 | Porcentaje | Ej: "84.8%" |
| 7 | Breakdown por dominio | 5 dominios con stats |
| 8 | Botones acción | "Otro examen" y "Volver" |

**✅ Criterio de Éxito**: 
- Timer funciona correctamente
- 66 preguntas se muestran sin errores
- Score se calcula correctamente
- Progreso se guarda en LocalStorage

---

### Test 4: Modo Flash Study

**Objetivo**: Verificar sesiones rápidas de estudio

#### 4.1 Selección de Tamaño

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Click "Flash Study" | Navega a /flash |
| 2 | Se muestran 3 opciones | Botones: 10, 20, 30 |
| 3 | Click "20 preguntas" | Navega a /flash/20 |

#### 4.2 Durante Flash Session

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | NO hay timer | Sin cronómetro visible |
| 2 | Progress bar | "Pregunta 1 de 20" |
| 3 | Pregunta aleatoria | Texto completo visible |
| 4 | Responder pregunta | Explicación aparece |
| 5 | Click "Siguiente" | Carga siguiente pregunta |
| 6 | Repetir 20 veces | Llega a pregunta 20 |

#### 4.3 Finalizar Flash

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Última pregunta | Botón "Ver resultados" |
| 2 | Click "Ver resultados" | Muestra score de sesión |
| 3 | Score visible | "18/20 (90%)" |
| 4 | Opciones | "Otra sesión" y "Home" |

**✅ Criterio de Éxito**: Flash mode funciona sin timer, preguntas aleatorias

---

### Test 5: Página de Progreso

**Objetivo**: Verificar analytics y estadísticas

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Click "Mi Progreso" | Navega a /progress |
| 2 | Stats cards | Muestra resumen numérico |
| 3 | Si hay exámenes | Gráfico de evolución visible |
| 4 | Gráfico de línea | Score evolution renderizado |
| 5 | Gráfico de barras | Desempeño por dominio |
| 6 | Tabla historial | Últimos exámenes listados |
| 7 | Predictor de score | Muestra estimación |
| 8 | Botón "Reiniciar progreso" | Visible arriba a la derecha |
| 9 | Click "Reiniciar" | Pide confirmación |
| 10 | Confirmar | Borra todo el progreso |
| 11 | Sin progreso | Mensaje "Aun no has completado..." |

**✅ Criterio de Éxito**: Gráficos se renderizan, stats calculan correctamente

---

### Test 6: Persistencia de Datos

**Objetivo**: Verificar que LocalStorage funciona

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Completar 1 examen | Score guardado |
| 2 | Ir a "Mi Progreso" | Examen aparece en historial |
| 3 | Cerrar navegador | --- |
| 4 | Reabrir navegador | Ir a http://localhost:5173 |
| 5 | Home muestra stats | "1 examen completado" |
| 6 | Ir a "Mi Progreso" | Examen aún está |
| 7 | F12 → Application → LocalStorage | Key: "saa-c03-progress" existe |
| 8 | Valor JSON | Contiene examsCompleted array |

**✅ Criterio de Éxito**: Progreso persiste después de cerrar navegador

---

### Test 7: Navegación y Routing

**Objetivo**: Verificar React Router

| Paso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Navegar a / | Home carga |
| 2 | Navegar a /exam | Selector de examen |
| 3 | Navegar a /exam/5 | Examen 5 carga |
| 4 | Navegar a /flash | Selector flash |
| 5 | Navegar a /flash/30 | Flash 30 carga |
| 6 | Navegar a /progress | Progress carga |
| 7 | Navegar a /404-invalid | Redirige a / (o 404 page) |
| 8 | Botón "Volver" | Regresa a página anterior |
| 9 | Browser back button | Navega correctamente |
| 10 | Browser forward button | Navega correctamente |

**✅ Criterio de Éxito**: Todas las rutas funcionan, no hay errores 404

---

## 🎨 Testing de UI/UX

### Test 8: Componentes Visuales

| Elemento | Verificar | Criterio de Éxito |
|----------|-----------|-------------------|
| Colores | Paleta AWS (azul #0066CC, naranja #FF9900) | Colores consistentes |
| Tipografía | Inter font, tamaños legibles | Texto claro en todo el sitio |
| Botones | Hover effects, active states | Feedback visual claro |
| Cards | Sombras, bordes redondeados | Diseño moderno y limpio |
| Icons | Lucide React icons | Icons cargan y se ven bien |
| Progress Bar | Animado, color azul | Barra se actualiza |
| Timer | Monospace font, grande | Fácil de leer |
| Explicaciones | Iconos, formato claro | Estructura legible |

**✅ Criterio de Éxito**: UI es consistente, profesional y agradable

---

### Test 9: Accesibilidad

| Aspecto | Verificar | Criterio de Éxito |
|---------|-----------|-------------------|
| Contraste | Texto vs fondo | Ratio ≥ 4.5:1 |
| Touch targets | Botones en móvil | ≥ 44px × 44px |
| Keyboard navigation | Tab entre elementos | Funciona sin mouse |
| Focus indicators | Outline visible | Se ve dónde estás |
| ARIA labels | Screen reader friendly | Elementos etiquetados |
| Alt text | Imágenes descriptivas | Alt presente |

**Testing Tools**:
- Chrome DevTools → Lighthouse → Accessibility
- WAVE extension
- axe DevTools

**✅ Criterio de Éxito**: Score de accesibilidad > 90 en Lighthouse

---

## 📱 Testing Responsive

### Test 10: Mobile (375px - iPhone)

| Elemento | Verificar | Criterio de Éxito |
|----------|-----------|-------------------|
| Layout | Stack vertical | Sin scroll horizontal |
| Texto | Tamaño ≥ 16px | Legible sin zoom |
| Botones | Touch-friendly | ≥ 44px altura |
| Preguntas | Texto completo visible | Sin truncar |
| Timer | Visible arriba | No tapa contenido |
| Progress bar | Ancho completo | Visible claramente |
| Gráficos | Responsive | Se adaptan al ancho |

**Cómo testar**:
```
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Seleccionar: iPhone SE (375px)
3. Navegar por todas las páginas
4. Probar todas las funcionalidades
```

---

### Test 11: Tablet (768px - iPad)

| Elemento | Verificar | Criterio de Éxito |
|----------|-----------|-------------------|
| Layout | 2 columnas donde aplique | Uso eficiente del espacio |
| Grid de exámenes | 3-4 por fila | Bien espaciado |
| Preguntas | Ancho cómodo | Fácil de leer |
| Landscape | Funciona horizontal | No se rompe el layout |

---

### Test 12: Desktop (1920px)

| Elemento | Verificar | Criterio de Éxito |
|----------|-----------|-------------------|
| Max-width | Contenido centrado | No más de 1200px ancho |
| Espaciado | Márgenes generosos | No pegado a bordes |
| Hover effects | Todos los botones | Feedback visual |

**✅ Criterio de Éxito**: Funciona perfectamente en mobile, tablet, desktop

---

## ⚡ Testing de Performance

### Test 13: Lighthouse Audit

**Ejecutar**:
```
1. Chrome DevTools (F12)
2. Lighthouse tab
3. Categorías: Performance, Accessibility, Best Practices, SEO
4. Device: Mobile + Desktop
5. "Generate report"
```

**Targets**:

| Métrica | Target Mobile | Target Desktop |
|---------|---------------|----------------|
| Performance | > 90 | > 95 |
| Accessibility | > 95 | > 95 |
| Best Practices | > 95 | > 95 |
| SEO | > 95 | > 95 |
| First Contentful Paint | < 1.8s | < 1.0s |
| Speed Index | < 3.4s | < 2.0s |
| Time to Interactive | < 3.9s | < 2.5s |
| Cumulative Layout Shift | < 0.1 | < 0.1 |

**✅ Criterio de Éxito**: Todas las métricas dentro de targets

---

### Test 14: Bundle Size

| Archivo | Tamaño | Límite | Estado |
|---------|--------|--------|--------|
| question-data-*.js | ~3.7 MB | < 5 MB | ⚠️ Grande pero OK |
| vendor-*.js | ~160 KB | < 500 KB | ✅ |
| index-*.js | ~31 KB | < 100 KB | ✅ |
| index-*.css | ~14 KB | < 50 KB | ✅ |
| **Total** | ~3.9 MB | < 6 MB | ✅ |

**Verificar**:
```bash
npm run build
ls -lh app/dist/assets/
```

**✅ Criterio de Éxito**: Bundle total < 6 MB (aceptable para 923 preguntas)

---

## 🔒 Testing de Seguridad

### Test 15: Security Headers

**Verificar en Network tab** (F12 → Network → Headers):

| Header | Valor Esperado | Presente |
|--------|----------------|----------|
| X-Content-Type-Options | nosniff | ✅ |
| X-Frame-Options | DENY | ✅ |
| X-XSS-Protection | 1; mode=block | ✅ |
| Content-Security-Policy | (opcional) | - |
| Strict-Transport-Security | max-age=... | ✅ (en Vercel) |

---

### Test 16: XSS Prevention

| Test | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Buscar pregunta con `<script>` | React escapa automáticamente |
| 2 | Inspeccionar HTML | No hay script tags inline |
| 3 | Verificar LocalStorage | Solo JSON, no código |

**✅ Criterio de Éxito**: React previene XSS automáticamente

---

## 📊 Checklist Final

### Pre-Deployment

- [ ] ✅ Validación de datos pasada (923/923 preguntas)
- [ ] ✅ Build local exitoso (`npm run build`)
- [ ] ✅ Todos los tests funcionales pasados
- [ ] ✅ Tests responsive completados
- [ ] ✅ Lighthouse score > 90
- [ ] ✅ No hay errores en consola
- [ ] ✅ No hay warnings críticos
- [ ] ✅ LocalStorage funciona correctamente

### Post-Deployment (Vercel)

- [ ] ✅ URL de producción accesible
- [ ] ✅ SSL/HTTPS activo
- [ ] ✅ Todas las rutas funcionan
- [ ] ✅ Assets cargan correctamente
- [ ] ✅ Gráficos se renderizan
- [ ] ✅ LocalStorage persiste
- [ ] ✅ Performance en producción > 90
- [ ] ✅ Security headers presentes
- [ ] ✅ No hay errores en Vercel logs

### Testing Multi-Browser

- [ ] ✅ Chrome (última versión)
- [ ] ✅ Firefox (última versión)
- [ ] ✅ Safari (última versión)
- [ ] ✅ Edge (última versión)
- [ ] ✅ Chrome Mobile (Android)
- [ ] ✅ Safari Mobile (iOS)

### Testing Multi-Dispositivo

- [ ] ✅ iPhone (375px)
- [ ] ✅ iPhone Pro Max (428px)
- [ ] ✅ iPad (768px)
- [ ] ✅ iPad Pro (1024px)
- [ ] ✅ Desktop (1920px)
- [ ] ✅ 4K (2560px)

---

## 🐛 Reporte de Bugs

Si encuentras un bug durante testing, documenta:

### Template de Bug Report

```markdown
**Título**: [Descripción breve del bug]

**Severidad**: Crítico / Alto / Medio / Bajo

**Reproducir**:
1. Paso 1
2. Paso 2
3. ...

**Resultado Esperado**:
[Qué debería pasar]

**Resultado Actual**:
[Qué pasó realmente]

**Entorno**:
- Browser: Chrome 120
- OS: Windows 11
- Viewport: 1920x1080
- URL: http://localhost:5173/exam/1

**Capturas**:
[Screenshots o videos]

**Consola**:
[Errores de consola si hay]
```

---

## 📝 Log de Testing

Mantén un registro de tests ejecutados:

| Fecha | Tester | Tests | Resultado | Notas |
|-------|--------|-------|-----------|-------|
| 2025-01-05 | Ian | 1-16 | ✅ PASS | All tests passed |
| --- | --- | --- | --- | --- |

---

## 🎯 Criterios de Aceptación Global

El simulador está listo para producción cuando:

- ✅ Todos los tests funcionales (1-7) pasan
- ✅ Todos los tests de UI/UX (8-9) pasan
- ✅ Todos los tests responsive (10-12) pasan
- ✅ Performance score > 90 en Lighthouse
- ✅ Security tests (15-16) pasan
- ✅ Funciona en todos los browsers target
- ✅ Funciona en todos los dispositivos target
- ✅ No hay bugs críticos o de alta severidad
- ✅ Documentación completa y actualizada

---

## 🆘 Soporte

**Problemas durante testing?**

1. Revisar documentación en `/docs`
2. Verificar logs de consola
3. Verificar Vercel deployment logs
4. Crear issue en GitHub
5. Contactar: ian@ianlaurelpastene.com

---

*Última actualización: Enero 2025*
*Versión: 1.0.0*
