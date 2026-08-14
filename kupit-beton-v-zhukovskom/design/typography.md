---
project: kupit-beton-v-zhukovskom
status: draft
font: Gilroy (референс vsemanipulyatory.ru)
---

# Типографика — Gilroy (референс vsemanipulyatory.ru)

Шрифт как на референсе — **Gilroy**. Self-host файлов в `assets/fonts/` (5 начертаний).

## Стек
`font-family: 'Gilroy', -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;`

## Начертания
- Gilroy Regular — 400 (основной текст, навигация)
- Gilroy Medium — 500 (подзаголовки, подписи)
- Gilroy SemiBold — 600 (акцентные подзаголовки, цены)
- Gilroy Bold — 700 (H1–H3, кнопки)
- Gilroy Bold Italic — акцентные вставки

## Размеры (десктоп — с референса)
| Элемент | Размер | Начертание | Line-height |
|---|---|---|---|
| H1 | 32px | Bold 700 | 1.2 |
| H2 | 24px | Bold 700 | 1.25 |
| H3 | 18px | Bold 700 | 1.3 |
| Body | 16px | Regular 400 | 1.55 |
| Кнопки | 14px | Bold 700 | 1 |
| Подписи/meta | 13–14px | Medium 500 | 1.4 |

## Адаптив (мобайл)
H1 24–26px, H2 20px, H3 17px, Body 15–16px. Заголовки не переносить в 3+ строк на первом экране.

## @font-face — источник для self-host
База: `https://vsemanipulyatory.ru/wp-content/themes/manipulators/assets/fonts/`
Файлы: GilroyRegular/GilroyRegular.woff, GilroyMedium/..., GilroySemiBold/..., GilroyBold/..., GilroyBoldItalic/... (есть .woff и .ttf).

## Лицензия — важно
Gilroy — **коммерческий (платный) шрифт**. Для легального self-host нужна лицензия. Если её нет — бесплатный геометрический аналог **Manrope** (Google Fonts, визуально очень близок к Gilroy), тот же стек и размеры.
