# План разработки FunZone → «Kubik» (Phase 1: портфолио → основа продукта)

**Дата:** 2026-10-06 · **Ревизия:** 2 (после раунда критики: архитектор, Ciri, Yennefer)
**Ветка планирования:** `agents-workbench` в старом репозитории (локально, не запушена)
**Источники:** `.agents/research/architect.md` (rev 3, §8 D1–D12 главнее остальных разделов), `design.md` v2, `data.md` v2, `qa.md` v2, `strategy.md` v2. Сводная стратегия — `.agents/strategy.md`.

## Project Objective

Переписать FunZone с нуля в **новом репозитории** как двуязычный (RU↔HE) веб-продукт:
- 7 математических и логических игр на 4 шаблонах механик и общем движке;
- озвучка голосом владельца;
- гостевой режим;
- serverless-приём waitlist и анонимных метрик;
- позже API с аккаунтами родителей;
- AWS, IaC, CI/CD и тесты.

Это даёт сильное full-stack портфолио, параллельную проверку спроса и фундамент продукта без юридического долга перед соавтором.

## Ёмкость и сроки (честно)

| Блок | Разработка | Время владельца (запись, интервью и т. п.) |
|---|---|---|
| **1A** — продукт + лендинг + ingest | ≈ 125 ч | ≈ 30 ч |
| **1A+** — ещё 5 игр | ≈ 22 ч | ≈ 7 ч |
| **1B** — API, аккаунты, RDS | ≈ 68 ч | ≈ 2 ч |
| **Итого** | **≈ 215 ч** | **≈ 39 ч** |

При 7.5 ч в неделю на всё:

| Веха | Неделя (без буфера) | С буфером ×1.3 |
|---|---|---|
| **M1:** лендинг с работающим waitlist, старт интервью | ≈ 6–7 | ≈ 8–9 |
| **M2:** gate по итогам интервью (направление, возраст, формулировки) | ≈ 8–10 | ≈ 11–12 |
| **M3:** релиз 1A — публичный продукт + serverless-бэкенд | ≈ 21 (≈ 5 мес) | ≈ 27 (≈ 6 мес) |
| **M4:** релиз 1B — полный full-stack | ≈ 33 (≈ 7.5 мес) | ≈ 43 (≈ 10 мес) |

При 10 ч в неделю сроки сокращаются примерно на четверть. **Что режем первым, если не успеваем:** WP-16b (проекция контента в БД), G2 и её записи, WP-P (родительский экран) переносится в 1B, Sentry переходит из WP-14 в WP-20b.

## Ключевые технические решения (architect.md §8)

| | Решение |
|---|---|
| D1 | PostgreSQL 17 |
| D2 | AWS `il-central-1` для всего с ПДн; ACM для CloudFront в us-east-1. Это архитектурное решение, а не требование закона **[юрист]** |
| D3 | Drizzle, SQL-миграции в git, только вперёд |
| D4 | Контент — файлы в git (CSV/YAML, ICU, род, никуд), компилируются в статический JSON; в 1B сидятся в БД как проекция |
| D5 | Шрифт Rubik (self-host), Noto Sans Hebrew — ленивый fallback |
| D6 | Контракт QA: `GameModule` = `generateRound`/`isCorrect`/`testkit.solve: Move[]`/`View`, `acceptsMultiple`; движок владеет rng, clock, таймерами и единственным `onFinish` |
| D7 | Звёзды Jony: ★ всегда, ★★ ≥ 60% с первой попытки, ★★★ ≥ 90%; подсказка на родном языке звёзд не снижает (`native_hint`) |
| D8 | В 1B: local-first гость, UUIDv7, `consent_events`, каскадное удаление; **регистрация только по приглашениям** до пакета комплаенса Phase 2 |
| D9 | Новый репозиторий + `PROVENANCE.md`, без `legacy/`; ADR лежат в `docs/adr/` |
| D10 | Для `enabled`-языка каждая фраза записана владельцем (у Polly нет иврита); `beta` допускает Web Speech |
| D11 | 4 шаблона: `choose`, `compare`, `sequence`, `pairs`; `sort` и `grid` — во второй волне |
| D12 | **Serverless ingest в 1A:** Lambda (Function URL + OAC за CloudFront `/api/ingest/*`) + DynamoDB; waitlist с double opt-in (SES) и анонимные счётчики событий без ID, cookie и IP; ≈ $0 в месяц |

## Принципы (не нарушать)

1. **Clean-room.** Ни строчки старого кода, CSS или ассетов. Пишем по спецификациям. `PROVENANCE.md` и `ASSETS.md` ведутся с первого PR.
2. **Игра — это чистые функции и данные.** В `games/**` и `mechanics/**` ESLint запрещает:
   - `Math.random`, `setTimeout`/`setInterval`, `requestAnimationFrame`, `Date.now`/`new Date()`/`performance.now`;
   - `localStorage`/`indexedDB`, `new Audio`/`speechSynthesis`.

   Время, RNG, хранение и звук получаем только от движка.
