# Techno Office Supplies - Sistema de Catálogo Dinámico

Sistema de gestión de catálogo de productos con Next.js 14, TypeScript, shadcn/ui, GSAP y Firebase.

## Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui
- **Animaciones:** GSAP
- **Backend:** Firebase (Firestore + Storage + Auth)
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod

## Instalación

```bash
npm install
```

## Configuración

1. Copia .env.example a .env.local
2. Agrega tus credenciales de Firebase
3. Ejecuta el proyecto:

```bash
npm run dev
```

##  Estructura del Proyecto

Ver ARCHITECTURE.md para detalles completos de la arquitectura.

##  Componentes

Este proyecto usa shadcn/ui. Para agregar componentes:

```bash
npx shadcn-ui@latest add button
```

##  Scripts Disponibles

- 
pm run dev - Servidor de desarrollo
- 
pm run build - Build de producción
- 
pm run start - Servidor de producción
- 
pm run lint - Linter

##  Variables de Entorno

Ver .env.example para la lista completa de variables requeridas.

##  Licencia

Proyecto académico - CEUTEC 2026
