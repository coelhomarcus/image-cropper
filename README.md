<div align="center">

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://crop.marcuscoelho.com/favicon.ico">
        <img src="https://crop.marcuscoelho.com/favicon.ico" alt="OpenClaw" width="50">
    </picture>
</p>

# Cropin

Ferramenta simples e open-source para recortar imagens e GIFs animados.

Recorte com preview em tempo real, preservando animações de GIF.

<p>
  <img
    src="https://img.shields.io/github/stars/coelhomarcus/image-cropper?style=flat-square"
    alt="GitHub Stars"
  />
  <img
    src="https://img.shields.io/github/last-commit/coelhomarcus/image-cropper?style=flat-square"
    alt="Last commit"
  />
  <img
    src="https://img.shields.io/github/issues/coelhomarcus/image-cropper?style=flat-square"
    alt="Open issues"
  />
</p>

</div>

---

## Features

- Recorte de imagens (PNG, JPG, WebP) direto no browser
- Recorte de **GIFs** animados preservando a animação
- Preview em tempo real
- Download do resultado

## Tech Stack

| Category   | Technology                |
| ---------- | ------------------------- |
| Frontend   | React + Vite + TypeScript |
| Styling    | Tailwind CSS              |
| Backend    | Node.js + Express         |
| GIF Engine | Gifsicle                  |
| Runtime    | Node.js 22                |
| Container  | Docker (multi-stage)      |

## Quick Start

```bash
# Clone
git clone https://github.com/coelhomarcus/image-cropper

# Backend (requer gifsicle instalado)
cd backend
npm install
npm run dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

## Deploy (Docker)

```bash
docker build -t image-cropper .
docker run -p 3002:3002 image-cropper
```

O Express serve tanto a API (`/api/gif/*`) quanto o frontend estático em uma porta só.
