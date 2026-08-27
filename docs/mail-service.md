# Почтовый сервис

## Назначение и архитектура

Почта отправляется асинхронно, чтобы SMTP не увеличивал время ответа формы:

1. Next.js (`web`) принимает `POST /api/leads`, валидирует заявку и кладёт почтовое задание в SQLite.
2. База очереди находится в `MAIL_QUEUE_PATH` на общем постоянном томе `/data`.
3. Отдельный процесс `worker` арендует готовые задания, формирует письмо и отправляет его через SMTP.
4. В Docker-окружении SMTP предоставляет Mailpit; в production используется внешний SMTP-провайдер или MTA.

Worker не принимает входящие HTTP-запросы. Его production-артефакт — `dist/mail-worker.mjs`; Docker-образ собирает bundle сам и запускает его командой `node dist/mail-worker.mjs`. Runtime-пакеты находятся в `dependencies`.

Railway (`railway.toml`) и Vercel (`vercel.json`) продолжают собирать существующий Next.js web-сервис. Docker-конфигурация не заменяет их и не меняет их команды.

## Переменные окружения

Полный безопасный образец находится в `.env.example`.

### Web и адреса

- `SITE_URL` — канонический server-side URL.
- `NEXT_PUBLIC_SITE_URL` — публичный URL, встраиваемый в клиентский bundle.
- `PORT` — порт Next.js, по умолчанию `3000`.

### Отправитель

- `MAIL_ENABLED` — включает постановку/отправку писем. Для production задаётся явно.
- `MAIL_FROM` — заголовок From, например `Мой Сервис <no-reply@example.com>`.
- `MAIL_REPLY_TO` — адрес для ответа клиента.
- `MAIL_ADMIN_TO` — получатель уведомлений о заявках.
- `MAIL_HEALTH_TOKEN` — длинный случайный токен для закрытых live health/test-send endpoint. Не передавать в `NEXT_PUBLIC_*`.

### SMTP

- `SMTP_HOST`, `SMTP_PORT` — SMTP-сервер и порт.
- `SMTP_SECURE=true` — TLS сразу при подключении (обычно порт 465).
- `SMTP_SECURE=false` — обычное подключение с возможным STARTTLS (обычно 587; Mailpit — 1025).
- `SMTP_REQUIRE_TLS=true` — требовать STARTTLS; включайте для production на порту 587.
- `SMTP_TLS_REJECT_UNAUTHORIZED=true` — проверять цепочку TLS-сертификата.
- `SMTP_USER`, `SMTP_PASSWORD` — учётные данные. Для локального Mailpit пустые.

Не отключайте проверку TLS-сертификата в production. Пароли храните в secret store платформы, а не в `.env`, образе или Git.

### Очередь

- `MAIL_QUEUE_PATH` — файл SQLite; в Docker `/data/mail-queue.sqlite`.
- `MAIL_WORKER_CONCURRENCY` — максимум одновременных отправок.
- `MAIL_POLL_INTERVAL_MS` — интервал опроса очереди.
- `MAIL_LEASE_MS` — срок аренды задания worker-ом.
- `MAIL_MAX_ATTEMPTS` — предел попыток.
- `MAIL_BASE_RETRY_MS`, `MAIL_MAX_RETRY_MS` — границы экспоненциальной задержки повторов.
- `MAIL_RETENTION_MS` — срок хранения завершённых заданий.

`MAIL_LEASE_MS` должен быть больше суммы SMTP timeout с запасом. Несколько worker-ов допустимы только при атомарном захвате задания транзакцией SQLite.

### MAX

Почтовый канал не заменяет MAX-уведомления. `MAX_BOT_TOKEN`, `MAX_CHAT_ID`, `MAX_RECIPIENT`, `MAX_API_BASE_URL`, `NOTIFY_TIMEOUT_MS` и `NOTIFY_RETRIES` остаются независимой server-only конфигурацией.

## Локальный запуск без Docker

