# Prayer App ICCEC — AI Coding Agent Instructions

## Project Overview
**Cenacle (Upper Room)** — an offline-first, multi-language prayer and daily readings app for ICCEC Europe. Built with Expo SDK 54, React Native 0.81.5, TypeScript (strict), React Navigation v6, and i18n-js. No backend; all content lives in local JSON files.

## Architecture

### Service Layer (`src/services/`)
- **`DataService`** — wraps `LocalDataSource` which implements the `DataSource` interface. This abstraction exists to allow future API migration without changing consumers.  
  _Rule:_ always interact with data through `DataService`, never import JSON files directly in screens/components.
- **`LocalizationService`** — singleton (`LocalizationService.getInstance()`). Handles device language detection, i18n-js configuration, and `SupportedLanguage` resolution.
- **`AsyncStorageService`** — AsyncStorage wrapper. Keys are namespaced under `@prayer_app/` (see `STORAGE_KEYS` in `src/types/Settings.ts`).

### Data Files (`src/data/`)
```
prayers/        → {lang}.json — Prayer[] arrays (13 languages)
readings/       → {lang}.json + {lang}_new.json — en/tl/et have _new suffix (updated schema)
devotions/      → en.json (raw entries) + devotionBuilder.ts (assembles ICCEC liturgy)
lectionary/     → lectionary2026.ts — the 2026 ICCEC lectionary entries
translations/   → {lang}.json — UI string keys (13 languages)
```
**Critical:** `en_new.json`, `tl_new.json`, `et_new.json` are the canonical reading files for those languages. The non-suffixed versions are legacy; import only `_new` for en/tl/et in `DataService.ts`.

### Devotion Assembly
`devotionBuilder.ts` dynamically builds `DevotionDay` objects by combining:
1. `lectionary2026.ts` entries (date-keyed scripture references)
2. Fixed ICCEC liturgical prayers looked up from `prayers/{lang}.json` by ID
3. `getLiturgicalSeason()` from `src/utils/dateUtils`

Do not hand-write devotion JSON — use `buildDevotion()` / `buildDevotionDay()`.

### Supported Languages
```typescript
type SupportedLanguage = 'en' | 'tl' | 'et' | 'es' | 'it' | 'fr' | 'de' | 'pl' | 'ru' | 'nl' | 'pt' | 'sv' | 'ro';
```
When adding a new language, you must add files in **all four** data folders (`prayers/`, `readings/`, `devotions/`, `translations/`) and update both `DataService.ts` and `LocalizationService.ts` maps.

### Navigation
- **Root Stack** (`AppNavigator`): `Main` (TabNavigator) + `PrayerDetail` (push-over card)
- **Bottom Tabs** (`TabNavigator`): Home, Daily Readings, Daily Devotions, Prayers, Settings
- Navigation types are in `src/types/Navigation.ts`.

### Hooks (`src/hooks/`)
| Hook | Purpose |
|---|---|
| `useData` | Loads prayers/readings/devotions via `DataService` |
| `useLocalization` | Exposes `t()`, current language, `setLanguage()` |
| `useSettings` | Reads/writes `UserSettings` via `AsyncStorageService` |
| `useTheme` | Returns active `Theme` object (light/dark + liturgical season colors) |

**Stale-closure pattern:** `useData` uses `useRef` (not `useState`) for `lastLoadedLanguage` to avoid stale-closure caching bugs when switching languages back and forth. Follow this pattern for any hook-level language tracking.

### Theme System
`src/styles/theme.ts` exports `lightTheme` / `darkTheme`. Theme mode is resolved in order: user setting → system `colorScheme`. `useTheme` also overlays liturgical season color palettes. Always use `theme.colors.*` tokens — never hardcode colors.

## Developer Workflows

```bash
npm start                   # Expo dev server
npm run type-check          # tsc --noEmit (run before PRs)
npm run lint                # ESLint check
npm run lint:fix            # ESLint auto-fix
npm run check-production    # node check-production-ready.js — validates release readiness
npm run build:all           # EAS build for iOS + Android
```

## Key Conventions