3. **Мультиязычность — слой ядра.**
   - Отдельные `dir`/`lang` для UI и игры; `<MathExpr>` всегда LTR.
   - ICU-плюралы; род числительных в HE; никуд с нормализацией NFC.
   - Правило `no-literal-string` действует в `app/`, `ui/`, `engine/`, `mechanics/`, `games/`.
4. **Приватность детей by design.**
   - Аккаунт только у взрослого.
   - Гость хранит прогресс только локально.
   - Метрики — анонимные счётчики.
   - Сторонних трекеров нет.
5. **Пакет ≤ 10 ч, одна ветка, один PR, проверяемый DoD.** TDD: QA пишет RED, разработчик делает GREEN, архитектор ревьюит.

## Task List

Сложность: 1 ≈ 2–4 ч, 2 ≈ 5–7 ч, 3 ≈ 8–10 ч. Worker — слот исполнителя в волне (при соло-работе это владелец). DoD для каждого пакета — в разделе «Definition of Done».

### Phase 1A (≈ 125 ч)

| # | Описание | Файлы (новый репо, если не указано) | Сл. | Ч | Worker | Wave |
|---|---|---|---|---|---|---|
| WP-00 | Изоляция legacy: убрать email и хэши из seed, закрыть 3306, README «legacy — не деплоить», архивировать | старый репо: `DB/gamedatabase.sql`, `docker-compose.yml`, `README.md` | 1 | 2 | w-1 | 0 |
| WP-01 | Bootstrap: npm workspaces (`apps/web`, `apps/ingest`, `apps/api`-заглушка, `packages/shared`), Vite + React 18 + TS strict + RR7, Vitest, ESLint (все запреты из принципа 2, `no-only-tests`) / Prettier / stylelint `use-logical`; LICENSE, `PROVENANCE.md`, `ASSETS.md`, `CONTRIBUTING.md`, шаблон PR, branch protection; планы → `docs/`, D1–D12 → `docs/adr/` | корень, `apps/*`, `.github/*`, `docs/*` | 2 | 6 | w-2 | 0 |
| WP-02 | CI: lint, typecheck, unit, build, size-limit (бюджеты), coverage-гейты + diff-coverage + ratchet, `npm audit --omit=dev --audit-level=high` (allowlist со сроком), gitleaks, CodeQL, Dependabot; **Playwright в Docker-образе + 1 smoke-снимок** | `.github/workflows/ci.yml`, `playwright.config.ts` | 2 | 5 | w-1 | 1 |
| WP-03 | Общий контракт + testkit (уровень генератора): `LocaleInfo` (ru, he, en, псевдо `dev`), `LanguagePrefs`, `GameModule`, `Move`, `AnswerEvent`, `Rng`/`Clock`, Fisher–Yates, `starsFor`, `nextDifficulty`; `runGameContract` (генераторные свойства) + сломанные фиктивные игры `choose` и `pairs` | `packages/shared/**` | 2 | 7 | w-2 | 1 |
| WP-10 | AWS static hosting (после O-0): проверка t4g/PG17/SES в `il-central-1` CLI-командами; Terraform: state, S3 + CloudFront OAC, ACM, Route 53, бакет `audio-src`, OIDC-роль, Budgets $5/$10/$20; `deploy-web.yml` | `infra/**`, `.github/workflows/deploy-web.yml`, `docs/aws.md` | 3 | 8 | w-1 | 2 |
| WP-04 | Ядро i18n и RTL: i18next + ICU, реестр локалей, раздельные `dir` UI/игры, `<MathExpr>`, `<Niqqud>` + `compareHe`, Rubik self-host с сабсетами, псевдолокали `en-XA`/`xx-RTL` (только dev), UI-словари RU/HE | `apps/web/src/i18n/**` | 3 | 10 | w-2 | 2 |
| WP-05 | UI kit и токены (направление «Игрушечная геометрия»): токены (strong-цвета ≥ 4.5:1, `--tap-min/kid/young` 48/64/80), Button, ChoiceButton, AppShell, AudioButton, LangToggle, FeedbackBurst, ProgressStars, RoundProgress, EndScreen, NumberPad, **SVG-набор фигур**; dev-витрина | `apps/web/src/ui/**` | 3 | 8 | w-1 | 3 |
| WP-07 | Конвейер контента (D4): `content/` (`games.yaml`, `items/*.csv`, `items_i18n/<lang>/`, `concepts` с `gender`/`forms`) → сборка JSON-пакетов; zod + ICU + NFC + обязательный род в HE; общие ресурсы RU/HE; `content:report`; правило видимости игры | `content/**`, `scripts/content-*.ts`, `apps/web/src/content/**` | 2 | 6 | w-2 | 3 |
| WP-E1 | Ingest-база + события (D12): Terraform (Lambda Function URL + OAC, `/api/ingest/*` в CloudFront, DynamoDB, IAM, concurrency 5), `POST /events` (атомарные счётчики день × событие × бакет), тесты | `apps/ingest/**`, `infra/ingest/**` | 2 | 7 | w-3 | 3 |
| WP-06 | Игровой движок: реестр `import.meta.glob`, GameSession (intro → playing → summary), инъекция rng и clock, `?seed=` в test-сборке, игнор повторного ответа, режимы target/native/bilingual + лестница подсказок, звёзды (D7), `nextDifficulty`, `ProgressStore`, `aria-live`; testkit уровня движка и View + сломанная игра на уровне движка; `_demo` проходит `runGameContract` | `apps/web/src/engine/**`, `src/games/_demo/**` | 3 | 10 | w-1 | 4 |
| WP-E2 | Waitlist (D12): `POST /waitlist` (согласие + версия политики, double opt-in через SES, отписка удаляет запись, пилотный код приглашения), только данные взрослых | `apps/ingest/src/waitlist/**` | 2 | 7 | w-2 | 4 |
| WP-L0 | Статический лендинг RU/HE для взрослых: 2 заголовка (A/B), fake door цены в ₪, `/privacy` (текст из O-8), форма waitlist за флагом (включается после E2) | `apps/web/src/app/landing/**`, `privacy/**` | 1 | 3 | w-3 | 4 |
| WP-09 | Конвейер записи: `audio:todo` (CSV), `audio:build` (trim → loudnorm −16 LUFS → MP3 → sha-имя → манифест), `audio:check` (строгий для `enabled`), бюджет аудио на игру, `docs/audio.md` | `scripts/audio-*.ts`, `docs/audio.md` | 2 | 5 | w-1 | 5 |
| WP-13 | Страницы, онбординг, гость: главная, каталог, страница игры, «Я говорю на… / Я учу…» (предзаполнено из `navigator.language`), 404; IndexedDB-прогресс (`schemaVersion`, миграции, fallback в память); звёзды на карточках; отправка анонимных событий в ingest | `apps/web/src/app/**`, `src/progress/**` | 2 | 8 | w-2 | 5 |
| WP-08 | AudioService: клип → Web Speech (только `beta`) → тишина, субтитры всегда; склейка через AudioContext, preload, mute, первый звук после жеста | `apps/web/src/audio/**` | 2 | 6 | w-1 | 6 |
| WP-11 | Шаблоны `choose` + `compare`, игры Add & Subtract и Compare: уровни согласованы с программой (O-9), View-шаблоны, ICU и никуд, контент ru/he, список фраз | `src/mechanics/{choose,compare}/**`, `src/games/{add-subtract,compare}/**` | 3 | 10 | w-1 | 7 |
| WP-14 | E2E-уровни + наблюдаемость FE: PR-smoke (Chromium mobile), nightly (матрица + WebKit + reduced motion + RTL-снимки), release-прогон, Lighthouse CI, Sentry FE с `beforeSend` без PII | `e2e/**`, `.github/workflows/nightly.yml`, `src/observability/**` | 3 | 8 | w-1 | 8 |
| WP-L | Case study + README: история пивота, RTL-демо, реальные метрики, скриншоты, ADR-ссылки | `apps/web/src/app/case-study/**`, `README.md` | 2 | 5 | w-2 | 8 |
| WP-P | Экран «Для родителей» (локальный, за родительским гейтом): пройденные игры, звёзды, слова на обоих языках, частота подсказок | `apps/web/src/app/parent/**` | 1 | 4 | w-3 | 8 |