1. Скопировать `.env.example` в `.env.local` и оставить `MAIL_ENABLED=false`, пока SMTP не настроен.
2. Для локального SMTP запустить Mailpit отдельно на портах `1025`/`8025`.
3. Установить `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false`.
4. Запустить web и worker вместе командой `npm run dev:mail` (или раздельно `npm run dev` и `npm run mail:worker`).
5. Для production-сборки worker выполнить:

```powershell
npm run build:mail-worker
node .\dist\mail-worker.mjs
```

Каталог `data` нужно создать заранее, если используется относительный путь вроде `data/mail-queue.sqlite`. Файлы базы и worker-артефакты исключены из Git.

## Запуск в Docker

```powershell
docker compose build
docker compose up -d
docker compose ps
```

Сервисы:

- web: <http://localhost:3000>
- Mailpit UI: <http://localhost:8025>
- Mailpit SMTP: `localhost:1025`
- worker: без опубликованных портов

По умолчанию Compose направляет SMTP web и worker на `mailpit:1025`. Для VPS значения `SMTP_HOST`, `SMTP_PORT` и TLS-параметры можно переопределить через environment без изменения кода. Web, worker и Mailpit используют named volume `app-data`, смонтированный в `/data`. Одноразовый `data-init` настраивает права тома.

Остановка без удаления данных:

```powershell
docker compose down
```

Удаление тома вместе с очередью и письмами Mailpit:

```powershell
docker compose down -v
```

## API

Публичная точка входа приложения — `POST /api/leads`. Она принимает JSON:

```json
{
  "name": "Иван",
  "phone": "+7 900 000-00-00",
  "message": "Не включается ноутбук",
  "deviceType": "laptop",
  "contactPref": "phone",
  "callback": true,
  "consent": true,
  "website": ""
}
```

Успех: HTTP `201`, `{ "ok": true, "id": "<uuid>" }`. Ошибка валидации содержит `{ "ok": false, "error": "...", "fieldErrors": { ... } }`. Поле `website` — honeypot и должно оставаться пустым.

Произвольный публичный endpoint «отправить письмо» создавать нельзя: он превратит сервис в спам-релей. Постановка в очередь выполняется server-side после валидации бизнес-события. Live health и test-send требуют Bearer `MAIL_HEALTH_TOKEN`; дополнительно ограничьте маршрут rate limit и сетевым доступом.

## Шаблоны и провайдеры

Рекомендуемое разделение:

- domain event (`lead.accepted`) содержит типизированные данные, а не готовый HTML;
- template registry сопоставляет событие с subject, text и HTML;
- renderer экранирует пользовательские значения и всегда создаёт text-версию;
- provider реализует единый интерфейс `send(message)`; SMTP — реализация по умолчанию;
- queue хранит имя шаблона, версию и нормализованный payload.

Новый шаблон добавляется в registry и покрывается unit-тестом. Новый транспорт (например, локальный Postfix или собственный MTA) добавляется через `MailProvider` без изменения очереди и бизнес-логики. Не храните в очереди SMTP credentials.

## Жизненный цикл очереди

Типичный переход: `queued` → `processing` → `sent`. При временной ошибке: `processing` → `queued` с увеличением `attempts` и `available_at`; после лимита — `dead`. Истёкшая аренда позволяет вернуть зависшее `processing` в работу.

Требования к обработке:

- постановка задания и выдача его ID должны быть атомарными;
- отправка фактически имеет семантику at-least-once, поэтому задаче нужен стабильный idempotency key;
- повторять следует timeout, сетевые ошибки и SMTP `4xx`; постоянные SMTP `5xx` обычно сразу переводятся в `failed`;
- логировать ID задания, шаблон, попытку и код ошибки, но не тело письма, телефон, токены или пароль;
- завершённые записи очищать по `MAIL_RETENTION_MS`.

### Backup и восстановление

SQLite работает в WAL-режиме. Нельзя копировать только основной `.sqlite` во время записи: используйте SQLite Online Backup API/команду `.backup` либо остановите web и worker и сохраните согласованный набор `.sqlite`, `-wal`, `-shm`. Резервируйте named volume регулярно, шифруйте backup и проверяйте восстановление. После restore сначала запустите один worker и проверьте `processing`/истёкшие lease, чтобы не вызвать массовые дубли.

