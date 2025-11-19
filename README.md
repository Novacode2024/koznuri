# Ko'z Nuri - Eye Care Medical Center

A modern, multilingual eye care medical center website built with React, TypeScript, and Tailwind CSS.

## 🎯 Features

- **Multilingual Support**: Supports 7 languages (Uzbek, Russian, English, Tajik, Kyrgyz, Kazakh, and others)
- **Responsive Design**: Beautiful UI that works on all devices
- **Doctors Section**: Browse and book appointments with qualified doctors
- **Services**: Comprehensive eye care services information
- **News & Updates**: Latest news and updates from the clinic
- **Media Gallery**: Photo gallery of the clinic
- **Technologies**: Modern medical equipment showcase
- **Online Appointments**: Book appointments online

## 🚀 Tech Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API with React Query
- **Routing**: React Router v7
- **Internationalization**: i18next
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Build Tool**: Vite

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "Ko'z"
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://koznuri.novacode.uz/api
VITE_API_KEY=your_api_key_here
VITE_API_TIMEOUT=10000
VITE_API_RETRY_ATTEMPTS=3
VITE_NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
src/
├── assets/          # Static assets (images, icons)
├── components/      # React components
│   ├── HomeComponents/  # Home page components
│   ├── AllHeader.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   └── ...
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization
│   └── locales/     # Translation files
├── pages/           # Page components
├── services/        # API service functions
├── context/         # Context providers
├── layout/          # Layout components
└── config/          # Configuration files
```

## 🌍 Available Languages

1. Uzbek (Cyrillic) - `uz-cyrillic`
2. Uzbek (Latin) - `uz-latin`
3. Russian - `ru`
4. English - `en`
5. Tajik - `tj`
6. Kazakh - `kz`
7. Kyrgyz - `ky`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features

- Modern and responsive UI design
- Fast page loads with Vite
- SEO-friendly
- Accessible components
- Error boundaries for better UX
- Loading states and spinners
- Optimized images
- Clean code architecture

## 🔧 Configuration

### API Configuration

The app connects to the backend API configured in `src/config/env.ts`. You can set the following environment variables:

- `VITE_API_BASE_URL`: API base URL
- `VITE_API_KEY`: API key for authentication
- `VITE_API_TIMEOUT`: Request timeout in milliseconds
- `VITE_API_RETRY_ATTEMPTS`: Number of retry attempts

### Adding New Translations

To add translations for a new language:

1. Create a new JSON file in `src/i18n/locales/`
2. Add the language to the i18n configuration in `src/i18n/index.ts`
3. Use the translation keys in your components with `useTranslation()`

## 📄 License

Copyright © 2024 Ko'z Nuri - All rights reserved.

## 👥 Contributors

- Development Team

## 📞 Contact

For more information about the Ko'z Nuri clinic, please visit the website or contact us directly.
# koznuri
