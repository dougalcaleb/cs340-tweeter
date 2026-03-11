# Copilot Instructions for Tweeter

## Project Context
- Monorepo with `tweeter-web` (React frontend), `tweeter-shared` (shared domain models/utilities), and `tweeter-server` (backend work in progress).
- The project is late in frontend development and is now transitioning to backend implementation.
- Backend target is AWS, primarily Lambda functions.
- Current frontend/backend behavior is mocked with `FakeData` from `tweeter-shared`.

## Architecture Rules (Important)
- Preserve MVP boundaries:
- React components in `tweeter-web/src/components/**` are the Views.
- TypeScript classes in `tweeter-web/src/presenters/**` are Presenters.
- Domain model classes in `tweeter-shared/src/model/domain/**` are Models.
- Prefer adding backend integration logic behind service classes in `tweeter-web/src/services/**` rather than moving logic into components or presenters.
- Keep presenter/view contracts stable unless a change is explicitly requested.

## Backend Transition Guidance
- Treat existing service methods as transition seams from FakeData to real backend calls.
- Preserve async method signatures and existing return shapes when migrating service implementations.
- Keep `tweeter-shared` as the source of shared request/response and domain types where practical.
- Avoid broad frontend refactors while backend wiring is being introduced.
- New backend-focused work should primarily go into `tweeter-server` and service-integration points in `tweeter-web`.

## FakeData and Mocks
- `FakeData` usage is intentional during transition; replace it incrementally rather than all at once.
- Do not remove FakeData-backed behavior unless the corresponding backend path is implemented and wired.
- Keep temporary/mock behavior functional until replacement is verified.

## Testing and Safety
- Existing frontend tests are not a development focus, and new tests are generally not required unless explicitly requested.
- Do not break existing tests; keep behavior and method contracts compatible.
- For frontend/service/presenter changes, prefer minimal, targeted edits.

## Working Style for Copilot
- Before making sweeping assumptions (API shape, auth flow, Lambda event formats, endpoint contracts, error payloads, deployment details), ask the user explicit clarifying questions.
- When requirements are clear, implement end-to-end changes with minimal disruption.
- Prefer concrete, small commits and avoid unrelated cleanup.

## Build/Run Notes
- If `tweeter-shared` changes, rebuild it before dependent modules.
- Typical local flow:
- Build shared package.
- Build/run `tweeter-web` for UI validation.
- Build/compile `tweeter-server` for backend validation.
