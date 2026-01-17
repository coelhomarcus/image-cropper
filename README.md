# Image Crop

Ferramenta simples para recortar imagens e GIFs animados.

## Estrutura do Projeto

Este repositório contém dois projetos independentes:

```
Crop/
├── frontend/    # Interface web (React + Vite)
└── backend/     # API de processamento de GIFs (Node.js + Express)
```

### [frontend](./frontend)

Interface web para upload e recorte de imagens e GIFs.

- **Tecnologias**: React, Vite, TypeScript, Tailwind CSS
- **Porta**: 80

### [backend](./backend)

API para processamento e recorte de GIFs animados usando Gifsicle.

- **Tecnologias**: Node.js, Express, TypeScript, Gifsicle
- **Porta**: 3001

## Deploy no Dokploy

Cada projeto deve ser deployado como uma **Application** separada:

### 1. Deploy do Backend

1. Crie uma nova Application no Dokploy
2. Aponte para o repositório com **Build Path**: `/backend`
3. Configure:
   - **Container Port**: `3001`
   - **Environment Variables**: `PORT=3001`, `NODE_ENV=production`
4. Gere um domínio (ex: `api.seudominio.com`)
5. Deploy

### 2. Deploy do Frontend

1. Crie uma nova Application no Dokploy
2. Aponte para o repositório com **Build Path**: `/frontend`
3. Configure:
   - **Container Port**: `80`
   - **Build Args**: `VITE_API_URL=https://api.seudominio.com` (URL do backend)
4. Gere um domínio (ex: `crop.seudominio.com`)
5. Deploy

## Desenvolvimento Local

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Crie um .env.local com:
# VITE_API_URL=http://localhost:3001

npm run dev
```

## Funcionalidades

- ✅ Recorte de imagens (PNG, JPG, WebP)
- ✅ Recorte de GIFs animados (preserva animação)
- ✅ Preview em tempo real
- ✅ Download do resultado
