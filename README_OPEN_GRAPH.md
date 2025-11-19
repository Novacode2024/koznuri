# Open Graph Rasm Yaratish Qo'llanmasi

## Muammo

Hozirgi vaqtda sayt linkini Facebook, LinkedIn, Telegram, WhatsApp va boshqa platformalarda ulashganda, sayt haqida ma'lumot to'liq ko'rinishi kerak. Buning uchun Open Graph meta taglar sozlangan, lekin **rasm SVG formatida** bo'lib, ba'zi platformalar (masalan, Facebook, LinkedIn) SVG formatini to'liq qo'llab-quvvatlamaydi.

## Yechim

Open Graph rasmi uchun **PNG yoki JPG formatida**, kamida **1200x630 piksel** o'lchamda rasm yaratish kerak.

## Qanday yaratish kerak?

### 1. Rasm o'lchami va formatlari

- **O'lcham**: 1200x630 piksel (1.91:1 nisbat)
- **Format**: PNG yoki JPG
- **Hajm**: 1MB dan kamroq (optimallashtirilgan)
- **Mazmuni**: Logo, klinika nomi, qisqa ma'lumot

### 2. Onlayn vositalar

Quyidagi onlayn vositalardan foydalaning:

- **Canva**: https://www.canva.com/
  - Template: "Social Media Post" (1200x630)
  - Logo qo'shing
  - Text qo'shing: "Ko'z Nuri - O'zbekistondagi Yetakchi Ko'z Tibbiy Markazi"
  - Export qiling: PNG formatida

- **Figma**: https://www.figma.com/
  - Frame: 1200x630
  - Logo va text qo'shing
  - Export qiling: PNG formatida

- **Photoshop** yoki boshqa grafik dasturlar

### 3. Rasm mazmuni

Rasmda quyidagilar bo'lishi kerak:

1. **Logo**: Ko'z Nuri logosi
2. **Title**: "Ko'z Nuri - O'zbekistondagi Yetakchi Ko'z Tibbiy Markazi"
3. **Description**: "O'zbekistondagi eng zamonaviy ko'z tibbiy xizmatlari"
4. **Contact**: "+998 55 514 03 33" (ixtiyoriy)
5. **Background**: Toza, professional rang

### 4. Faylni joylashtirish

Yaratilgan rasmini `public/` papkasiga joylashtiring:

```
public/
  ├── logo.svg
  ├── og-image.png  (yangi fayl)
  └── ...
```

### 5. index.html ni yangilash

`index.html` faylida quyidagi qatorlarni yangilang:

```html
<!-- Eski (SVG) -->
<meta property="og:image" content="https://koznuri.novacode.uz/logo.svg" />
<meta property="og:image:type" content="image/svg+xml" />

<!-- Yangi (PNG) -->
<meta property="og:image" content="https://koznuri.novacode.uz/og-image.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:secure_url" content="https://koznuri.novacode.uz/og-image.png" />
```

Shuningdek, Twitter Card uchun ham:

```html
<meta name="twitter:image" content="https://koznuri.novacode.uz/og-image.png" />
```

### 6. Tekshirish

Rasmni yaratgandan va joylashtirgandan so'ng, quyidagi vositalar bilan tekshiring:

- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
- **Open Graph Preview**: https://www.opengraph.xyz/

## Eslatma

Hozirgi vaqtda SVG rasmi ishlatilmoqda. Agar PNG rasmini yaratmasangiz, ba'zi platformalarda rasm ko'rinmasligi mumkin. PNG rasmini yaratish **tavsiya etiladi**.

## Qo'shimcha ma'lumot

- Open Graph protokoli: https://ogp.me/
- Twitter Cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
- LinkedIn Sharing: https://www.linkedin.com/help/linkedin/answer/46687