## Health check и тестовая отправка

`docker compose ps` показывает health для web и Mailpit. У worker нет публичного HTTP-порта; его состояние проверяется по отсутствию restart loop, свежему heartbeat/метрикам и движению заданий:

```powershell
docker compose logs --since=10m worker
docker compose exec worker node -e "require('node:fs').accessSync(process.env.MAIL_QUEUE_PATH)"
```

Smoke test выполняется через реальный business API:

```powershell
$body = @{
  name = "Mail smoke test"
  phone = "+7 900 000-00-00"
  message = "Проверка Mailpit"
  deviceType = "laptop"
  contactPref = "phone"
  callback = $false
  consent = $true
  website = ""
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/leads `
  -ContentType "application/json" -Body $body
```

После ответа `201` проверьте задание в очереди и письмо в Mailpit UI: ответ API подтверждает надёжную постановку в очередь, а не окончательную SMTP-доставку.

Публичная readiness-проверка: `GET /api/mail/health`. Проверка SMTP требует `GET /api/mail/health?live=true` с Bearer `MAIL_HEALTH_TOKEN`. Тестовое письмо ставится в очередь только через защищённый `POST`:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/mail/health `
  -Headers @{ Authorization = "Bearer $env:MAIL_HEALTH_TOKEN" } `
  -ContentType "application/json" -Body '{"to":"test@example.com"}'
```

## Production MTA и DNS

Mailpit предназначен только для разработки. В production задайте SMTP-параметры проверенного провайдера, включите TLS и настройте домен отправителя:

- SPF разрешает провайдеру отправлять от имени домена;
- DKIM подписывает письмо ключом домена;
- DMARC задаёт политику и отчёты на основе SPF/DKIM alignment.

Одной SMTP-авторизации недостаточно для доставляемости. Ошибочные SPF/DKIM/DMARC, PTR/rDNS и From alignment приводят к spam/reject. Начинайте DMARC с мониторинга (`p=none`), анализируйте отчёты и только затем ужесточайте политику. Конкретные DNS-записи берите у выбранного провайдера; не копируйте placeholders из примеров.

## Безопасность

- Не коммитьте `.env`, токены, SMTP-пароли, приватные DKIM-ключи и production SQLite.
- Ограничьте права `/data`; web и worker не должны запускаться от root.
- Валидируйте адреса, длину полей и допустимые template names на сервере.
- Экранируйте пользовательский ввод в HTML; не разрешайте произвольные вложения и URL.
- Добавьте rate limit к публичному API, honeypot сохраняйте, а для чувствительных сценариев используйте CAPTCHA.
- Ограничьте размер очереди и письма, SMTP timeout, число повторов и параллелизм.
- Минимизируйте PII в очереди, задайте retention и процедуру удаления по запросу.

## Troubleshooting

**Worker не собирается.** Выполните `npm run build:mail-worker` и проверьте наличие `dist/mail-worker.mjs`. Docker собирает этот артефакт в отдельном build stage.

**`SQLITE_CANTOPEN` / `readonly database`.** Проверьте `MAIL_QUEUE_PATH`, наличие `/data`, результат `data-init` и права UID 1001. Не размещайте очередь во временной файловой системе контейнера.

**Web создаёт задания, worker их не видит.** Оба процесса должны использовать абсолютно одинаковый путь и один named volume. Сравните env внутри контейнеров.

**Нет писем в Mailpit.** Проверьте `MAIL_ENABLED`, `SMTP_HOST=mailpit`, порт `1025`, логи worker и статус задания. UI работает на `8025`, это не SMTP-порт.

**Повторные письма.** Ищите истёкший слишком рано lease, рестарты после фактической отправки до commit и отсутствие idempotency key.

**Очередь постоянно растёт.** Проверьте SMTP connectivity, коды `4xx/5xx`, лимит попыток, размер batch и число worker-ов. Не увеличивайте параллелизм до устранения блокировки провайдера.

**Production-письма попадают в spam.** Проверьте SPF/DKIM/DMARC alignment, репутацию домена/IP, bounce rate, содержимое text/HTML и наличие рабочей ссылки/адреса для ответа.