### 1A+ и Phase 1B — чередуются (≈ 22 + 68 ч)

| # | Описание | Файлы | Сл. | Ч | Worker | Wave |
|---|---|---|---|---|---|---|
| WP-15 | API foundation: Express 5 + TS, zod-конфиг, пул `pg` с ретраем, ошибки без утечек, pino, helmet, `trust proxy`, rate limit, `/health` + `/ready`, graceful shutdown, Dockerfile arm64, dev-compose `postgres:17` (только localhost); deny-by-default (supertest без БД) | `apps/api/**` | 3 | 10 | w-1 | 9 |
| WP-12 | Count & Say (`choose`): объекты из SVG-набора фигур с родом (עיגול м., קובייה ж.), раскладка без пересечений, озвучка счёта | `src/games/count-say/**` | 1 | 3 | w-2 | 9 |
| G1 | Missing Number (`choose`) | `src/games/missing-number/**` | 1 | 3 | w-3 | 9 |
| WP-17 | Тест-стенд API: Vitest + supertest, сервис Postgres в CI, `migrate` на пустую БД, чистая БД на файл | `apps/api/test/**`, `ci.yml` | 2 | 5 | w-1 | 10 |
| G2 | Shapes & Colors (`choose`) | `src/games/shapes-colors/**` | 1 | 3 | w-2 | 10 |
| WP-16 | Схема (PG17 + Drizzle): users, child_profiles, game_sessions, answer_events, consent_events, policy_documents, stats; UUIDv7; роли `funzone_migrator`/`funzone_app`; фабрики | `apps/api/src/db/**`, `drizzle/**` | 3 | 9 | w-1 | 11 |
| G3 | What Comes Next (шаблон `sequence`) | `src/mechanics/sequence/**`, `src/games/what-next/**` | 2 | 6 | w-2 | 11 |
| WP-18 | Auth родителя: регистрация **по приглашению** (`REGISTRATION_MODE=invite`), вход, httpOnly cookie, `token_version`, CSRF (SameSite=Lax, Origin-check, только JSON), rate limit, `/me`, интерсептор 401; ревью ASVS L1 | `apps/api/src/auth/**`, `apps/web/src/auth/**` | 3 | 10 | w-1 | 12 |
| WP-16b | Seed-проекция контента из git в `items`/`item_translations`/`concepts` (upsert по ключам) | `apps/api/src/db/seed-content.ts` | 1 | 3 | w-2 | 12 |
| G4 | Word Memory (шаблон `pairs`: картинка ↔ слово ↔ звук) | `src/mechanics/pairs/**`, `src/games/word-memory/**` | 2 | 7 | w-3 | 12 |
| WP-21 | Профили детей, согласия, удаление (D8): профиль только вместе с `consent_event`, никнейм из генератора, «Кто играет?», родительский гейт, каскадное удаление; WP-P переходит на серверные данные | `apps/api/src/children/**`, `apps/web/src/parent/**` | 2 | 7 | w-1 | 13 |
| WP-20a | Инфраструктура API (`il-central-1`): VPC без NAT, RDS PG17 `db.t4g.micro` с PITR, EC2 `t4g.micro` с SSM (без SSH), SG только из CloudFront, behavior `/api/*`, SSM Parameter Store; Budgets $15/$35/$50 | `infra/api-host/**` | 3 | 9 | w-2 | 13 |
| WP-19 | Progress API + claim гостя: `POST /api/sync/sessions` (идемпотентный батч), `GET /api/progress`, `RemoteProgressStore`, перенос гостевого журнала в профиль | `apps/api/src/progress/**`, `apps/web/src/progress/**` | 3 | 8 | w-1 | 14 |
| WP-20b | Доставка и эксплуатация API: ECR, `deploy-api.yml` (migrate под `funzone_migrator`, откат), CloudWatch Logs, Sentry BE без PII, health check/alarm, **учения по восстановлению из PITR**, `docs/runbook.md` | `.github/workflows/deploy-api.yml`, `infra/**`, `docs/runbook.md` | 2 | 7 | w-2 | 14 |

