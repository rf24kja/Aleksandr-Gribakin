# Portfolio — Aleksandr Gribakin

## Stack
- Vite + Three.js + GSAP (ScrollTrigger)
- State: custom ESM module (superpowers.state.js)
- Scroll config: PONYTALE config (ponytail.config.js)
- API: serverless function at /api/consult
- Email: Resend → RF24KRSK@gmail.com

## Conventions
- All text goes through PONYTALL.LOCALE[lang] — never hardcode display strings.
- FPS < 45 triggers automatic quality reduction via fx:quality custom event.
- Form action: POST /api/consult with JSON { name, email, message, to: "RF24KRSK@gmail.com" }.
- i18n: data-i18n attributes map to PONYTAIL.LOCALE keys.
- Language toggle: button with data-lang-switch.
- Scroll scenes are defined by range [0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1.0].
- SEO: structured data in ld-json, hreflang alternates, canonical URL.
