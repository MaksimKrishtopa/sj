# Структура папки /assets/

Все медиа-файлы для проекта kupit-beton-v-zhukovskom хранятся здесь.
Агент-верстальщик читает этот файл чтобы понять что есть, чего нет и как использовать.

---

## Структура папок

```
/assets/
  /logos/           — логотипы компании
  /video/           — видеофоны и промо-видео
  /images/
    /hero/          — главные изображения для hero-секций
    /production/    — фото завода и производства
    /equipment/     — фото миксеров, насосов, техники
    /objects/       — фото построенных объектов (кейсы)
    /team/          — фото команды
    /certificates/  — фото/скан сертификатов
  /icons/           — иконки
  /references/
    /competitors/   — скриншоты конкурентов
    /visual-style/  — визуальные референсы
    /ux-patterns/   — UX-референсы
```

---

## Правила именования файлов

### Логотипы:
```
logo_primary.svg               — основной лого (для светлого фона)
logo_inverse.svg               — инверсный лого (для тёмного фона)
logo_symbol.svg                — только символ/иконка без текста
favicon_32.png                 — 32×32px
favicon_180.png                — 180×180px (Apple touch icon)
```

### Видео:
```
video_hero_bg_01.mp4           — фоновое видео для hero
video_hero_bg_01.webm          — то же в WebM формате
video_promo_01.mp4             — промо-видео (со звуком)
```

### Изображения:
```
hero_main_desktop.webp         — hero-изображение десктоп
hero_main_mobile.webp          — hero-изображение мобильный
img_production_01.webp         — фото производства
img_mixer_01.webp              — фото миксера
img_object_01.webp             — фото объекта
```

### Иконки:
```
icon_delivery.svg              — иконка доставки
icon_quality.svg               — иконка качества
icon_guarantee.svg             — иконка гарантии
icon_calculator.svg            — иконка калькулятора
```

### Референсы:
```
ref_competitor_[домен]_[страница]_desktop.png
ref_style_[описание].png
ref_ux_[описание].png
```

---

## Требования к файлам

### Логотипы:
- Формат: SVG (обязательно) + PNG@2x (запасной)
- Фон: прозрачный
- Минимум: primary + favicon

### Видео (фоновые):
- Форматы: MP4 + WebM (оба обязательны)
- Разрешение: 1920×1080 или 2560×1440
- Длительность: 10–30 секунд, зацикливается
- Звук: отключён
- Размер: до 10 МБ (каждый файл)
- Кодек MP4: H.264, profile Baseline
- Кодек WebM: VP9

### Фотографии:
- Формат: WebP (основной) + JPEG (fallback)
- Hero: минимум 1600×900px, оптимально 2560×1440px
- Карточки/блоки: 800×600px
- Сжатие: WebP quality 80–85%
- Фон: без белых фонов от стоков

### Иконки:
- Формат: SVG (предпочтительно), PNG@2x как fallback
- Стиль: единый (line / filled / outlined — выбрать один)
- Размер viewBox: 24×24 или 32×32

---

## Чеклист для клиента

### Обязательно загрузить до начала верстки:
- [ ] logo_primary.svg
- [ ] favicon_32.png + favicon_180.png
- [ ] Хотя бы 3–5 фото (производство/техника)

### Желательно:
- [ ] logo_inverse.svg
- [ ] video_hero_bg_01.mp4 + .webm
- [ ] 10–15 фото для всех разделов
- [ ] Иконки (если не используем иконочный шрифт)
- [ ] Скриншоты сайтов-референсов

---

## Инструкция по сохранению референсов

Когда делаешь скриншот конкурента или референса:
1. Называй файл по схеме: `ref_competitor_[домен]_[страница]_[устройство].png`
2. Клади в `assets/references/competitors/` (конкуренты) или `assets/references/visual-style/` (стилевые)
3. Делай отдельный скриншот для desktop и mobile
4. Фиксируй URL источника в `design/references-template.md`

Пример:
```
assets/references/competitors/ref_competitor_beton-online_homepage_desktop.png
assets/references/competitors/ref_competitor_beton-online_homepage_mobile.png
assets/references/visual-style/ref_style_dark-industrial_hero.png
```

---

## Статус ассетов (обновляется по мере поступления)

| Папка | Статус | Примечание |
|---|---|---|
| assets/logos/ | Пусто — нужно загрузить | Критично |
| assets/video/ | Пусто — нужно загрузить | Желательно |
| assets/images/hero/ | Пусто — нужно загрузить | Критично |
| assets/images/production/ | Пусто — нужно загрузить | Важно |
| assets/images/equipment/ | Пусто — нужно загрузить | Важно |
| assets/images/objects/ | Пусто — нужно загрузить | Желательно |
| assets/images/team/ | Пусто — нужно загрузить | Опционально |
| assets/images/certificates/ | Пусто — нужно загрузить | Желательно |
| assets/icons/ | Пусто — нужно загрузить | Зависит от стека |
| assets/references/ | Пусто — нужно загрузить | Перед вёрсткой |
