# Favicon Yaratish Qo'llanmasi

## Favicon fayllarini yaratish

Loyiha uchun favicon fayllarini yaratish uchun quyidagi qadamlarni bajaring:

### 1. Onlayn Favicon Generator

Quyidagi onlayn xizmatlardan foydalaning:
- https://realfavicongenerator.net/
- https://www.favicon-generator.org/
- https://favicon.io/

### 2. Logo.svg dan Favicon yaratish

1. `public/logo.svg` faylini yuklang
2. Quyidagi formatlarni yaratishingiz kerak:
   - `favicon.ico` (16x16, 32x32, 48x48 o'lchamlarda)
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png` (180x180)
   - `favicon-192x192.png` (Android)
   - `favicon-512x512.png` (Android)

### 3. Fayllarni joylashtirish

Yaratilgan fayllarni `public/` papkasiga joylashtiring:
```
public/
  ├── logo.svg
  ├── favicon.ico
  ├── favicon-16x16.png
  ├── favicon-32x32.png
  ├── apple-touch-icon.png
  ├── favicon-192x192.png
  └── favicon-512x512.png
```

### 4. Tekshirish

Fayllarni yaratgandan so'ng, brauzerda tekshiring:
- Chrome: `chrome://favicon/https://koznuri.novacode.uz/`
- Firefox: Favicon ko'rinishi
- Safari: Apple Touch Icon ko'rinishi

## Eslatma

Hozirgi vaqtda `logo.svg` favicon sifatida ishlatilmoqda. Agar favicon.ico faylini yaratmasangiz, brauzerlar SVG faylni favicon sifatida ko'rsatadi, bu ham ishlaydi.

