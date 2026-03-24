# 🎯 TODO: Оркестратор (Пользователь) — Boardgame Rental Platform

> **Роль:** Оркестратор / Менеджер проекта
> **Задачи:** Ручная настройка сервисов, регистрация аккаунтов, передача ключей
> **Важно:** Этот файл содержит ТОЛЬКО ручные действия — написания кода не требуется

---

## 📋 Оглавление

- [Phase 0 — Подготовка инфраструктуры](#phase-0)
- [Phase 1 — Настройка Supabase Auth](#phase-1)
- [Phase 2–4 — Проверка БД и Storage](#phase-2-4)
- [Phase 5 — Домен (опционально)](#phase-5)
- [Phase 6 — Настройка email-рассылок](#phase-6)
- [Phase 8 — Первый администратор](#phase-8)
- [Phase 9 — Деплой и финальная проверка](#phase-9)
- [Phase 10 — App Store (перспектива)](#phase-10)

---

## 🏗️ Phase 0 — Подготовка инфраструктуры {#phase-0}

🔓 **Разблокирует:** Phase 0 разработчика (полностью)

### GitHub

- [x] **Создать аккаунт GitHub** (если нет)
  Перейти на [github.com/signup](https://github.com/signup). Зарегистрироваться по email.

- [x] **Создать приватный репозиторий `boardgame-rental`**
  1. На [github.com](https://github.com) нажать **New repository**
  2. Название: `boardgame-rental`
  3. Visibility: **Private**
  4. НЕ инициализировать с README (разработчик сделает сам)
  5. Нажать **Create repository**
  6. Скопировать URL репозитория и передать разработчику

---

### Supabase

- [x] **Создать аккаунт Supabase**
  Перейти на [supabase.com](https://supabase.com). Зарегистрироваться через GitHub (рекомендуется) или email.

- [x] **Создать новый проект**
  1. Нажать **New Project**
  2. Выбрать организацию
  3. Название проекта: `boardgame-rental`
  4. **Database Password:** сгенерировать сложный пароль и сохранить в безопасном месте
  5. Region: выбрать ближайший к целевой аудитории (например, `eu-central-1` для Европы/России)
  6. Plan: **Free**
  7. Нажать **Create new project** (создание займёт ~2 минуты)

- [x] **Сохранить ключи проекта**
  После создания перейти: **Settings → API**
  Скопировать и сохранить:
  - `Project URL` → это `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → это `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role secret` key → хранить в тайне, только для серверных задач

- [x] **Передать ключи разработчику**
  Создать файл `.env.local` (НЕ коммитить в Git!):
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  ```

---

### Vercel

- [ ] **Создать аккаунт Vercel**
  Перейти на [vercel.com](https://vercel.com). Зарегистрироваться через **GitHub** (обязательно — для автодеплоя).

- [ ] **Подключить GitHub репозиторий**
  1. На дашборде Vercel: **Add New → Project**
  2. Выбрать репозиторий `boardgame-rental`
  3. Framework Preset: **Next.js** (определится автоматически)
  4. Root Directory: `web` (если монорепо)
  5. НЕ нажимать Deploy пока — сначала нужны env variables (см. Phase 9)
  6. Сохранить проект

🔓 **Разблокирует:** Phase 9 разработчика (деплой)

---

### Resend

- [ ] **Создать аккаунт Resend**
  Перейти на [resend.com](https://resend.com). Зарегистрироваться по email.

- [ ] **Получить API ключ**
  1. Перейти в **API Keys → Create API Key**
  2. Название: `boardgame-rental-prod`
  3. Permission: **Full access** (или **Sending access**)
  4. Скопировать ключ (показывается только один раз!)
  5. Добавить в `.env.local`: `RESEND_API_KEY=re_xxxx`

- [ ] **Передать RESEND_API_KEY разработчику**
  Добавить в общий `.env.local` файл.

🔓 **Разблокирует:** Phase 6 разработчика (email уведомления)

---

## 🔐 Phase 1 — Настройка Supabase Auth {#phase-1}

> Зависит от: Phase 0 (Supabase проект создан)
> 🔓 **Разблокирует:** Тестирование Phase 1 разработчика

- [ ] **Включить Email provider**
  Supabase Dashboard → **Authentication → Providers → Email**
  Проверить что включено:
  - ✅ Enable Email provider
  - ✅ Confirm email (подтверждение email при регистрации)
  - ✅ Secure email change

- [ ] **Настроить Email Templates**
  Supabase Dashboard → **Authentication → Email Templates**
  Обновить шаблоны (разработчик предоставит HTML-шаблоны):
  - **Confirm signup** — письмо подтверждения регистрации
  - **Reset password** — восстановление пароля
  - **Magic Link** — для 2FA через email (OTP)

- [ ] **Настроить Redirect URLs**
  Supabase Dashboard → **Authentication → URL Configuration**
  - Site URL: `http://localhost:3000` (для разработки)
  - Redirect URLs добавить:
    ```
    http://localhost:3000/auth/confirm
    http://localhost:3000/auth/reset-password
    ```
  - После получения домена добавить продакшн URL (см. Phase 5)

- [ ] **Отключить лишние провайдеры**
  Supabase Dashboard → **Authentication → Providers**
  Убедиться что включён ТОЛЬКО **Email**. Отключить Google, GitHub, Facebook и другие (если были включены по умолчанию).

- [ ] **Настроить JWT expiry (опционально)**
  Supabase Dashboard → **Authentication → Settings → JWT Settings**
  JWT expiry: `3600` (1 час) — стандартное значение.

---

## 🗄️ Phase 2–4 — Проверка БД и Storage {#phase-2-4}

> Зависит от: Применения миграций разработчиком
> 🔓 **Разблокирует:** Тестирование Phase 2–4 разработчика

- [ ] **Создать Storage bucket "avatars"**
  Supabase Dashboard → **Storage → New bucket**
  - Name: `avatars`
  - Public bucket: ✅ (включить)
  - Allowed MIME types: `image/jpeg, image/png, image/webp`
  - Max file size: `5 MB`
  - Нажать **Create bucket**

- [ ] **Создать Storage bucket "game-photos"**
  Supabase Dashboard → **Storage → New bucket**
  - Name: `game-photos`
  - Public bucket: ✅ (включить)
  - Allowed MIME types: `image/jpeg, image/png, image/webp`
  - Max file size: `10 MB`
  - Нажать **Create bucket**

- [ ] **Проверить таблицы после миграций**
  После того как разработчик применил миграции:
  Supabase Dashboard → **Table Editor**
  Убедиться что появились таблицы: `users`, `games`, `game_instances`, `availability`, `bookings`, `reviews`

- [ ] **Проверить RLS политики**
  Supabase Dashboard → **Authentication → Policies**
  Убедиться что для каждой таблицы включён RLS и есть политики.
  ⚠️ Если RLS включён, но политик нет — таблица недоступна никому. Сообщить разработчику.

---

## 🌐 Phase 5 — Домен (опционально для MVP) {#phase-5}

> 💡 Для MVP можно использовать бесплатный домен Vercel (`boardgame-rental.vercel.app`)
> Кастомный домен — по желанию

- [ ] **Зарегистрировать домен (опционально)**
  Варианты регистраторов:
  - [Namecheap.com](https://namecheap.com) — удобный интерфейс, хорошие цены
  - [reg.ru](https://reg.ru) — для .ru домена
  - [GoDaddy.com](https://godaddy.com)
  Рекомендуемые имена: `boardgame-rental.app`, `boardgame-rent.com`, `nastolki-rent.ru`

- [ ] **Настроить DNS → Vercel**
  В панели регистратора домена → DNS Management
  Добавить записи (Vercel покажет точные значения):
  - Тип `A`: `@` → IP адрес Vercel (`76.76.21.21`)
  - Тип `CNAME`: `www` → `cname.vercel-dns.com`

- [ ] **Добавить домен в Vercel**
  Vercel Dashboard → ваш проект → **Settings → Domains**
  - Нажать **Add Domain**
  - Ввести домен
  - Vercel автоматически выпустит SSL сертификат

- [ ] **Обновить Redirect URLs в Supabase**
  Supabase Dashboard → **Authentication → URL Configuration**
  - Site URL: `https://ваш-домен.com`
  - Добавить в Redirect URLs:
    ```
    https://ваш-домен.com/auth/confirm
    https://ваш-домен.com/auth/reset-password
    ```

---

## 📧 Phase 6 — Настройка email-рассылок {#phase-6}

> Зависит от: Phase 0 (аккаунт Resend создан)
> 🔓 **Разблокирует:** Phase 6 разработчика (email уведомления при бронировании)

- [ ] **Верифицировать домен отправителя в Resend**
  Resend Dashboard → **Domains → Add Domain**
  - Вариант А (с кастомным доменом): добавить DNS-записи TXT и CNAME от Resend в панели регистратора. Подождать верификации (~30 минут).
  - Вариант Б (без домена, для тестов): использовать `onboarding@resend.dev` — работает сразу, ограничение: только на ваш email.

- [ ] **Создать финальный API ключ с правами Send**
  Resend Dashboard → **API Keys → Create API Key**
  - Название: `boardgame-rental`
  - Permission: **Sending access**
  - Domain: выбрать верифицированный домен (или All)
  - Передать ключ разработчику как `RESEND_API_KEY`

- [ ] **Проверить тестовые письма**
  После завершения Phase 6 разработчиком:
  1. Создать тестовое бронирование
  2. Убедиться что пришло письмо владельцу о новом запросе
  3. Подтвердить бронь → убедиться что арендатор получил письмо с контактом
  4. Проверить в Resend Dashboard → **Emails** — статус доставки

---

## 👑 Phase 8 — Первый администратор {#phase-8}

> Зависит от: Завершения Phase 1 разработчиком (регистрация работает)
> 🔓 **Разблокирует:** Тестирование Phase 8 разработчика (админ-панель)

- [ ] **Зарегистрироваться на платформе**
  Перейти на `http://localhost:3000/register` (или продакшн URL).
  Создать аккаунт с вашим email. Подтвердить email.

- [ ] **Выставить роль admin через Supabase**
  Supabase Dashboard → **Authentication → Users**
  1. Найти свою запись по email
  2. Нажать на пользователя → **Edit**
  3. В поле **Raw App Meta Data** добавить или изменить:
     ```json
     {
       "role": "admin"
     }
     ```
  4. Сохранить

  Либо через **SQL Editor**:
  ```sql
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
  WHERE email = 'ваш@email.com';
  ```

- [ ] **Проверить доступ к /admin панели**
  Перейти на `http://localhost:3000/admin` — должна открыться без ошибок.

---

## 🚀 Phase 9 — Деплой и финальная проверка {#phase-9}

> Зависит от: Завершения Phase 0 Vercel + готовности кода от разработчика
> 🔓 **Разблокирует:** Публичный запуск платформы

- [ ] **Добавить env variables в Vercel**
  Vercel Dashboard → ваш проект → **Settings → Environment Variables**
  Добавить все переменные (для окружений Production, Preview, Development):
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  RESEND_API_KEY
  NEXT_PUBLIC_APP_URL  (ваш домен или .vercel.app)
  ```

- [ ] **Запустить первый деплой**
  Vercel Dashboard → ваш проект → **Deployments → Deploy**
  Или: push в ветку `main` → Vercel задеплоит автоматически.
  Открыть Deployment Logs — убедиться что нет ошибок.

- [ ] **Обновить Supabase для prod окружения**
  Supabase Dashboard → **Authentication → URL Configuration**
  Обновить Site URL и Redirect URLs на продакшн домен (`.vercel.app` или кастомный).

- [ ] **Финальное тестирование платформы**
  Пройти полный пользовательский сценарий:
  1. ✅ Зарегистрироваться → подтвердить email
  2. ✅ Заполнить профиль: имя, город, контакт
  3. ✅ Добавить игру (пройти модерацию как admin)
  4. ✅ Создать объявление с фото и ценой
  5. ✅ Найти объявление через поиск на карте
  6. ✅ Создать бронирование с сообщением
  7. ✅ Подтвердить бронь как владелец
  8. ✅ Убедиться что контакт появился у арендатора
  9. ✅ Оставить отзыв после завершения

- [ ] **Мониторинг после запуска**
  - Supabase Dashboard → **Reports** — следить за нагрузкой на БД
  - Vercel Analytics — трафик, Core Web Vitals
  - Resend Dashboard — доставка email
  - При приближении к лимитам бесплатного плана — рассмотреть апгрейд (Supabase Pro $25/мес, Vercel Pro $20/мес)

---

## 📱 Phase 10 — App Store (перспектива) {#phase-10}

> Только когда мобильное приложение готово (Phase 10 разработчика)
> ⚠️ Требует времени: рассмотрение Apple занимает 1–3 рабочих дня

- [ ] **Создать Apple Developer аккаунт**
  Перейти на [developer.apple.com](https://developer.apple.com/programs/)
  - Стоимость: **$99/год**
  - Нужен Apple ID + двухфакторная аутентификация
  - Нужен DUNS номер для организации (или как физлицо)
  - Срок регистрации: от 1 дня до 2 недель

- [ ] **Создать App ID и Bundle ID**
  Apple Developer Portal → **Certificates, IDs & Profiles → Identifiers**
  - Нажать **+** → **App IDs**
  - Description: `BoardGame Rental`
  - Bundle ID (Explicit): `com.yourname.boardgame-rental`
  - Capabilities: Push Notifications, Sign in with Apple (если нужно)
  - Передать Bundle ID разработчику

- [ ] **Подготовить маркетинговые материалы**
  Требования App Store Connect:
  - **Иконка:** 1024×1024 px, PNG, без прозрачности
  - **Скриншоты** для каждого размера:
    - iPhone 6.7": 1290×2796 px (минимум 3 скриншота)
    - iPhone 5.5": 1242×2208 px
  - **Описание:** до 4000 символов
  - **Ключевые слова:** до 100 символов
  - **Возрастной рейтинг:** 4+

- [ ] **Создать приложение в App Store Connect**
  Перейти на [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
  - **My Apps → +** → **New App**
  - Platform: iOS
  - Name: `BoardGame Rental` (или локализованное название)
  - Bundle ID: выбрать созданный ранее
  - Заполнить все метаданные

- [ ] **Передать credentials разработчику**
  - Apple Team ID (из Developer Portal → Membership)
  - Bundle ID
  - Provisioning Profile (для EAS Build)
  - ASC API Key (для автоматической загрузки билда)

---

## 📝 Легенда

| Символ | Значение |
|--------|----------|
| 🔓 | Разблокирует этап разработчика |
| ⏳ | Ожидает другого действия |
| `[ ]` | Задача не выполнена |
| `[x]` | Задача выполнена |
| ⚠️ | Важное предупреждение |
| 💡 | Подсказка / совет |

---

## 🔑 Шпаргалка по ключам

| Переменная | Где взять | Кому передать |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Разработчику |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Разработчику |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Разработчику (секретно) |
| `RESEND_API_KEY` | Resend → API Keys | Разработчику |
| `NEXT_PUBLIC_APP_URL` | Vercel URL после деплоя | Разработчику |
| Apple Bundle ID | Apple Developer Portal | Разработчику |
| Apple Team ID | Apple Developer → Membership | Разработчику |
