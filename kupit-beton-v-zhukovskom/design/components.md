---
project: kupit-beton-v-zhukovskom
status: draft
---

# UI-компоненты

Компоненты системы блоков C1–C8 + дополнительные UI-элементы.

## C1 — Шапка (Header)

**Состав:** Лого | Навигация | Телефон + «Работаем сейчас» | Кнопка «Позвонить»
**Поведение:** sticky, белый фон + тень при скролле
**Mobile:** бургер-меню, телефон кликабелен tel:

```
[Лого]  [Бетон][Раствор][Доставка][О заводе][Блог]   +7(499)111-72-62  [Позвонить]
                                                        🟢 Работаем до 22:00
```

Красная кнопка: border-radius 8px, padding 12px 24px, Montserrat 600

## C2 — Короткая форма

**Состав:** 3 поля + кнопка
- Поле 1: «Марка бетона» (select)
- Поле 2: «Объём, м³» (number)
- Поле 3: «Ваш телефон» (tel)
- Кнопка: «Рассчитать стоимость» (красная)

**Применение:** после hero, в sticky-баре на марочных страницах

## C3 — Полная форма заказа

**Поля:** Имя | Телефон | Марка | Объём | Адрес | Дата доставки | Комментарий
**Кнопка:** «Оформить заявку»
**Вид:** или модалка, или отдельная секция с тёмным фоном (#1A1A2E)

## C4 — Калькулятор

**Логика:** Пользователь вводит размеры (длина × ширина × высота) → получает объём → выбирает марку → видит цену
**Интерактив:** JS без перезагрузки
**Вид:** белая карточка с рамкой, заголовок «Рассчитать объём и стоимость»

## C6 — 4 гарантии

**Шаблон:** 4 карточки горизонтально (desktop) / стек (mobile)
**Каждая карточка:** иконка (акцент) + заголовок + 1–2 строки текста
**Примеры гарантий:**
1. Паспорт качества — на каждую партию
2. GPS-миксеры — знаете где машина
3. Ожидание 60 мин — бесплатно
4. Точный объём — акт при выгрузке

## C8 — Подвал (Footer)

**Фон:** #1A1A2E
**Колонки:** Лого + описание | Продукция | Доставка | О компании | Контакты
**Низ:** © 2003–2025 | ИНН 5003088122 | Политика конфиденциальности

---

## Дополнительные компоненты

### Pill-выбор марки (как vossmes)
```html
<div class="grade-picker">
  <button class="grade-btn active" data-grade="M200">М200</button>
  <button class="grade-btn" data-grade="M250">М250</button>
  <button class="grade-btn" data-grade="M300">М300</button>
  ...
</div>
```
```css
.grade-btn {
  padding: 8px 18px;
  border-radius: 100px;
  background: var(--color-badge);
  color: var(--color-badge-text);
  font: 600 14px var(--font-heading);
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}
.grade-btn.active {
  background: var(--color-accent);
  color: #fff;
}
```

### Sidebar каталога (как vossmes)
```css
.catalog-sidebar {
  background: var(--color-sidebar);
  border-radius: 12px;
  padding: 20px 0;
  color: var(--color-sidebar-text);
}
.sidebar-item.active {
  color: #fff;
  border-left: 3px solid var(--color-accent);
  padding-left: 17px;
}
```

### Бейдж-геолокация
```css
.location-badge {
  display: inline-flex;
  padding: 6px 14px;
  background: var(--color-badge);
  color: var(--color-badge-text);
  border-radius: 100px;
  font: 600 11px var(--font-body);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
```

### Индикатор «Работаем сейчас»
```css
.online-badge { display: flex; align-items: center; gap: 6px; }
.online-badge::before {
  content: '';
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--color-online);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.15); }
}
```

### Прайс-карточка (цена в картинке hero)
```css
.hero-price-badge {
  position: absolute;
  bottom: 20px; right: 20px;
  background: var(--color-accent);
  color: #fff;
  border-radius: 12px;
  padding: 12px 20px;
  font: 700 18px var(--font-heading);
}
```

### Факты под hero (3 колонки)
```css
.hero-facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; }
.hero-fact { padding: 20px; background: var(--color-bg-alt); }
.hero-fact__number { font: 700 28px var(--font-heading); color: var(--color-text-primary); }
.hero-fact__label { font: 400 13px var(--font-body); color: var(--color-text-secondary); }
```

### Мессенджеры (фиксированные справа)
```css
.messenger-widget {
  position: fixed; right: 0; top: 50%;
  transform: translateY(-50%);
  display: flex; flex-direction: column;
  gap: 4px; z-index: 100;
}
.messenger-btn {
  width: 48px; height: 48px;
  border-radius: 8px 0 0 8px;
  display: flex; align-items: center; justify-content: center;
}
/* WhatsApp: #25D366, Telegram: #0088cc */
```

## Анимации

- Hover кнопок: transition 0.15s ease
- Раскрытие FAQ: max-height 0 → auto, transition 0.25s ease
- Scroll reveal: появление снизу (translateY 20px → 0), opacity 0→1, delay 0.1s
- Pulse на .online-badge: 2s infinite
- Параллакс на hero-видео: умеренный (background-attachment: fixed), отключается на mobile
- Запрещено: сложные 3D-трансформации, длинные анимации >0.5s