- **Offline-first:** All data must be available without a network call. Never add a screen that requires a live API without an offline fallback.
- **Prayer IDs are cross-language:** `getMappedPrayerId()` and `getAllEquivalentPrayerIds()` in `src/utils/prayerMapping.ts` translate IDs between language variants — use these when navigating to a prayer in a different language.
- **Error boundaries:** Wrap new screen trees in `<ErrorBoundary>` from `src/components/common/ErrorBoundary.tsx`.
- **Font sizes:** Use `FontSize` enum (`small | medium | large | extra_large`) from `src/types/Settings.ts`; never add ad-hoc numeric sizes.
- **`DataSource` interface:** If adding a new data method, declare it in the `DataSource` interface first, then implement in `LocalDataSource`.

## Reference Files
- Data types: `src/types/Prayer.ts`, `src/types/Reading.ts`, `src/types/Devotion.ts`, `src/types/Settings.ts`
- Liturgical logic: `src/utils/dateUtils.ts`, `src/data/lectionary/lectionary2026.ts`
- Design tokens: `src/styles/colors.ts`, `src/styles/typography.ts`, `src/styles/spacing.ts`


## Universal Agent Instructions

### Workflow Orchestration

#### 1. Plan Node Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

#### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

#### 3. Self-Improvement Loop

- After ANY correction from the user: update tasks/lessons.md with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

#### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

#### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

#### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

---

### Task Management

1. _Plan First_: Write plan to tasks/todo.md with checkable items
2. _Verify Plan_: Check in before starting implementation
3. _Track Progress_: Mark items complete as you go
4. _Explain Changes_: High-level summary at each step
5. _Document Results_: Add review section to tasks/todo.md
6. _Capture Lessons_: Update tasks/lessons.md after corrections

---

### Core Principles

- _Simplicity First_: Make every change as simple as possible. Impact minimal code.
- _No Laziness_: Find root causes. No temporary fixes. Senior developer standards.
- _Minimal Impact_: Changes should only touch what's necessary. Avoid introducing bugs.

---

### CRITICAL REQUIREMENTS FOR ALL CODE

#### 1. DEFENSIVE PROGRAMMING

- Never trust external input - validate everything
- Always handle null/undefined with nullish coalescing (??) and optional chaining (?.)
- Use TypeScript strict mode with no 'any' types
- Implement proper error boundaries and try-catch blocks
- Validate all API responses before using
- Sanitize all user inputs
- Use assertion functions for runtime type checking
- Implement circuit breakers for external services
- Always provide fallback values

#### 2. BACKWARD COMPATIBILITY

- Support iOS 15.1+ (Expo SDK 54 minimum) and Android 8+ (API 26+)
- Use polyfills for newer JavaScript features
- Check feature availability before using (Platform.Version checks)
- Maintain API versioning for backend changes
- Use feature flags for gradual rollouts
- Store schema versions for local data migrations
- Support older Expo SDK versions where possible

#### 3. MODERN UI/UX STANDARDS

- Follow Material Design 3 and iOS Human Interface Guidelines
- Implement skeleton loading states (never show blank screens)
- Use optimistic updates for better perceived performance
- Add haptic feedback for important actions
- Implement pull-to-refresh on all lists
- Show meaningful empty states with actions
- Use micro-animations for state changes (max 300ms)
- Ensure touch targets are minimum 44x44px
- Support dark mode throughout
- Implement proper keyboard handling and avoidance

#### 4. CODE DOCUMENTATION

- JSDoc comments for all functions, classes, and complex types
- Inline comments explaining "why" not "what"
- README in each feature folder
- Type documentation with examples
- Document all edge cases handled

#### 5. PERFORMANCE OPTIMIZATION

- Memoize expensive computations (useMemo, useCallback, React.memo)
- Use FlashList instead of FlatList for long lists
- Implement virtualization for large datasets
- Lazy load screens and heavy components
- Optimize images (WebP, proper sizing, caching)
- Minimize re-renders with proper state management
- Use Hermes engine optimizations
- Bundle splitting for web
- Preload critical data

#### 6. ROBUSTNESS

- Implement retry logic with exponential backoff
- Queue offline actions automatically
- Handle all network states gracefully
- Implement proper session management
- Add comprehensive logging (without PII)
- Monitor performance metrics
- Graceful degradation when features unavailable