**Вторая волна игр (после 1B или в Phase 2):** Sort It (шаблон `sort`, тач + клавиатура в DoD, ≈ 8 ч), Direction Maze (`grid`, «направо» в RTL не зеркалится, ≈ 8 ч).

### Трек владельца (не код, но на критическом пути; ≈ 39 ч)

| # | Что | Когда | Ч |
|---|---|---|---|
| O-0 | Гигиена AWS-аккаунта: MFA root, Identity Center, Anomaly Detection (Budgets создаёт Terraform в WP-10), включить opt-in `il-central-1`, купить домен, уточнить тип free tier | до волны 2 | 2 |
| O-1 | Ответить на «Open decisions» | до волны 0 | 1 |
| O-8 | Черновик политики приватности и согласия на рассылку (RU/HE) для waitlist, включая SES в eu-central-1, если его нет в `il-central-1`; затем для профилей детей **[юрист]** | до волны 4; дополнить до волны 13 | 3 |
| O-4 | Проверка товарного знака и доменов для имени | до волны 4 | 2 |
| O-5 | 10–15 интервью (5–7 семей олим, 5–7 местных): показывать макет или видео, игра не нужна | с 1-го месяца, до M2 | 12 |
| O-6 | Рассылка лендинга в 5–10 групп (FB, Telegram) | после M1 | 2 |
| O-9 | Сопоставить 7 игр с программой ган-хова и 1–2 классов | до волны 7 | 2 |
| O-2 | Спайк записи: 30 фраз HE + RU, замер времени, прослушивание 5 детьми и 1–2 взрослыми носителями иврита | волна 5 | 2 |
| O-3a | Запись общих фраз (числительные с родом, операции, похвала, инструкции) | волна 6 | 4 |
| O-3b | Запись фраз WP-11; перевод HE/RU в `enabled` | волна 7–8 | 2 |
| O-3c | Записи перед каждой игрой 1A+ (≈ 1 ч на игру × язык; числительные уже есть из O-3a) | с волны 8, за волну до игры | 6–8 |
| O-7 | Консультация юриста (приватность, IP, подписки) | до открытой регистрации (Phase 2) | — |

