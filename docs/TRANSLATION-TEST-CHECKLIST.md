# ✅ Checklist de Pruebas - Sistema de Traducción

## 🌐 URL del Simulador
**http://localhost:5173/**

---

## 📋 PRUEBAS A REALIZAR

### 1. ✅ Home Page (Página Principal)

**Lo que debes ver:**
- [ ] Toggle de idioma en la esquina superior derecha (icono de globo con "EN")
- [ ] Título: "SAA-C03 Exam Simulator"
- [ ] Texto: "923 preguntas reales • 14 exámenes completos • sin repetición"
- [ ] 3 estadísticas en la parte superior
- [ ] 3 tarjetas grandes: "Examen Completo", "Flash Study", "Mi Progreso"

**Prueba el toggle:**
1. Click en el toggle de idioma (esquina superior derecha)
2. Debe cambiar a español instantáneamente
3. Verifica que los textos cambien:
   - ✅ "SAA-C03 Exam Simulator" → permanece igual
   - ✅ "preguntas reales" → "real questions" (y viceversa)
   - ✅ "Examen Completo" → "Full Exam"
   - ✅ "Flash Study" → permanece igual
   - ✅ "Mi Progreso" → "My Progress"

**Comportamiento esperado:**
- ✅ Cambio instantáneo sin recarga
- ✅ Animación suave en el toggle
- ✅ Las tarjetas y textos deben actualizar inmediatamente

---

### 2. ✅ Exam Mode (Modo Examen)

**Navegación:**
1. Desde Home, click en "Examen Completo" / "Full Exam"
2. Debes ver selector de exámenes

**Lo que debes ver:**
- [ ] Toggle de idioma en el header (icono pequeño)
- [ ] Botón "Volver al inicio" / "Back to Home"
- [ ] Título: "Examen Completo" / "Full Exam"
- [ ] Texto descriptivo sobre 14 exámenes
- [ ] Grid de botones con "Examen 1" ... "Examen 14"

**Prueba el toggle:**
1. Click en el toggle de idioma
2. Verifica cambios:
   - ✅ "Volver al inicio" ↔ "Back to Home"
   - ✅ "Examen Completo" ↔ "Full Exam"
   - ✅ "Examen" ↔ "Exam"
   - ✅ "preguntas" ↔ "questions"

**Selecciona un examen:**
1. Click en "Examen 1"
2. Debes ver la primera pregunta
3. **IMPORTANTE**: La pregunta estará en inglés (normal, no hay traducciones aún)
4. Pero los textos de UI deben estar en el idioma seleccionado:
   - ✅ "Pregunta X de 66" / "Question X of 66"
   - ✅ Botones "Confirmar respuesta" / "Confirm Answer" (después de seleccionar)
   - ✅ "Cancelar" / "Cancel"

**Prueba una pregunta:**
1. Selecciona cualquier opción (A, B, C o D)
2. Debe aparecer botón "Confirmar respuesta"
3. Click en "Confirmar"
4. Verás la explicación
5. Verifica textos traducidos en la explicación:
   - ✅ "¡Correcto! 🎉" / "Correct! 🎉"
   - ✅ "Incorrecto" / "Incorrect"
   - ✅ "Tu respuesta:" / "Your answer:"
   - ✅ "¿Por qué la opción X es correcta?" / "Why option X is correct?"
   - ✅ "Servicios AWS" / "AWS Services"
   - ✅ "Nivel de dificultad" / "Difficulty Level"
   - ✅ "Siguiente pregunta" / "Next Question"

---

### 3. ✅ Flash Mode (Modo Flash)

**Navegación:**
1. Volver al Home (click en logo o "Volver al inicio")
2. Click en "Flash Study"

**Lo que debes ver:**
- [ ] Toggle de idioma en el header
- [ ] Botón "Volver al inicio" / "Back to Home"
- [ ] Título: "Flash Study"
- [ ] 3 botones grandes: 10, 20, 30

**Prueba el toggle:**
1. Click en el toggle
2. Verifica cambios:
   - ✅ "Volver al inicio" ↔ "Back to Home"
   - ✅ "preguntas" ↔ "questions"

**Selecciona una sesión:**
1. Click en "10"
2. La pregunta aparecerá (en inglés, pero UI traducida)
3. Mismo comportamiento que Exam Mode

---

### 4. ✅ Persistencia del Idioma

**Prueba crucial:**
1. Cambia el idioma a español
2. Navega entre páginas (Home → Exam → Flash → Home)
3. **Verifica**: El idioma debe mantenerse en español en todas las páginas
4. Recarga la página del navegador (F5)
5. **Verifica**: Debe seguir en español después de recargar

**Comportamiento esperado:**
- ✅ El idioma se mantiene al navegar
- ✅ El idioma se mantiene después de F5
- ✅ El idioma se guarda en localStorage

