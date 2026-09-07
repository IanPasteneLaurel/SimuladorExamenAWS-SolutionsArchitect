# ⚡ Quick Deploy - 5 Minutos para Acceso desde Celular

## 🚀 Opción más rápida: Vercel (Recomendada)

### Paso 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Paso 2: Deploy desde la carpeta del app
```bash
cd SimuladorExamenAWS-SolutionsArchitect/app
vercel
```

### Paso 3: Seguir prompts
- Login con GitHub
- Confirmar configuración del proyecto
- Esperar ~30 segundos

### Paso 4: ¡Listo!
```
✅ Deployment complete!
🔗 URL: https://aws-simulator-xxx.vercel.app
```

Abre esa URL en tu celular y agrega a la pantalla de inicio.

---

## 📱 Alternativa: Acceso Local (Red WiFi)

Si solo quieres probar rápido en tu celular sin deployment:

```bash
cd SimuladorExamenAWS-SolutionsArchitect/app
npm run dev -- --host
```

Abre la URL "Network" que aparece en tu celular (ejemplo: `http://192.168.1.5:5173`)

**Nota:** Tu PC debe estar encendida y en la misma red WiFi.

---

## 🔧 Si hay problemas con el build

```bash
# 1. Instalar dependencias
cd SimuladorExamenAWS-SolutionsArchitect/app
npm install

# 2. Probar build local
npm run build

# 3. Si funciona, hacer deploy
vercel --prod
```

---

## 📚 Más info

Ver `ROADMAP-TO-PRODUCTION.md` para opciones detalladas y configuraciones avanzadas.
