# 🔑 Keywords Implementation - SAA-C03 Question Bank

## Objetivo
Agregar **palabras clave (keywords)** a cada pregunta para ayudar a los estudiantes a identificar rápidamente la solución correcta en el examen AWS SAA-C03.

## Problema Identificado
- El usuario no veía ningún detalle sobre palabras clave durante el test
- Las preguntas no tenían un campo `keywords` en el JSON
- El componente `ExplanationView.jsx` no mostraba keywords

## Solución Implementada

### 1. Extracción Automática de Keywords
Script `add-keywords.js` que detecta 12 tipos de keywords:

| Tipo | Ejemplos | Apariciones |
|------|----------|-------------|
| **security** | encryption, least privilege, private | 281 |
| **pattern** | event-driven, message queue, caching | 167 |
| **data_volume** | terabytes, petabytes, gigabytes | 160 |
| **time_constraint** | 30 minutes, 24 hours, 10 years | 155 |
| **optimization** | most cost-effective, minimize cost | 144 |
| **operational** | least overhead, serverless, managed | 142 |
| **performance** | low latency, auto-scaling, millions | 105 |
| **resilience** | highly available, multi-AZ, fault-tolerant | 95 |
| **constraint** | unpredictable, cannot modify, immediate | 67 |
| **latency** | real-time, immediately, instant | 44 |
| **schedule** | daily, weekly, monthly | 32 |
| **data_type** | relational, NoSQL, time-series | 21 |

### 2. Actualización del Componente UI
`ExplanationView.jsx` ahora muestra:
- Sección destacada de **🔑 Palabras Clave** al inicio de la explicación
- Badges con colores según tipo de keyword
- Tooltip con el tipo de cada keyword
- Mensaje educativo sobre su uso en el examen

### 3. Cobertura de Keywords

```
✅ Con keywords: 769/923 (83.3%)
❌ Sin keywords: 154/923 (16.7%)
📈 Promedio: 1.84 keywords por pregunta
```

## Ejemplos de Keywords Extraídas

### Q36 - Cost-Optimized Architectures
**Keywords:**
- [optimization] most cost-effective
- [time_constraint] 30 minutes
- [time_constraint] 20 seconds
- [data_volume] terabytes

### Q200 - High-Performing Architectures
**Keywords:**
- [operational] least operational overhead
- [operational] serverless
- [pattern] message queue

### Q500 - Cost-Optimized Architectures
**Keywords:**
- [optimization] most cost-effective
- [time_constraint] 10 years
- [data_volume] petabytes
- [data_volume] gigabytes

## Colores de Keywords en UI

| Tipo | Color |
|------|-------|
| optimization | Verde (green) |
| operational | Azul (blue) |
| time_constraint | Púrpura (purple) |
| latency | Rosa (pink) |
| schedule | Índigo (indigo) |
| resilience | Naranja (orange) |
| security | Rojo (red) |
| performance | Cian (cyan) |
| data_volume | Teal |
| data_type | Esmeralda (emerald) |
| pattern | Violeta (violet) |
| constraint | Gris (gray) |

## Beneficios para el Estudiante

1. **Identificación Rápida**: Las keywords destacan los requisitos críticos de cada pregunta
2. **Eliminación de Opciones**: Ayuda a descartar respuestas incorrectas en <30 segundos
3. **Aprendizaje de Patrones**: Reconocer keywords comunes del examen SAA-C03
4. **Mejor Comprensión**: Entender qué busca AWS en cada dominio arquitectónico

## Scripts Disponibles

- `add-keywords.js` - Extrae y agrega keywords a todas las preguntas
- `verify-keywords.js` - Verifica cobertura y estadísticas
- `analyze-missing-keywords.js` - Analiza preguntas sin keywords

## Próximos Pasos Sugeridos

1. Mejorar extracción para cubrir el 16.7% restante sin keywords
2. Agregar más patrones específicos por dominio
3. Permitir al usuario practicar "identificación de keywords" como modo de estudio
4. Crear filtros por tipo de keyword para práctica dirigida

---

**Fecha**: 2026-09-05  
**Estado**: ✅ Implementado (83.3% cobertura)