**Para verificar localStorage:**
1. Abre DevTools (F12)
2. Ve a Application → Local Storage → http://localhost:5173
3. Busca la clave `simulator-language`
4. Debe tener valor `"es"` o `"en"` según lo seleccionado

---

### 5. ✅ Responsive Design

**Prueba en diferentes tamaños:**

**Desktop (pantalla completa):**
- [ ] Toggle visible y accesible
- [ ] Layout de 2-3 columnas
- [ ] Textos legibles

**Tablet (resize ventana ~768px):**
- [ ] Toggle sigue visible
- [ ] Layout adapta a 1-2 columnas
- [ ] Navegación funcional

**Móvil (resize ventana ~375px):**
- [ ] Toggle compacto pero funcional
- [ ] Layout de 1 columna
- [ ] Botones con altura mínima 44px
- [ ] Textos no se cortan

---

## 🐛 PROBLEMAS CONOCIDOS (Esperados)

### ❌ NO es un bug:
1. **Las preguntas están en inglés**: Normal, no hay traducciones aún en el JSON
2. **Solo funciona ES/EN**: Correcto, solo esos dos idiomas implementados
3. **Algunos textos no cambian**: Algunos textos técnicos (nombres AWS) deben quedar en inglés

### ✅ Debe funcionar perfectamente:
1. Toggle de idioma visible en todas las páginas
2. Cambio instantáneo de UI
3. Persistencia después de recargar
4. Navegación mantiene el idioma
5. Todos los botones y textos de interfaz traducidos

---

## 🎯 CHECKLIST RÁPIDO (2 minutos)

- [ ] 1. Abrir http://localhost:5173/
- [ ] 2. Ver toggle de idioma (esquina superior derecha)
- [ ] 3. Click en toggle → textos cambian
- [ ] 4. Click en "Examen Completo"
- [ ] 5. Ver toggle en nueva página
- [ ] 6. Seleccionar Examen 1
- [ ] 7. Responder una pregunta
- [ ] 8. Ver explicación traducida
- [ ] 9. Volver a Home
- [ ] 10. Verificar idioma se mantiene
- [ ] 11. F5 (recargar)
- [ ] 12. Idioma sigue igual

**Si todos estos pasos funcionan → ✅ Sistema 100% operativo**

---

## 📸 CAPTURAS ESPERADAS

### Home en Español:
```
┌─────────────────────────────────────────┐
│  [🌐 ES]                    (toggle)    │
│                                          │
│         🎓 SAA-C03 Exam Simulator       │
│  923 preguntas reales • 14 exámenes...  │
│                                          │
│  [0] Exámenes  [--] Score  [--] % ...   │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ 📖 Examen    │  │ ⚡ Flash      │    │
│  │    Completo  │  │    Study      │    │
│  └──────────────┘  └──────────────┘    │
│  ┌─────────────────────────────────┐   │
│  │ 📊 Mi Progreso                   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Pregunta Respondida en Español:
```
┌─────────────────────────────────────────┐
│  ✅ ¡Correcto! 🎉                        │
│  Tu respuesta: C        ⭐⭐⭐⭐⭐ (5)  │
│                                          │
│  ¿Por qué la opción C es correcta?      │
│  [Explicación en inglés por ahora...]   │
│                                          │
│  Servicios AWS: [Lambda] [S3] [EC2]     │
│                                          │
│  💡 Tip para el examen                   │
│  [Tip en inglés por ahora...]           │
│                                          │
│  Nivel de dificultad: Medio              │
│                                          │
│  [➡️ Siguiente pregunta]                 │
└─────────────────────────────────────────┘
```

---

## 🎉 RESULTADO ESPERADO

Si todo funciona correctamente verás:

✅ **Idioma cambia instantáneamente en todos lados**  
✅ **Se mantiene al navegar entre páginas**  
✅ **Se guarda después de recargar**  
✅ **UI completamente traducida**  
✅ **Preguntas en inglés (normal por ahora)**  
✅ **Sistema fluido y sin errores**

---

## 📞 SI ALGO NO FUNCIONA

### Checklist de Debugging:

1. **Toggle no aparece**:
   - Verifica consola del navegador (F12)
   - Busca errores de React
   - Asegúrate que el servidor esté corriendo

2. **Textos no cambian**:
   - Verifica que el toggle hizo click correctamente
   - Revisa localStorage en DevTools
   - Refresca la página

3. **Errores en consola**:
   - Copia el error exacto
   - Verifica que todos los archivos están en su lugar
   - Asegúrate que no hay errores de importación

4. **Página en blanco**:
   - Revisa consola del navegador
   - Verifica que Vite compiló correctamente
   - Mira el terminal donde corre `npm run dev`

---

**¡Listo para probar! 🚀**

Abre http://localhost:5173/ y sigue el checklist rápido de 2 minutos.
