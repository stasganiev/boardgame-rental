# 🛠️ TODO: AI Developer (Claude) — Boardgame Rental Platform

> **Роль:** ИИ-разработчик (Claude)
> **Стек:** Next.js 14 App Router · TypeScript · Supabase · Tailwind CSS · Vercel · Resend · Leaflet.js · React Native/Expo · next-i18next · Zustand · React Hook Form + Zod
> **Проект:** Платформа аренды настольных игр (бесплатный маркетплейс)

---

## 📋 Оглавление

- [Phase 0 — Подготовка и архитектура](#phase-0)
- [Phase 1 — Аутентификация](#phase-1)
- [Phase 2 — Профили пользователей](#phase-2)
- [Phase 3 — База игр (номенклатура)](#phase-3)
- [Phase 4 — Объявления владельцев (GameInstance)](#phase-4)
- [Phase 5 — Поиск и геолокация](#phase-5)
- [Phase 6 — Бронирование](#phase-6)
- [Phase 7 — Отзывы и рейтинги](#phase-7)
- [Phase 8 — Админ-панель](#phase-8)
- [Phase 9 — Оптимизация и деплой](#phase-9)
- [Phase 10 — Мобильное приложение](#phase-10)

---

## 🏗️ Phase 0 — Подготовка и архитектура {#phase-0}

> ⏳ **Требует:** Создания репозитория GitHub и проекта Supabase оркестратором

- [x] **Инициализация репозитория Next.js 14**
  Создать проект командой `npx create-next-app@latest` с флагами: App Router, TypeScript, Tailwind CSS, ESLint. Структура папок: `/web`, `/mobile`, `/supabase`.

- [x] **Настройка Tailwind CSS, ESLint, Prettier**
  Настроить `.eslintrc.json` (правила для TypeScript + React), `.prettierrc` (tabWidth: 2, singleQuote: true, semi: false). Добавить `tailwind.config.ts` с путями к `/app` и `/components`.

- [x] **Настройка Supabase клиента**
  ⏳ Требует: URL и anon key от оркестратора
  Создать `/lib/supabase/client.ts` (browser client) и `/lib/supabase/server.ts` (server client для Server Components). Использовать `@supabase/ssr`.

- [x] **Настройка i18n (next-i18next)**
  Установить `next-i18next`. Создать структуру `/locales/en/{common,auth,games,bookings}.json` и `/locales/ru/{common,auth,games,bookings}.json`. Настроить `next-i18next.config.js` с локалями `['en', 'ru']` и defaultLocale `'en'`. Настроить маршрутизацию `/[locale]/...` в App Router.

- [x] **Настройка Zustand store**
  Создать `/store/authStore.ts` (пользователь, сессия), `/store/searchStore.ts` (фильтры поиска, координаты), `/store/uiStore.ts` (язык, тема). Использовать `persist` middleware для сохранения языка.

- [x] **Базовый layout и шапка**
  Создать `/app/[locale]/layout.tsx` с провайдерами (Supabase, Zustand, i18n). Компонент `Header` с: логотипом, навигацией, переключателем языка EN/RU, кнопками Login/Register (или аватаром если залогинен).

- [x] **Настройка переменных окружения**
  Создать `.env.example` со всеми необходимыми переменными: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`. Добавить `.env.local` в `.gitignore`.

---

## 🔐 Phase 1 — Аутентификация {#phase-1}

> ⏳ **Требует:** Настройки Supabase Auth и Email provider оркестратором

- [x] **Supabase Auth интеграция — Sign Up**
  Реализовать `supabase.auth.signUp({ email, password })` с передачей metadata (name, city, country, language). После регистрации — редирект на страницу "Проверьте почту".

- [x] **Supabase Auth интеграция — Sign In / Sign Out**
  Реализовать `supabase.auth.signInWithPassword()` и `supabase.auth.signOut()`. Сохранять сессию через Supabase SSR cookies.

- [x] **Email подтверждение при регистрации**
  Настроить обработку callback-маршрута `/auth/confirm` (exchange code for session). Показывать статус верификации пользователю.

- [ ] **2FA через email (OTP)**
  Реализовать flow: запрос OTP → `supabase.auth.signInWithOtp({ email })` → ввод кода → `supabase.auth.verifyOtp()`. Страница `/auth/verify-otp`.

- [x] **Восстановление пароля**
  Страница `/forgot-password`: вызов `supabase.auth.resetPasswordForEmail()`. Страница `/auth/reset-password`: обработка токена, вызов `supabase.auth.updateUser({ password })`.

- [x] **Страницы авторизации**
  Создать `/[locale]/register/page.tsx`, `/[locale]/login/page.tsx`, `/[locale]/forgot-password/page.tsx` с формами на React Hook Form + Zod валидацией. Все тексты через i18n (`auth.json`).

- [x] **Protected routes middleware**
  Создать `middleware.ts` в корне: проверять сессию Supabase для защищённых маршрутов (`/profile`, `/bookings`, `/admin`). Редиректить на `/login` если не авторизован.

- [x] **JWT refresh логика**
  Настроить автообновление сессии через Supabase SSR. Добавить `<SessionRefresher />` компонент в layout для client-side refresh.

---

## 👤 Phase 2 — Профили пользователей {#phase-2}

> ⏳ **Требует:** Создания bucket "avatars" в Supabase Storage оркестратором

- [x] **Миграция таблицы users**
  Создать `/supabase/migrations/001_create_users.sql`: таблица `users` с полями из PRD (id UUID, email, name, avatar_url, country, city, location JSONB, contact JSONB, rating NUMERIC, deals_count INT, user_type, language, notification_settings JSONB, created_at). Добавить GIST индекс для геопоиска.

- [x] **RLS политики для таблицы users**
  Политики: `SELECT` — все могут читать публичные профили; `UPDATE` — только владелец своего профиля (`auth.uid() = id`); `INSERT` — при регистрации (триггер).

- [x] **Автосоздание профиля при регистрации**
  Создать Database Function + Trigger: при `auth.users` INSERT → автоматически создавать запись в `public.users` с данными из metadata.

- [x] **CRUD профиля**
  API-функции: `getProfile(userId)`, `updateProfile(data)`. Обновляемые поля: name, city, country, location, contact, language, notification_settings.

- [x] **Загрузка фото профиля**
  Компонент `AvatarUpload`: выбор файла → resize до 400x400 (canvas) → загрузка в `avatars/{userId}` → сохранение URL в профиль. Показывать прогресс загрузки.

- [x] **Страница профиля `/profile/[id]`**
  Отображать: аватар, имя, рейтинг, количество сделок, город, список объявлений пользователя, отзывы. Контакт показывать только если `isPublic: true` или есть подтверждённая бронь.

- [x] **Редактирование своего профиля**
  Страница `/profile/edit` (только для авторизованного пользователя): форма с React Hook Form + Zod, загрузка аватара, выбор типа контакта, настройки уведомлений, выбор языка.

---

## 🎲 Phase 3 — База игр (номенклатура) {#phase-3}

> ⏳ **Требует:** Создания bucket "game-photos" в Supabase Storage оркестратором

- [x] **Миграция таблицы games**
  Создать `/supabase/migrations/002_create_games.sql`: таблица `games` с полями из PRD (id, name, min_players, max_players, min_age, game_duration, complexity 1-5, genre TEXT[], weight, description, official_photos TEXT[], created_by, moderation_status, created_at). Индексы на name, genre.

- [x] **RLS политики для games**
  `SELECT` — все могут читать approved игры; неавторизованные пользователи тоже; `INSERT` — только авторизованные; `UPDATE` — только admin или создатель (для pending).

- [x] **Форма добавления новой игры**
  Страница `/games/new`: React Hook Form + Zod, поля согласно модели Game. Новые игры создаются со статусом `moderation_status: 'pending'`. Показывать пользователю статус модерации.

- [x] **Поиск дублей по названию**
  При вводе названия — debounced запрос `supabase.from('games').select().ilike('name', '%query%')`. Показывать список похожих игр с предложением "Использовать эту игру?".

- [x] **Загрузка официальных фото игры**
  Компонент `MultiImageUpload`: загрузка нескольких фото в `game-photos/official/{gameId}/`. Превью перед загрузкой, удаление отдельных фото.

- [x] **Страница `/games/[id]`**
  Отображать: фотогалерея, все поля игры, список активных объявлений (GameInstance) с этой игрой на карте и в списке.

---

## 📋 Phase 4 — Объявления владельцев (GameInstance) {#phase-4}

- [ ] **Миграция таблицы game_instances**
  Создать `/supabase/migrations/003_create_game_instances.sql`: таблица `game_instances` с полями из PRD (id, game_id FK, owner_id FK, condition ENUM, owner_photos TEXT[], price_per_day NUMERIC, location JSONB с lat/lng/city/country, availability_rules JSONB, additional_description, is_active BOOL, created_at). GIST индекс на location.

- [ ] **Миграция таблицы availability**
  Создать `/supabase/migrations/004_create_availability.sql`: таблица `availability` (id, game_instance_id FK, date DATE, status ENUM['available','booked','blocked']). Составной уникальный индекс на (game_instance_id, date).

- [ ] **RLS политики для game_instances и availability**
  `game_instances`: SELECT — все; INSERT/UPDATE/DELETE — только owner (`auth.uid() = owner_id`).
  `availability`: SELECT — все; INSERT/UPDATE — только владелец соответствующего game_instance.

- [ ] **CRUD объявлений владельца**
  Страницы: `/listings/new` (создать объявление, выбрать игру из базы), `/listings/[id]/edit` (редактировать), деактивация через `is_active: false`. Форма с выбором игры, состояния, цены, описания.

- [ ] **Загрузка фото экземпляра**
  Компонент `InstancePhotoUpload`: загрузка фото в `game-photos/instances/{instanceId}/`. Показывать отличие от официальных фото игры.

- [ ] **Компонент календаря доступности**
  Визуальный календарь: зелёный = available, красный = booked, серый = blocked. Владелец может блокировать/разблокировать даты вручную. Автоматическое заполнение на основе `availability_rules` (дни недели).

- [ ] **Страница `/listings/[id]`**
  Отображать: фотогалерея (официальные + фото экземпляра), информация об игре, состояние, цена, местоположение (мини-карта с погрешностью ~500м), расстояние от пользователя, календарь доступности, профиль владельца, кнопка "Запросить бронь".

---

## 🗺️ Phase 5 — Поиск и геолокация {#phase-5}

- [ ] **Edge Function geo-search (Haversine)**
  Создать `/supabase/functions/geo-search/index.ts` (Deno): принимает `{ lat, lng, radiusKm, filters }`, выполняет SQL с Haversine formula для расчёта расстояния, возвращает game_instances в радиусе с сортировкой по расстоянию.

- [ ] **Фильтры поиска**
  Компонент `SearchFilters`: genre (мультиселект), min/max players, min_age, complexity (1-5), radiusKm (слайдер: 1-100 км), condition. Состояние фильтров в Zustand searchStore. URL-синхронизация параметров поиска.

- [ ] **Геолокация пользователя в браузере**
  Hook `useGeolocation()`: вызов `navigator.geolocation.getCurrentPosition()`, сохранение координат в searchStore. Fallback: поиск по городу из профиля. Запрашивать разрешение только при необходимости.

- [ ] **Интеграция Leaflet.js + OpenStreetMap**
  Установить `react-leaflet`, `leaflet`. Создать компонент `/components/map/MapView.tsx` с `dynamic import` (отключить SSR: `ssr: false`). Тайлы: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.

- [ ] **Карта с пинами объявлений**
  Компонент `ListingsMap`: отображать маркеры для каждого game_instance. Координаты объявлений округлять до ~0.005° (~500м) для конфиденциальности. Popup при клике на пин: фото миниатюра, название игры, цена, расстояние, ссылка на объявление.

- [ ] **Главная страница с поиском**
  Страница `/[locale]/page.tsx`: поисковая строка + фильтры + переключатель "Карта / Список". Карта занимает половину экрана (десктоп) или переключается отдельно (мобильный). Статистика платформы: количество игр, городов, пользователей (count из БД).

- [ ] **Страница `/search`**
  Результаты поиска: двухколоночный layout (список + карта). Пагинация / infinite scroll для списка. Синхронизация: при клике на карточку — highlight пина на карте и наоборот.

---

## 📅 Phase 6 — Бронирование {#phase-6}

> ⏳ **Требует:** Настройки Resend и передачи RESEND_API_KEY оркестратором

- [ ] **Миграция таблицы bookings**
  Создать `/supabase/migrations/005_create_bookings.sql`: таблица `bookings` с полями из PRD (id, game_instance_id FK, renter_id FK, owner_id FK, start_date DATE, end_date DATE, status ENUM, message TEXT, created_at, confirmed_at). Индексы на renter_id, owner_id, status.

- [ ] **RLS политики для bookings**
  SELECT — только renter или owner брони; INSERT — только авторизованный (как renter); UPDATE — только owner (confirm/reject) или renter (cancel).

- [ ] **Edge Function send-email**
  Создать `/supabase/functions/send-email/index.ts`: использует Resend API. Типы писем: `booking_request` (владельцу), `booking_confirmed` (арендатору + контакт владельца), `booking_cancelled` (обе стороны), `booking_reminder` (за 1 день). HTML шаблоны с переводами EN/RU.

- [ ] **Процесс бронирования — форма запроса**
  Компонент `BookingRequestForm` на странице `/listings/[id]`: выбор дат из доступных в календаре, поле для сообщения, валидация (мин. дней, макс. дней согласно availability_rules). Отправка → создание booking со статусом `pending`.

- [ ] **Владелец: подтверждение/отклонение брони**
  Страница `/bookings/my-listings`: список входящих запросов с кнопками "Подтвердить" / "Отклонить". При подтверждении: UPDATE booking status → `confirmed`, отправить email арендатору с контактом владельца (вызов Edge Function send-email).

- [ ] **Автообновление availability при бронировании**
  Database Trigger или Edge Function: при `booking.status = 'confirmed'` → INSERT записи в `availability` с status `'booked'` для каждой даты диапазона. При `cancelled` → DELETE этих записей.

- [ ] **Страница `/bookings/my-rentals`**
  Список аренд арендатора: статус, даты, фото игры, имя владельца. После подтверждения — отображать контакт владельца. Возможность отмены pending брони.

- [ ] **Email уведомления — интеграция**
  Вызывать Edge Function `send-email` в триггерных точках: создание брони, подтверждение, отмена. Учитывать `notificationSettings` пользователя.

---

## ⭐ Phase 7 — Отзывы и рейтинги {#phase-7}

- [ ] **Миграция таблицы reviews**
  Создать `/supabase/migrations/006_create_reviews.sql`: таблица `reviews` с полями из PRD (id, booking_id FK UNIQUE per type, reviewer_id FK, reviewee_id FK, rating INT 1-5, comment TEXT, type ENUM, created_at). Ограничение: один отзыв на бронь на тип.

- [ ] **RLS политики для reviews**
  INSERT — только если `booking.status = 'completed'` и reviewer_id = auth.uid(); SELECT — все могут читать.

- [ ] **Edge Function update-rating**
  Создать `/supabase/functions/update-rating/index.ts`: при создании отзыва → пересчитать `AVG(rating)` для reviewee → UPDATE `users.rating`. Вызывать через Database Trigger после INSERT в reviews.

- [ ] **Форма отзыва**
  Компонент `ReviewForm`: оценка 1-5 (звёздочки), текстовый комментарий (min 20 символов). Показывать только для broней со статусом `completed`, у которых ещё нет отзыва от текущего пользователя.

- [ ] **Отображение рейтинга**
  Компонент `RatingDisplay`: звёздочки + числовое значение + количество отзывов. Использовать на: карточке профиля, странице объявления, списке поиска. Список последних отзывов на странице профиля.

---

## 🛡️ Phase 8 — Админ-панель {#phase-8}

> ⏳ **Требует:** Выставления роли admin для аккаунта оркестратора

- [ ] **Edge Function moderate-game**
  Создать `/supabase/functions/moderate-game/index.ts`: проверять роль admin через JWT claim, выполнять UPDATE `games.moderation_status`, отправлять email создателю игры с результатом модерации.

- [ ] **Middleware для admin роли**
  В `middleware.ts`: проверять кастомный claim `user.app_metadata.role === 'admin'` для маршрутов `/admin/*`. Редиректить на 403 если не admin.

- [ ] **Страница `/admin` — очередь модерации игр**
  Список игр со статусом `pending`: фото, название, описание, кнопки "Одобрить" / "Отклонить" (с полем причины). Счётчик ожидающих в шапке.

- [ ] **Страница `/admin/users` — управление пользователями**
  Список пользователей с поиском: аватар, имя, email, дата регистрации, количество сделок, рейтинг, статус (active/blocked). Кнопки блокировки/разблокировки через `supabase.auth.admin.updateUserById()`.

- [ ] **Страница `/admin/bookings` — мониторинг броней**
  Таблица всех броней с фильтрацией по статусу. Базовая статистика: total bookings, confirmed %, cancelled %.

---

## 🚀 Phase 9 — Оптимизация и деплой {#phase-9}

> ⏳ **Требует:** Настройки Vercel и добавления env переменных оркестратором

- [ ] **SEO: metadata и OpenGraph**
  Добавить `generateMetadata()` для ключевых страниц (главная, /games/[id], /listings/[id]). OpenGraph теги: title, description, image (фото игры). `robots.txt` и `sitemap.xml` (динамический через Route Handler).

- [ ] **Оптимизация изображений**
  Использовать `next/image` для всех изображений с правильными `sizes` и `priority`. Lazy loading для галерей. WebP конвертация. Blur placeholder через `blurDataURL`.

- [ ] **Пагинация / Infinite scroll**
  Для страниц поиска и списков — infinite scroll через Intersection Observer + Supabase `.range()`. Для админ-панели — традиционная пагинация.

- [ ] **Lighthouse аудит**
  Запустить Lighthouse, достичь показателей: Performance ≥85, Accessibility ≥90, Best Practices ≥90, SEO ≥95. Исправить критичные проблемы.

- [ ] **Настройка деплоя на Vercel**
  `vercel.json` с правилами rewrite для i18n. Проверить environment variables в Vercel dashboard. Настроить Preview Deployments для PR.

- [ ] **Supabase prod окружение**
  Применить все миграции к prod Supabase. Создать prod Storage buckets. Проверить RLS политики. Настроить Edge Functions в prod.

- [ ] **E2E тесты (Playwright)**
  Базовые сценарии: регистрация → подтверждение email, создание объявления, поиск с геолокацией, процесс бронирования, оставление отзыва. CI/CD через GitHub Actions.

---

## 📱 Phase 10 — Мобильное приложение (React Native + Expo) {#phase-10}

> ⏳ **Требует:** Apple Developer аккаунта и credentials от оркестратора (для App Store)

- [ ] **Инициализация Expo проекта**
  `npx create-expo-app mobile --template` с TypeScript. Настроить EAS Build (`eas.json`). Переиспользовать Supabase client из `/lib/supabase` — вынести в shared пакет или скопировать.

- [ ] **Общие Zustand store и типы**
  Переиспользовать типы TypeScript из `/types`. Создать общий `/shared/store` или дублировать authStore для мобильного.

- [ ] **Экран поиска (Home)**
  Список объявлений с фильтрами. MapView через `react-native-maps` или `expo-maps` с пинами. Переключение список/карта.

- [ ] **Карточка игры/объявления**
  Экран с фотогалереей (`expo-image`), полной информацией, календарём доступности, кнопкой "Запросить бронь".

- [ ] **Профиль пользователя**
  Экраны: просмотр чужого профиля, редактирование своего (с загрузкой аватара через `expo-image-picker`).

- [ ] **Бронирование**
  Экраны: my-rentals, my-listings. Список броней с статусами, кнопки подтверждения/отмены.

- [ ] **Нативная геолокация**
  `expo-location` для получения координат устройства. Запрос разрешений при первом запуске. Передавать координаты в поиск.

- [ ] **Подготовка к публикации**
  Иконка, splash screen, App Store screenshots (6.5", 5.5"). `app.json` с bundle ID, version, build number. `eas build --platform ios`.

---

## 📝 Легенда

| Символ | Значение |
|--------|----------|
| ⏳ | Задача требует предварительного действия оркестратора |
| `[ ]` | Задача не начата |
| `[x]` | Задача выполнена |
| `[~]` | Задача в процессе |
