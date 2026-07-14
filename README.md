# rolnopolTests

Framework testowy Playwright + TypeScript dla aplikacji [Rolnopol](https://github.com/jaktestowac/rolnopol).

## Stos technologiczny

| Narzędzie | Wersja | Zastosowanie |
|---|---|---|
| `@playwright/test` | 1.50+ | runner, assertions, fixtures, mocking, tracing |
| `TypeScript` | 5.7+ | typizacja, lepsza detekcja błędów |
| `ESLint` + `@typescript-eslint` | 9 / 8 | analiza statyczna (flat config) |
| `Prettier` | 3 | formatowanie kodu |
| `dotenv` | 16 | konfiguracja środowisk przez `.env` |

## Architektura

Projekt dzieli się na trzy warstwy:

- `src/` - abstrakcja: Page Objects, helpery API, fixtures, dane testowe
- `tests/` - pliki testów (ui / api / integration)
- `playwright.config.ts` - konfiguracja środowisk, projektów i raportowania

### Kluczowe decyzje

**Page Object Model** - każda strona UI ma klasę dziedziczącą po `BasePage`. Selektory i akcje są w POM, a nie rozrzucone po testach.

**Warstwa API** - `AuthApi`, `FinancialApi`, `FarmApi` dziedziczą po `BaseApi`. Testy nie wywołują żądań HTTP bezpośrednio.

**Playwright Fixtures** - `src/fixtures/fixtures.ts` wstrzykuje POM, helpery API i token demo (`demoToken`) do testów. Token jest tworzony przed testem i usuwany po jego zakończeniu.

**Dane testowe** - wszystkie dane (kredencjały, mocki) są w `src/data/`. Nic nie jest zakodowane bezpośrednio w plikach testów.

**Konfiguracja** - `BASE_URL` pochodzi ze zmiennej środowiskowej. Kolejność: `.env.local` > `.env` > domyślne `http://localhost:3000`.

## Struktura projektu

```
rolnopolTests/
├── .github/
│   └── workflows/ci.yml           # GitHub Actions + Docker service
├── src/
│   ├── pages/
│   │   ├── base.page.ts           # klasa bazowa
│   │   ├── login.page.ts          # /login.html
│   │   └── home.page.ts           # /index.html
│   ├── api/
│   │   ├── base.api.ts            # get/post helpers
│   │   ├── auth.api.ts            # login, logout, profile, healthcheck
│   │   ├── farm.api.ts            # fields, animals, staff, marketplace, statistics
│   │   └── financial.api.ts       # account, transactions
│   ├── fixtures/
│   │   └── fixtures.ts            # rozszerzony `test` z POM, API helpers, demoToken
│   └── data/
│       └── users.ts               # dane demo i błędne
├── tests/
│   ├── ui/
│   │   ├── auth.spec.ts           # sciezka uzytkownika (login, nawigacja, logout)
│   │   └── home.spec.ts           # strona glowna i nawigacja po funkcjach farmy
│   ├── api/
│   │   ├── farm.api.spec.ts       # fields, animals, staff, marketplace, statistics
│   │   └── financial.api.spec.ts  # account, transactions, healthcheck
│   └── integration/
│       └── statistics.mock.spec.ts  # frontend z mockowanym API statystyk
├── .env.example
├── .gitignore
├── eslint.config.mjs
├── .prettierrc.json
├── tsconfig.json
├── playwright.config.ts
└── package.json
```

## Uruchomienie

### Wymagania

- Node.js v22+
- uruchomiona aplikacja Rolnopol

Najszybszy start przez Docker:

```bash
docker run -p 3000:3000 -d jaktestowac/rolnopol
```

Albo lokalnie z kodu:

```bash
git clone https://github.com/jaktestowac/rolnopol && cd rolnopol
npm i && npm run start
```

### Instalacja frameworka

```bash
cd rolnopolTests
npm install
npx playwright install --with-deps chromium
```

### Uruchamianie testów

```bash
npm test                   # wszystkie testy
npm run test:ui            # testy UI
npm run test:api           # testy API
npm run test:integration   # testy integracyjne
npm run test:headed        # z widoczna przegladarka
npm run test:debug         # tryb debug
npm run report             # otwiera HTML report
```

### Konfiguracja srodowiska

```bash
cp .env.example .env.local
# Ustaw BASE_URL jesli aplikacja nie dziala pod localhost:3000
```

### Linting i formatowanie

```bash
npm run lint          # ESLint
npm run lint:fix      # auto-fix
npm run format        # Prettier
npm run type-check    # tsc --noEmit
```

## Testy

### UI (`tests/ui/`)

**auth.spec.ts** - sciezka uzytkownika:

- login przekierowuje poza strone logowania
- po zalogowaniu dostep do strony finansow (`/financial.html`)
- po zalogowaniu dostep do mapy pol (`/fieldmap.html`)
- zle haslo zatrzymuje uzytkownika na stronie logowania z komunikatem bledu
- wylogowanie unieważnia token sesji (weryfikacja przez API)

**home.spec.ts** - strona glowna i nawigacja:

- strona wyswietla wszystkie 5 blokow statystyk farmy
- tytul strony zawiera "Rolnopol"
- zalogowany uzytkownik ma dostep do strony finansow
- zalogowany uzytkownik ma dostep do marketplace
- zamockowane dane statystyk wyswietlaja sie w DOM

### API (`tests/api/`)

**farm.api.spec.ts** - domeny farmy:

- `GET /api/v1/statistics` dziala bez tokenu (endpoint publiczny)
- statystyki zwracaja nieujemne liczby dla 5 metryk (users, farms, area, staff, animals)
- `GET /api/v1/fields`, `/animals`, `/staff`, `/marketplace` wymagaja tokenu (401/403 bez)
- zalogowany uzytkownik dostaje liste pol i zwierzat z kodem 200

**financial.api.spec.ts** - finanse:

- `GET /api/v1/healthcheck` zwraca 200
- `GET /api/v1/financial/account` wymaga tokenu
- odpowiedz konta jest niepustym obiektem
- saldo konta jest liczba >= 0
- `GET /api/v1/financial/transactions` wymaga tokenu

### Integracyjne z mockami (`tests/integration/`)

**statistics.mock.spec.ts** - strona glowna z mockowanym API:

- poprawne dane wyswietlaja sie we wszystkich 5 blokach
- blad 500 nie crashuje strony (graceful fallback)
- zerowe wartosci nie generuja NaN ani undefined w DOM
- duze liczby sa skracane do K/M przez formatter frontendu

## CI/CD

GitHub Actions uruchamia testy przy każdym push i PR. Aplikacja Rolnopol startuje jako Docker service z health-checkiem. Raporty HTML i wyniki testów sa dostepne jako artefakty przez 7 dni.

Konfiguracja w `.github/workflows/ci.yml`.

## Zalozenia i ograniczenia

- Aplikacja musi dzialac pod `BASE_URL` (domyslnie `http://localhost:3000`)
- Demo credentials (`demo@example.com` / `demo123`) musza byc w bazie danych aplikacji
- Chaos Engine moze wprowadzac losowe bledy - w CI ustawiono `retries: 2`
- Testy integracyjne uzywaja `page.route()` i nie wymagaja zadnych zmian w aplikacji

