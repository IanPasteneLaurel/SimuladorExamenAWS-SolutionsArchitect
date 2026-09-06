# 🚀 Deployment Guide - SAA-C03 Simulator

Esta guía cubre el proceso completo de deployment del simulador a producción usando Vercel.

## 📋 Pre-requisitos

Antes de deployar, asegúrate de tener:

- [x] Cuenta de GitHub activa
- [x] Cuenta de Vercel (gratis: https://vercel.com/signup)
- [x] Node.js >= 18.0.0 instalado localmente
- [x] Git configurado

## 🎯 Método 1: Deploy Automático con Vercel (Recomendado)

### Paso 1: Preparar el Repositorio

1. **Crear repositorio en GitHub** (si aún no existe)

```bash
# En la raíz del proyecto
git init
git add .
git commit -m "Initial commit: SAA-C03 Simulator ready for deployment"
git branch -M main
git remote add origin https://github.com/tu-usuario/SimuladorExamenAWS-SolutionsArchitect.git
git push -u origin main
```

2. **Verificar que los archivos críticos están incluidos**

```bash
git status
# Asegúrate de que estos archivos están commiteados:
# - vercel.json
# - app/package.json
# - app/src/
# - app/public/
# - README.md
```

### Paso 2: Conectar con Vercel

1. **Ir a Vercel Dashboard**
   - Visita https://vercel.com/dashboard
   - Click en "Add New..." → "Project"

2. **Importar desde GitHub**
   - Conecta tu cuenta de GitHub si no lo has hecho
   - Busca y selecciona: `SimuladorExamenAWS-SolutionsArchitect`
   - Click en "Import"

3. **Configurar el Proyecto**

   Vercel detectará automáticamente la configuración de `vercel.json`, pero verifica:

   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: cd app && npm install && npm run build
   Output Directory: app/dist
   Install Command: cd app && npm install
   ```

4. **Variables de Entorno** (Opcional)

   En la sección "Environment Variables", agrega:
   ```
   VITE_APP_NAME=SAA-C03 Exam Simulator
   VITE_APP_VERSION=1.0.0
   ```

5. **Deploy**
   - Click en "Deploy"
   - Espera 2-3 minutos
   - ¡Listo! 🎉

### Paso 3: Verificar el Deployment

Una vez completado, Vercel te dará:

- **Production URL**: `https://saa-c03-simulator.vercel.app`
- **Preview URLs**: Para cada commit en branches

Verifica:
- [ ] Página home carga correctamente
- [ ] Puedes seleccionar un examen
- [ ] Timer funciona
- [ ] Preguntas se muestran
- [ ] Progress se guarda en LocalStorage
- [ ] Responsive en móvil

## 🎯 Método 2: Deploy Manual con Vercel CLI

### Instalar Vercel CLI

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Deploy a Preview

```bash
# Desde la raíz del proyecto
vercel
```

Esto creará un deployment de preview. Sigue las prompts:
- Set up and deploy? **Y**
- Which scope? (elige tu cuenta)
- Link to existing project? **N** (primera vez)
- Project name: `saa-c03-simulator`
- In which directory is your code located? `./`

### Deploy a Production

```bash
vercel --prod
```

## 🌐 Configuración de Dominio Personalizado

### Opción A: Dominio de Vercel (Gratis)

Tu app estará disponible en:
```
https://saa-c03-simulator.vercel.app
```

### Opción B: Dominio Propio

1. **En Vercel Dashboard**
   - Ve a tu proyecto
   - Settings → Domains
   - Add Domain

2. **Configurar DNS**
   
   En tu proveedor de dominio, agrega:
   
   ```
   Type: CNAME
   Name: www (o @)
   Value: cname.vercel-dns.com
   ```

3. **Esperar propagación DNS** (5-60 minutos)

4. **Verificar**
   ```bash
   nslookup tu-dominio.com
   ```

## 🔄 CI/CD Automático

Una vez conectado con GitHub, cada push activa:

### Push a `main` branch
- ✅ Build automático
- ✅ Deploy a producción
- ✅ URL actualizada: `https://saa-c03-simulator.vercel.app`

### Push a otras branches (ej: `develop`, `feature/xyz`)
- ✅ Build automático
- ✅ Deploy a preview URL única
- ✅ URL: `https://saa-c03-simulator-git-branch-name.vercel.app`

### Pull Requests
- ✅ Build automático
- ✅ Preview deployment
- ✅ Comentario automático en el PR con la URL

## 📊 Monitoreo Post-Deployment

### Vercel Analytics (Gratis)

Habilita analytics en:
- Vercel Dashboard → Tu Proyecto → Analytics
- Obtendrás métricas de:
  - Page views
  - Unique visitors
  - Top pages
  - Performance (Core Web Vitals)

### Logs y Debugging

Ver logs en tiempo real:
```bash
vercel logs [deployment-url]
```

En Vercel Dashboard:
- Deployments → [Selecciona deployment] → Logs

## 🐛 Troubleshooting

### Error: "Build failed"

**Causa común**: Dependencias no instaladas o error de build

**Solución**:
```bash
# Probar build localmente
cd app
npm install
npm run build

# Si funciona, hacer commit y push
git add .
git commit -m "Fix build configuration"
git push
```

### Error: "404 on page refresh"

**Causa**: Falta configuración de rewrites para SPA

**Solución**: Ya está incluido en `vercel.json`:
```json
"rewrites": [
  { "source": "/(.*)", "destination": "/index.html" }
]
```

### Error: "Functions not found"

**Causa**: No necesitamos funciones serverless para este proyecto

**Solución**: Ignorar, el proyecto es 100% estático

### Build muy lento

**Causa**: Bundle de 3.7MB de preguntas

**Optimización futura**:
- Implementar code splitting
- Lazy loading de exámenes
- Comprimir JSON

**Por ahora**: Es aceptable (build ~90 segundos)

## 🔒 Configuración de Seguridad

Ya incluido en `vercel.json`:

```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "X-XSS-Protection", "value": "1; mode=block" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
    ]
  }
]
```

### SSL/HTTPS

- ✅ **Automático** en Vercel (Let's Encrypt)
- ✅ Forzado por defecto
- ✅ HTTP → HTTPS redirect automático

## 📈 Optimizaciones de Performance

### Caching

Assets cacheados por 1 año:
```json
"headers": [
  {
    "source": "/assets/(.*)",
    "headers": [
      { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
    ]
  }
]
```

### Compresión

- ✅ Gzip automático (Vercel)
- ✅ Brotli automático (Vercel)

### CDN

- ✅ Global CDN de Vercel
- ✅ Edge caching
- ✅ Región primaria: `iad1` (US East)

## 🔄 Actualizar Deployment

### Método 1: Push a GitHub (Automático)

```bash
git add .
git commit -m "Update: new features"
git push origin main
```

Vercel detecta y deploya automáticamente.

### Método 2: Redeploy Manual

En Vercel Dashboard:
- Deployments → [Último deployment] → ⋯ → Redeploy

### Método 3: CLI

```bash
vercel --prod
```

## 📱 Testing en Diferentes Dispositivos

### Vercel Preview URLs

Cada PR genera una URL de preview:
```
https://saa-c03-simulator-git-feature-abc.vercel.app
```

Comparte esta URL para testing en:
- 📱 iPhone/iPad
- 🤖 Android
- 💻 Desktop (Chrome, Firefox, Safari)
- 🖥️ Tablet

### Browser Testing

Prueba en:
- ✅ Chrome (últimas 2 versiones)
- ✅ Firefox (últimas 2 versiones)
- ✅ Safari (últimas 2 versiones)
- ✅ Edge (últimas 2 versiones)

## 📊 Métricas de Éxito

Después del deployment, verifica:

| Métrica | Target | Herramienta |
|---------|--------|-------------|
| First Contentful Paint | < 1.8s | Lighthouse |
| Speed Index | < 3.4s | Lighthouse |
| Time to Interactive | < 3.9s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Performance Score | > 90 | Lighthouse |
| SEO Score | > 95 | Lighthouse |

### Ejecutar Lighthouse

```bash
# Chrome DevTools
1. F12 → Lighthouse tab
2. Generate report

# CLI
npm install -g lighthouse
lighthouse https://saa-c03-simulator.vercel.app
```

## 🎯 Checklist Final de Deployment

- [ ] ✅ Build local exitoso
- [ ] ✅ Tests manuales pasados
- [ ] ✅ Commit y push a GitHub
- [ ] ✅ Vercel conectado
- [ ] ✅ Deployment exitoso
- [ ] ✅ URL de producción accesible
- [ ] ✅ Todas las páginas funcionan
- [ ] ✅ Timer funciona correctamente
- [ ] ✅ LocalStorage persiste datos
- [ ] ✅ Responsive en móvil
- [ ] ✅ SSL activo (HTTPS)
- [ ] ✅ Performance score > 90
- [ ] ✅ No hay errores en consola

## 🆘 Soporte

Si encuentras problemas:

1. **Documentación Oficial**
   - Vercel Docs: https://vercel.com/docs
   - Vite Deployment: https://vitejs.dev/guide/static-deploy.html

2. **Comunidad**
   - Vercel Discord: https://vercel.com/discord
   - GitHub Issues: [tu-repo]/issues

3. **Contacto Directo**
   - Email: ian@ianlaurelpastene.com

## 📅 Mantenimiento

### Actualizaciones Recomendadas

- **Semanal**: Verificar métricas de Vercel
- **Mensual**: Actualizar dependencias (`npm update`)
- **Trimestral**: Revisar vulnerabilidades de seguridad

### Backup

El código está en GitHub, pero considera:
- Exportar analytics periódicamente
- Documentar cambios de configuración
- Mantener `.env.example` actualizado

---

## 🎉 ¡Deployment Exitoso!

Tu simulador SAA-C03 está ahora en producción y disponible globalmente.

**URLs importantes:**
- Production: `https://saa-c03-simulator.vercel.app`
- Dashboard: `https://vercel.com/dashboard`
- Repository: `https://github.com/tu-usuario/SimuladorExamenAWS-SolutionsArchitect`

**Próximos pasos:**
1. Compartir la URL con usuarios de prueba
2. Recolectar feedback
3. Iterar y mejorar
4. ¡Ayudar a otros a pasar SAA-C03! 🚀

---

*Última actualización: Enero 2025*
