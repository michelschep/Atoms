# AGENTS.md

> Automatisch geladen door GitHub Copilot CLI bij elke sessie.
> Bevat project-specifieke kennis en conventies.
> De Ralph loop-instructies zitten in `.github/agents/ralph.agent.md`.
> Voeg operationele learnings toe onderaan wanneer je iets nieuws ontdekt.

---

## 🏗️ Tech Stack

- **Taal:** C# / .NET 10 (target `net10.0`)
- **Frontend:** Blazor Server (`src/<App>.Web`)
- **Backend:** ASP.NET Core Web API (`src/<App>.Api`)
- **Database:** EF Core + SQLite (alleen Infrastructure-laag)
- **Tests:** xUnit + Playwright (E2E), bUnit (component)

---

## 📁 Project structuur

```
openspec/
  changes/
    <feature>/
      proposal.md      ← waarom / wat
      specs/           ← requirements
      design.md        ← technische aanpak
      tasks.md         ← implementatie checklist (Ralph leest dit)
  archive/             ← voltooide changes

src/
  <App>.Core/          # Entities, domain interfaces
  <App>.Application/   # CQRS met MediatR
  <App>.Infrastructure/ # EF Core, SQLite
  <App>.Api/           # ASP.NET Core Web API
  <App>.Web/           # Blazor Server frontend

tests/
  <App>.E2ETests/      # Playwright E2E (xUnit)
  <App>.UnitTests/     # Unit tests (xUnit)
```

---

## 🔨 Build & Test

```bash
dotnet build
dotnet test
dotnet test --filter Category=Unit
dotnet test --filter Category=E2E
```

---

## 📐 Conventies

- **Blazor raakt nooit de DB** — altijd via HTTP naar de API
- **API clients achter interface** (`I<App>ApiClient`) voor bUnit mockability
- **API collections null-safe:** altijd `?? []`
- **Enum serialisatie:** `JsonStringEnumConverter` op alle API-projecten
- **Migrations:** altijd `MigrateAsync()` — nooit `EnsureCreated()` buiten tests
- **Aspire service discovery:** nooit service-URLs hardcoden in `appsettings*.json`
- **Rendermode:** `@rendermode="InteractiveServer"` op `<Routes>` en `<HeadOutlet>` in `App.razor`

---

## 🧪 Test conventies

- xUnit voor **alle** tests — nooit NUnit of MSTest
- E2E: Playwright erft van custom `PageTest` base (xUnit, niet NUnit)
- Selectors: `label:has-text(...)` of CSS class selectors — nooit `input[value]`

---

## ⚠️ Bekende valkuilen

- `dotnet new` templates targetten soms een oude TFM — verifieer en update naar `net10.0`
- `App.Api` wordt `Projects.App_Api` in Aspire-gegenereerde code
- Test project naming: `<App>.E2ETests` niet `<App>.Tests.E2E` (triggert gitignore)
- MudBlazor: `AutoGrow` ongeldig op `MudTextField`; `CloseOnOverlayClick` ongeldig op `MudDrawer`

---

## 📝 Operationele learnings

<!-- Voeg ontdekkingen toe. Formaat: "- [YYYY-MM-DD] <wat je leerde>" -->
