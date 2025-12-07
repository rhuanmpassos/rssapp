# RSS Aggregator - Mobile App

App mobile em React Native + Expo para agregador de notícias RSS e vídeos do YouTube.

## 📱 Features

- 🎨 **Tema claro/escuro** - Alterna automaticamente ou manualmente
- 🔐 **Autenticação** - Login e registro com JWT
- 📰 **Feed de notícias** - Agregador de RSS de múltiplos sites
- 📺 **Vídeos YouTube** - Lista de vídeos dos canais inscritos
- 🔔 **Push notifications** - Alertas de novos conteúdos
- ⚡ **Performance** - Animações suaves e carregamento otimizado

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) ou Android Emulator

### Instalação

```bash
cd mobile

# Instalar dependências
npm install

# Iniciar o app
npx expo start
```

### Executando

- **iOS Simulator**: Pressione `i` no terminal
- **Android Emulator**: Pressione `a` no terminal
- **Dispositivo físico**: Escaneie o QR code com Expo Go

## 📁 Estrutura do Projeto

```
mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/             # Telas de autenticação
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/             # Tab navigation
│   │   ├── index.tsx       # Feed RSS
│   │   ├── youtube.tsx     # Vídeos YouTube
│   │   └── settings.tsx    # Configurações
│   ├── add-subscription.tsx
│   ├── index.tsx           # Entry point
│   └── _layout.tsx         # Root layout
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   ├── ui/             # UI primitivos (Button, Input, Card)
│   │   ├── FeedCard.tsx
│   │   ├── VideoCard.tsx
│   │   └── EmptyState.tsx
│   ├── contexts/           # React Context
│   │   └── ThemeContext.tsx
│   ├── services/           # API e serviços
│   │   ├── api.ts
│   │   └── notifications.ts
│   ├── store/              # Zustand stores
│   │   ├── authStore.ts
│   │   ├── feedStore.ts
│   │   └── youtubeStore.ts
│   └── theme/              # Sistema de temas
│       ├── colors.ts
│       ├── spacing.ts
│       └── typography.ts
└── assets/                 # Imagens e ícones
```

## 🎨 Sistema de Temas

O app suporta 3 modos de tema:

- **Sistema**: Segue as configurações do dispositivo
- **Claro**: Tema light
- **Escuro**: Tema dark

### Cores principais

| Cor | Light | Dark |
|-----|-------|------|
| Primary | #4F46E5 | #6366F1 |
| Secondary | #10B981 | #34D399 |
| Background | #FFFFFF | #020617 |
| Text | #0F172A | #F8FAFC |

## 📡 API Integration

Configure a URL da API no arquivo `src/services/api.ts` ou via variável de ambiente:

```typescript
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

Para produção, configure no `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://sua-api.onrender.com/api/v1"
    }
  }
}
```

## 🔔 Push Notifications

O app usa Expo Notifications para receber alertas de:
- Novos artigos nos feeds RSS
- Novos vídeos nos canais YouTube

### Configuração

1. Obtenha um Expo Push Token no setup inicial
2. O token é automaticamente registrado no backend
3. Configure o `EXPO_ACCESS_TOKEN` no backend

## 🛠️ Build & Deploy

### Development build

```bash
npx expo prebuild
npx expo run:ios
npx expo run:android
```

### Production build (EAS)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Build
eas build --platform all
```

## 📋 Telas

### Login/Register
- Email e senha
- Validação de formulário
- Feedback visual de loading

### Feed (Home)
- Lista de artigos dos sites inscritos
- Pull-to-refresh
- Abre artigos no browser in-app

### YouTube
- Lista de vídeos dos canais inscritos
- Thumbnail, título, duração
- Abre vídeos no YouTube

### Configurações
- Toggle modo escuro
- Gerenciar assinaturas
- Logout

### Adicionar Subscription
- Modal para adicionar site ou canal
- Detecção automática de RSS
- Busca de canal por nome/@handle

## ⚙️ Requisitos de Ambiente

```env
# API (opcional - default: localhost:3000)
API_URL=https://sua-api.onrender.com/api/v1
```

## 📄 Licença

MIT