**M2 gate (≈ неделя 8–10):** итоги интервью фиксируют направление по умолчанию (RU→HE / HE→RU), возрастной фокус и формулировки лендинга. Решения 1, 2 и 4 из «Open decisions» до этого предварительные. **Пилот** (4 недели, кружок или программа олим) запускается после WP-11 по пилотным кодам из waitlist.

## Definition of Done (машинно проверяемо)

Общее для каждого PR: CI зелёный; diff-coverage ≥ 85%; нет `only`/`skip`; `PROVENANCE.md` обновлён.

- **WP-00:** `grep -E '\$2[aby]\$|@live\.' DB/` пусто; `docker compose config` без проброса 3306; владелец подтверждает (вывод `aws ec2 describe-instances` или скриншот), что старого API нигде нет, и что пароль сменён; репозиторий archived.
- **WP-01:** `npm ci && npm run lint && npm run typecheck && npm test && npm run build` зелёные; фикстура-нарушитель роняет ESLint **по каждому** запрещающему правилу (тест); `main` защищён; `docs/adr/0001…0012` на месте.
- **WP-02:**
  - намеренно плохой PR краснеет по каждому гейту (типы, lint, coverage ниже порога, size-limit);
  - бюджеты: начальный JS ≤ 150 kB gzip, CSS ≤ 30 kB, Rubik ≤ 60 kB на сабсет и начертание;
  - пороги: engine/logic/games 95/90, FE глобально ≥ 60%, API ≥ 80/70, ratchet (порог не опускается);
  - Playwright в Docker делает 1 стабильный снимок;
  - CI ≤ 10 мин.
- **WP-03:** каждая заложенная ошибка в фиктивных играх `choose` и `pairs` (недетерминизм, нерешаемый раунд, два верных ответа, дубль по тексту в локали, выход за границы сложности, перекос позиции ответа, бесконечный цикл) ловится своим тестом; `solve(round): Move[]` работает и для многошаговой игры; testkit параметризован по difficulty × pair (ru→he, he→ru) × mode; 100% покрытие чистых функций.
- **WP-10:** merge в main выкатывает сайт на HTTPS без ручных шагов; AWS-ключей в GitHub нет (только OIDC); `terraform plan` чистый после apply; тестовый алерт Budgets пришёл; результат проверки сервисов в `il-central-1` записан в `docs/aws.md`.
- **WP-04:**
  - Playwright-снимки: строка RU+HE с никудом в Rubik при 3 размерах, `12 + 7 = ?` внутри ивритского предложения, LangToggle;
  - табличный тест плюралов `n ∈ {0,1,2,3,5,11,12,14,21,22,25,101,111}` против `Intl.PluralRules` для ru/he/en;
  - `compareHe` (ignore/strict) — табличный тест;
  - тест «экран в `en-XA` не содержит текста без псевдомаркеров (кроме allowlist)»;
  - псевдолокали имеют статус `dev` и отсутствуют в прод-сборке (тест).
