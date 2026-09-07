# 🚀 Deployment Steps - Vercel

## ✅ Pre-requisitos Completados:
- ✅ Vercel CLI instalado globalmente
- ✅ Build verificado localmente (funciona correctamente)
- ✅ Configuración `vercel.json` creada

---

## 📋 Pasos para Deploy:

### 1. Login a Vercel (si no lo hiciste aún)

Abre este link en tu navegador:
🔗 **https://vercel.com/oauth/device?user_code=PBJJ-TZBW**

O ejecuta:
```bash
cd SimuladorExamenAWS-SolutionsArchitect/app
vercel login
```

---

### 2. Deploy a Producción

```bash
cd SimuladorExamenAWS-SolutionsArchitect/app
vercel --prod
```

Vercel te preguntará:
- **Set up and deploy?** → Yes
- **Which scope?** → Selecciona tu cuenta
- **Link to existing project?** → No
- **What's your project's name?** → `aws-saa-c03-simulator` (o el que prefieras)
- **In which directory is your code located?** → `.` (presiona Enter)
- **Override settings?** → No

---

### 3. ¡Listo!

Vercel te dará una URL como:
```
✅ Production: https://aws-saa-c03-simulator.vercel.app
```

---

## 📱 Acceder desde tu Celular:

1. Abre la URL en el navegador de tu celular
2. **Agregar a pantalla de inicio:**
   - **Android (Chrome):** Menú (3 puntos) → "Agregar a pantalla de inicio"
   - **iOS (Safari):** Compartir → "Agregar a inicio"
3. La app se abre en pantalla completa como app nativa

---

## 🔄 Deployments Futuros:

Cada vez que hagas push a GitHub, Vercel auto-deployará automáticamente.

O manualmente:
```bash
cd SimuladorExamenAWS-SolutionsArchitect/app
vercel --prod
```

---

## 📊 Info del Build:

- **Framework:** Vite + React
- **Output:** `dist/`
- **Tamaño:** ~3.7 MB (incluye 923 preguntas enriquecidas)
- **Tiempo de build:** ~45 segundos

---

## ⚙️ Configuración Aplicada:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Las rewrites aseguran que React Router funcione correctamente en producción.

---

## 🐛 Troubleshooting:

### Error: "Build failed"
```bash
# Verificar build local primero
npm run build
npm run preview  # Prueba local de producción
```

### Error: "Login failed"
- Verifica que completaste el OAuth en el navegador
- Intenta: `vercel logout` y luego `vercel login` de nuevo

### Error: "Large file warning"
- Esto es normal para este proyecto (923 preguntas)
- Vercel soporta hasta 100 MB por deployment

---

## 📈 Siguiente Paso (Opcional):

### Custom Domain:
Si tienes un dominio, puedes agregarlo en:
- Vercel Dashboard → Project → Settings → Domains
- Agregar: `aws-exam.tudominio.com`

---

**Última actualización:** 2026-09-05  
**Vercel CLI version:** 59.11.7  
**Build verificado:** ✅ Exitoso
