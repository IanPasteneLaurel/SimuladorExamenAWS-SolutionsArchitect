# 🚀 Quick Start - SAA-C03 Simulator

**¿Quieres el simulador funcionando en 5 minutos? Sigue estos pasos:**

---

## ⚡ Inicio Rápido (Local)

```bash
# 1. Clonar (si viene de GitHub)
git clone https://github.com/tu-usuario/SimuladorExamenAWS-SolutionsArchitect.git
cd SimuladorExamenAWS-SolutionsArchitect

# 2. Instalar dependencias
cd app
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:5173
```

**¡Listo!** El simulador debería estar corriendo.

---

## 🌐 Deploy a Producción (Vercel)

### Opción A: GitHub → Vercel (Automático) ⭐ Recomendado

1. **Subir a GitHub** (si no está ya)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/SimuladorExamenAWS-SolutionsArchitect.git
   git push -u origin main
   ```

2. **Conectar con Vercel**
   - Ve a https://vercel.com/new
   - "Import Git Repository"
   - Selecciona tu repo
   - Click "Deploy"
   - ¡Listo en 2-3 minutos!

### Opción B: Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

---

## 📋 Verificación Post-Deploy

Visita tu URL (ej: `https://tu-proyecto.vercel.app`) y verifica:

- [ ] ✅ Página home carga
- [ ] ✅ Puedes seleccionar un examen
- [ ] ✅ Timer funciona (132 minutos)
- [ ] ✅ Preguntas se muestran correctamente
- [ ] ✅ Puedes responder y ver explicaciones
- [ ] ✅ Progress se guarda (F12 → Application → LocalStorage)
- [ ] ✅ Funciona en móvil

---

## 🐛 ¿Algo no funciona?

### Error: "npm install failed"
```bash
# Limpiar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Error: "Build failed en Vercel"
Verifica:
1. `vercel.json` está en la raíz
2. `app/package.json` tiene todas las dependencias
3. No hay archivos faltantes en el commit

### Error: "404 on refresh en Vercel"
Ya está resuelto en `vercel.json` con rewrites. Si persiste:
```json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

---

## 📚 Documentación Completa

Para más detalles, consulta:

- **README.md** - Guía completa del proyecto
- **DEPLOYMENT.md** - Guía exhaustiva de deployment
- **docs/TESTING.md** - 16 casos de test manual
- **SECURITY.md** - Política de seguridad
- **STATUS.md** - Estado actual del proyecto

---

## 🎯 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Servidor local en http://localhost:5173

# Build
npm run build        # Genera dist/ para producción
npm run preview      # Preview del build

# Validación
node scripts/validate-questions.js  # Valida las 923 preguntas

# Linting
npm run lint         # Ejecuta ESLint
```

---

## 🆘 Ayuda Rápida

**¿Preguntas?**
- 📧 Email: ian@ianlaurelpastene.com
- 📖 Docs: Ver archivos en `/docs`
- 🐛 Issues: GitHub Issues

---

## ✨ Features Disponibles

- ✅ **923 preguntas reales** del SAA-C03
- ✅ **14 exámenes completos** (66 preguntas c/u)
- ✅ **Timer de 132 minutos** (pausable)
- ✅ **Explicaciones detalladas** para cada pregunta
- ✅ **Modo Flash Study** (10, 20, 30 preguntas)
- ✅ **Progress tracking** con gráficos
- ✅ **Score predictor** real
- ✅ **100% offline-first**
- ✅ **Responsive** (móvil, tablet, desktop)

---

## 🎓 ¡Listo para estudiar!

El simulador está completamente funcional. Ahora solo queda:

1. **Hacer testing** (ver `docs/TESTING.md`)
2. **Compartir con usuarios** de prueba
3. **Recolectar feedback** y mejorar
4. **¡Ayudar a la gente a pasar SAA-C03!** 🚀

---

*Happy coding! 💻*