- **WP-05:** vitest-axe на каждом компоненте витрины в LTR и RTL без нарушений; unit-тест контраста по токенам (все пары текст/фон ≥ 4.5:1); Playwright `boundingBox` ChoiceButton ≥ токена тап-цели; FeedbackBurst выключен при `prefers-reduced-motion`; ноль inline-стилей.
- **WP-07:** невалидный пакет валит сборку; исходник не в NFC → ошибка; варианты одного раунда, совпадающие после удаления никуда, помечаются как дубли; ICU-сообщения компилируются на всех плюральных категориях; каждый HE-concept с числом имеет обе формы рода (тест); отчёт покрытия в summary CI; таблицы RU и HE вычитаны (отметка в PR).
- **WP-E1:** `POST /events` с ID, IP или произвольным полем отклоняется (тест схемы); счётчики атомарны (тест на параллельные вызовы); Terraform `plan` чистый; функция недоступна в обход CloudFront (OAC, тест 403).
- **WP-06:** testkit движка зелёный на `_demo` и красный на сломанной игре по каждому свойству (однократный ответ, ровно один `onFinish`, `getTimerCount() === 0` после unmount с fake clock, `aria-live` объявляет результат, accessible name у вариантов, управление с клавиатуры, предсказуемый фокус, pseudo и bidi); `?seed=` даёт детерминированный раунд; добавление игры не требует правок вне её папки.
- **WP-E2:** без согласия — 400; запись неактивна до подтверждения по ссылке; отписка физически удаляет запись (тест); письмо содержит ссылку на `/privacy`; повторная подписка идемпотентна; в DynamoDB нет полей, кроме email, языка, согласия с версией, кода пилота и времени; регион SES зафиксирован (il-central-1 или eu-central-1) и совпадает с `/privacy`.
- **WP-L0:** Lighthouse на `/` (mobile): Accessibility ≥ 95, Performance ≥ 90; форма скрыта, пока флаг выключен; A/B-вариант пишется анонимным событием; `/privacy` на RU и HE.
- **WP-09:** повторный `audio:build` без изменений ничего не меняет (детерминированные хэши); пропущенный клип для `enabled`-языка валит CI, для `beta` — предупреждение; бюджет аудио на игру проверяется.
- **WP-13:** unit на `fake-indexeddb`: миграция v1→v2, повреждённые данные → сброс без падения, недоступный IndexedDB → fallback в память; e2e «reload сохраняет звёзды»; F5 на `/play/<slug>?learn=he` остаётся на месте; ≤ 3 тапа до первого вопроса при первом визите и 1 тап при повторном (e2e).
- **WP-08:** юнит-тесты цепочки fallback с моками; **Playwright в Chromium и WebKit:** до жеста звука нет, после тапа клип играет (`currentTime > 0`), без клипа видны субтитры; склейка «3 + 4» без щелчков (ручная проверка в PR).
- **WP-11:** `runGameContract` зелёный во всех комбинациях pair × mode × difficulty; property-тест «верный ответ всегда среди вариантов, варианты уникальны»; генераторы ≥ 95/90; обе игры проходятся до звёзд в RU→HE и HE→RU; в статусе `beta` до O-3b, затем `enabled` и строгий `audio:check`.
- **WP-14:**
  - **PR-smoke** (блокирует): гость до первого вопроса, одна игра до звёзд в обоих направлениях, reload сохраняет прогресс, axe на `/`, каталоге и игре в обоих направлениях.
  - **Nightly:** 2 игры × 2 направления × 3 режима, WebKit, reduced motion, RTL-снимки.
  - **Release:** nightly-набор 10 раз подряд без retries.
  - **Lighthouse CI:** медиана 3 прогонов.
  - **Sentry:** `beforeSend` вычищает никнейм, id и URL-параметры (unit); ни один e2e-запрос к Sentry их не содержит.
- **WP-L:** страница читается за 2 минуты; все метрики реальные (из CI, Lighthouse, ingest и AWS Cost Explorer); скриншоты в README актуальны.
- **WP-P:** вход только через гейт (тест: случайные тапы не проходят); данные берутся только из локального store; axe без нарушений.
- **WP-15:** при остановленной БД `/ready` отвечает 503, после рестарта API восстанавливается сам; deny-by-default: неизвестный маршрут и маршрут без политики → 401/404 (supertest); rate limit за прокси считает реальный IP (тест с `X-Forwarded-For`).
- **WP-17:** `test:api-int` зелёный в CI; повторный `migrate` — no-op.
- **WP-16:** `migrate` на пустой БД зелёный, тест-снимок схемы; иврит с никудом, кириллица и emoji в `nickname` сохраняются без искажений; у таблиц детей стоит `ON DELETE CASCADE` (тест на схему).
- **WP-16b:** повторный seed ничего не меняет; FK `answer_events.item_key` валиден.
- **WP-18:** тесты регистрации (только с инвайтом), логина, `/me`, logout, 429, инвалидации по `token_version`, CSRF (чужой Origin → 403), постоянного времени ответа; токенов в `localStorage` нет; ревью ASVS L1 в PR.
- **WP-21:** профиль без `consent_event` не создаётся; **IDOR:** родитель A получает 404 на ребёнка и прогресс родителя B (матрица); удаление аккаунта: count строк до и после по всем таблицам ребёнка = 0.
- **WP-20a:** `terraform plan` чистый; RDS без публичного доступа; SG пускает трафик только из prefix list CloudFront; NAT отсутствует (проверка в плане).
- **WP-19:** повторный батч не меняет агрегаты; ответ `{accepted, rejected[]}`; e2e «гость сыграл → инвайт-регистрация → прогресс на месте».
- **WP-20b:** `/api/ready` через CloudFront отвечает 200; деплой и откат проверены; **восстановление из PITR в новый инстанс выполнено** и записано в runbook; прогноз Budgets ≤ $35.
- **Игры G1–G4, WP-12:** `runGameContract` зелёный во всех комбинациях; 2–5 доменных тестов (WP-12 — нет пересечений bbox на 1000 seed и выбор формы числительного по роду; G1 — ряды корректны; G3 — нет неоднозначных последовательностей; G4 — решаемость и нет дублей пар); записи из O-3c есть, язык в `enabled`.

## Risk Register

