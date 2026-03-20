# Coding Standards — PawTrust

[Source: architecture.md §17]

---

## PHP / Laravel

- **Style:** PSR-12 enforced via PHP CS Fixer; `composer fix` alias in `composer.json`
- **Naming:** PascalCase classes, camelCase methods, snake_case DB column names
- **Controllers:** Thin — validate via `FormRequest`, delegate to Service, return Resource
- **Services:** All business logic here; no Eloquent calls in controllers
- **Models:** Relationships, scopes, casts only — no business logic
- **Migrations:** Descriptive names; never edit committed migrations; always add new ones
- **No `dd()` or `dump()` in committed code**
- **Secrets:** All credentials in `.env` — never hardcoded

### PHP Patterns

```php
// Controllers: thin — validate → service → resource
class InquiryController extends Controller
{
    public function store(SubmitInquiryRequest $request, InquiryService $service): JsonResponse
    {
        $inquiry = $service->create($request->user(), $request->validated());
        return response()->json(['data' => InquiryResource::make($inquiry)], 201);
    }
}

// Services: business logic, no HTTP concerns
class InquiryService
{
    public function create(User $buyer, array $data): Inquiry { ... }
}

// Models: relationships + scopes only
class Listing extends Model
{
    use SoftDeletes;
    protected $casts = ['featured_until' => 'datetime'];
    public function breederProfile(): BelongsTo { ... }
    public function scopeActive(Builder $query): void { $query->where('status', 'active'); }
}
```

---

## TypeScript / React

- **Style:** ESLint (Airbnb config) + Prettier; `npm run lint` enforced in CI
- **Naming:** PascalCase components, camelCase functions/variables, `SCREAMING_SNAKE` for constants
- **Components:** Functional components only — no class components
- **Props:** Explicit TypeScript interfaces for all component props
- **API layer:** All API calls in `src/api/` — never `fetch` directly in components
- **No `any` type** — use proper types or `unknown` with type guards
- **Imports:** Absolute imports from `src/` configured in `tsconfig.json` `paths`

### TypeScript Patterns

```typescript
// Always type component props
interface ListingCardProps {
  listing: Listing
  showVerifiedBadge?: boolean
}

// API calls in src/api/ only
// src/api/listings.api.ts
export const getListings = (params: ListingSearchParams) =>
  axiosClient.get<PaginatedResponse<ListingCard>>('/listings', { params })

// Use TanStack Query for server state
const { data, isLoading } = useQuery({
  queryKey: ['listings', filters],
  queryFn: () => getListings(filters),
})
```

---

## Git

- Feature branches merged via squash-merge (clean main history)
- PR title must follow Conventional Commits format
- No direct pushes to `main` or `staging` — PRs required with at least one review

### Commit Convention

Format: `type(scope): description`

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`

```
feat(inquiries): add contact reveal endpoint
fix(auth): correct JWT expiry header
test(listings): add search filter coverage
chore(deps): update Laravel to 11.x
```

---

## API Response Standard

All API responses use the standard envelope:

```json
{
  "data": {},
  "meta": {},
  "message": "string",
  "errors": {}
}
```

HTTP status codes:

| Code | Meaning             |
| ---- | ------------------- |
| 200  | Success             |
| 201  | Created             |
| 204  | No content (delete) |
| 401  | Unauthenticated     |
| 403  | Forbidden           |
| 404  | Not found           |
| 422  | Validation failed   |
| 429  | Rate limited        |
| 500  | Server error        |