| Риск | L | I | Митигация |
|---|---|---|---|
| Использование кода соавтора в коммерческом продукте | M | H | Новый репозиторий, clean-room, `PROVENANCE.md`; по желанию письменное подтверждение от соавтора; **[юрист]** до Phase 2 |
| В старом репозитории публично лежат эксплуатируемый API и хэш пароля | H | M | WP-00 в волне 0, смена пароля, подтверждение, что старого API нигде нет |
| Срыв графика: часы владельца + 5 ч в неделю вместо 7.5 | H | M | Время владельца учтено; вехи M1–M4; список резки; ретроспектива раз в месяц |
| Валидация опоздает относительно сборки | M | H | Лендинг с waitlist к ≈ неделе 6–7 (M1), интервью с 1-го месяца, gate M2 |
| Запись озвучки дольше и сложнее (род HE, падежи RU, склейка) | M | H | Спайк O-2 до WP-11; фразы-«кирпичики»; статус `beta` разрешает merge до записи |
| Неверный рендер никуда и bidi | M | M | Rubik проверен fontTools; снимки в WP-04; прослушивание и проверка носителями иврита |
| Контракт не подходит для многошаговых механик | M | H | `solve: Move[]` и фиктивная `pairs`-игра уже в WP-03 |
| Флейки e2e и снимков (шрифты, ОС) | M | M | Docker-образ Playwright; retries=1 только для e2e; карантин ≤ 1 недели |
| Моки аудио и IndexedDB скрывают поломки на iOS | M | M | Тесты в реальных Chromium и WebKit (WP-08, WP-13); ручной чек-лист на iPad в DoD релиза |
| Неожиданный счёт AWS или ошибки IAM | L | H | Budgets по фазам; без NAT, ALB и Multi-AZ; OIDC без долгоживущих ключей; concurrency limit у Lambda |
| Правовые требования (Поправка 13, COPPA, закон о спаме) | M | H | Минимизация данных; гость только локально; double opt-in; регистрация по инвайтам до юриста и пакета комплаенса |
| Название занято, нужен ребрендинг | M | L | Имя — одна константа плюс ассеты; O-4 до лендинга |
| Sort It и Direction Maze (вторая волна): тач и клавиатура, RTL-направления | M | M | DoD с e2e на мобильном viewport и тестом «направо не зеркалится» |

## Wave Plan

Правила: ≤ 3 задачи на волну; зависимости только из более ранних волн; рискованное — раньше. Distinguished Engineer и QA работают через все волны, воркеры меняются.

| Wave | Задачи | Трек владельца | Обоснование |
|---|---|---|---|
| 0 | WP-00, WP-01 | O-1, начало O-5 | Безопасность legacy и фундамент |
| 1 | WP-02, WP-03 | O-0 | Task 0: CI и контракт с testkit |
| 2 | WP-10, WP-04 | O-8 (waitlist), O-4 | AWS и самый рискованный слой (RTL, никуд) — рано |
| 3 | WP-05, WP-07, WP-E1 | O-5 | UI kit, контент, serverless-события |
| 4 | WP-06, WP-E2, WP-L0 | O-5 | Движок; waitlist + лендинг → **M1** |
| 5 | WP-09, WP-13 | O-2, O-6 | Конвейер записи; страницы и гость; **M2 gate** |
| 6 | WP-08 | O-3a, O-9 | Аудио в движке, запись общих фраз |
| 7 | WP-11 | O-3b | Первая пара игр валидирует контракт; затем пилот |
| 8 | WP-14, WP-L, WP-P | O-3c (для WP-12, G1) | E2E, case study, экран родителя → **M3: релиз 1A** |
| 9 | WP-15, WP-12, G1 | O-3c | Старт 1B с чередованием игр |
| 10 | WP-17, G2 | O-3c | Тест-стенд API до схемы |
| 11 | WP-16, G3 | O-3c | Схема PG17 |
| 12 | WP-18, WP-16b, G4 | O-3c, O-8 (профили) | Auth с ревью безопасности |
| 13 | WP-21, WP-20a | | Профили и согласия; инфраструктура API |
| 14 | WP-19, WP-20b | | Синхронизация; доставка и эксплуатация → **M4: релиз 1B** |

## Branch Strategy

**Одна ветка на задачу** (выбор владельца). Trunk-based в **новом** репозитории:
- ветка `wp/NN-slug` или `g/NN-slug` (например, `wp/04-i18n-rtl`, `g/03-what-next`), живёт ≤ 2 недель;
- PR в защищённый `main`, squash-merge, заголовок в формате Conventional Commits, шаблон PR с DoD и разделом «как проверить»;
- обязательны зелёные `ci.yml` и PR-smoke;
- `main` всегда деплоится, незаконченное скрыто флагами (`LocaleInfo.status`, видимость игры по покрытию контента, флаг формы waitlist, `REGISTRATION_MODE`);
- при агентном исполнении каждая задача получает свой worktree от актуального `main`.

WP-00 — единственный PR в **старый** репозиторий. Планы и ADR переезжают в `docs/` нового репозитория в рамках WP-01.

## Dependencies Map

```
WP-00 — независим
WP-02 --> WP-01            WP-03 --> WP-01
WP-10 --> WP-02, O-0       WP-04 --> WP-03
WP-05 --> WP-01, WP-04     WP-07 --> WP-04
WP-E1 --> WP-10
WP-06 --> WP-03, WP-04, WP-05
WP-E2 --> WP-E1            WP-L0 --> WP-10, WP-03 (форма за флагом до WP-E2), O-8
WP-09 --> WP-07 (+ бакет audio-src из WP-10)
WP-13 --> WP-05, WP-06, WP-07, WP-E1
WP-08 --> WP-06, WP-09
WP-11 --> WP-06, WP-07, WP-08, WP-09 (+ O-3a; O-3b до enabled)
WP-14 --> WP-10, WP-11, WP-13
WP-L  --> WP-13, WP-E1 (метрики дописываются на релизе)  WP-P --> WP-13
WP-15 --> WP-01, WP-02
WP-12, G1, G2 --> WP-11 (шаблон choose)    G3, G4 --> WP-06, WP-07
WP-17 --> WP-15            WP-16 --> WP-15, WP-17, WP-07
WP-16b --> WP-16           WP-18 --> WP-15, WP-16, WP-17
WP-21 --> WP-18            WP-20a --> WP-10, WP-15, WP-16
WP-19 --> WP-13, WP-16b, WP-21          WP-20b --> WP-20a
```

## Success Criteria

**M1 (лендинг):** лендинг RU/HE на своём домене; waitlist с double opt-in работает; A/B и fake door пишутся анонимными счётчиками.

**M3, релиз 1A:**
- гость доходит до первого вопроса за ≤ 3 тапа при первом визите и за 1 при повторном;
- 2 игры проходятся до экрана звёзд в RU→HE и HE→RU во всех режимах; HE и RU в статусе `enabled` (каждая фраза записана);
- CI блокирует merge по всем гейтам из DoD WP-02; PR-smoke зелёный; release-прогон nightly-набора 10 раз подряд без retries; axe без serious/critical;
- Lighthouse (mobile, медиана 3): Accessibility ≥ 95, Performance ≥ 90 на `/` и в игре;
- Terraform `plan` чистый, AWS-ключей в GitHub нет, Budgets настроены, стоимость ≤ $3 в месяц;
- ручной чек-лист: VoiceOver на iPad, NVDA, беззвучный режим iOS, RTL глазами носителя;
- README, case study, `PROVENANCE.md` и ADR готовы; старый репозиторий архивирован.

**M4, релиз 1B:**
- родитель регистрируется по инвайту, прогресс гостя переносится без дублей (e2e);
- матрица авторизации и IDOR зелёные; deny-by-default подтверждён; профиль ребёнка создаётся только с согласием, удаление каскадное;
- API за CloudFront (EC2 + RDS PG17 в `il-central-1`): деплой и откат проверены, **восстановление из PITR выполнено** и описано в runbook; прогноз Budgets ≤ $35 в месяц (≈ $5–8 на free tier);
- 7 игр на 4 шаблонах; API-покрытие ≥ 80/70;
- **публичная регистрация выключена** до пакета комплаенса Phase 2 (retention, экспорт, журнал доступа, юрист).

**Процесс:** все PR смержены в `main` через ветку на задачу; в Risk Register нет открытых рисков с High impact без митигации; `AGENTS.md` отмечен complete.

## Open decisions (нужен ответ владельца)

| # | Вопрос | Рекомендация совета | Блокирует |
|---|---|---|---|
| 1 | Направление пары по умолчанию: RU→HE, HE→RU или обе | Обе (одни данные, два макета); финально на M2 | WP-11 (предварительно) |
| 2 | Обращение к ребёнку на иврите: по роду или нейтрально | Нейтральные формы; род — опция профиля в 1B; финально на M2 | WP-07 |
| 3 | Никуд по умолчанию | Включён для изучающих иврит и для 4–6 лет | WP-04 |
| 4 | Возрастной фокус MVP | 4–7 (ган-хова, 1–2 класс); финально на M2 | WP-11 |
| 5 | LICENSE нового репозитория | «All rights reserved» (source-available) | WP-01 |
| 6 | Имя продукта | Kubik (рабочее), после O-4 | WP-L0 |
| 7 | Тип AWS-аккаунта, покупка домена | Домен купить (~$15 в год) | O-0, WP-10 |
| 8 | Переписывать ли историю старого репозитория (хэш в `b122762`) | Нет; архивировать и сменить пароль | WP-00 |
| 9 | Просить ли у соавтора письменное подтверждение | По желанию: это самая дешёвая страховка | Phase 2 |
| 10 | Маскот и иллюстрации | Персонаж из геометрических фигур, SVG-набор из WP-05 | WP-05 |
| 11 | PostgreSQL 17 и регион `il-central-1` (дороже на ~10–25%) | Да (D1, D2) | WP-15+ |
| 12 | Serverless ingest (Lambda + DynamoDB + SES) в 1A | Да (D12) | WP-E1 |
