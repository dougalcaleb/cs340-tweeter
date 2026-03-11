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

## AWS SAM Deployment (`tweeter-server`)
- The backend is defined in `tweeter-server/template.yaml` using AWS SAM (`AWS::Serverless-2016-10-31`).
- All Lambda functions run on **Node.js 24.x** and share code deployed from `./dist/` plus a shared dependency layer at `./layer/`.
- The API is an `AWS::Serverless::Api` resource named `tweeterApi`, deployed to the `prod` stage with CORS `*` and an API Gateway Swagger/OpenAPI definition inline in the template.
- **Every new endpoint requires three coordinated changes in `template.yaml`:**
  1. A `paths` entry under `tweeterApi.Properties.DefinitionBody.paths` (defines the Swagger route and wires the Lambda ARN).
  2. An `AWS::Serverless::Function` resource (defines the Lambda, its handler, policies, and which API path/method it handles).
  3. The `uri` in the path entry must reference the function resource name in the same template via `${FunctionName.Arn}`.
- **Handler file naming convention:** `handlers/<domain>/<HandlerName>.<exportedFn>` relative to `dist/`. Example: `Handler: handlers/users/UserGetHandler.userGetHandler` maps to `src/handlers/users/UserGetHandler.ts` exporting `userGetHandler`.
- **Error → HTTP status code mapping** is regex-based via API Gateway. Throw errors whose messages contain these substrings to produce the corresponding status:
  - `bad-request` → 400
  - `unauthorized` → 401
  - `internal-server-error` → 500
  - (default, no match) → 200
- **Request body:** API Gateway passes the raw JSON body to Lambda via `$input.json('$')`. The Lambda receives a plain object; no event envelope unwrapping needed.
- All Lambda functions share a common set of IAM policies (`AWSLambdaBasicExecutionRole`, `AmazonDynamoDBFullAccess`, `AmazonS3FullAccess`, `AmazonSQSFullAccess`, etc.) defined in the `x-common-policies` metadata anchor.
- **DynamoDB tables** are also defined in the template. When adding a table, define its `AttributeDefinitions`, `KeySchema`, and any `GlobalSecondaryIndexes` there. Table names used in code must match `TableName` values in the template.
- **SQS queues** are present but commented out; they become relevant in Milestone 4. Do not uncomment or reference them before then.
- Deploy with `sam build` then `sam deploy`. Compile TypeScript first (`npm run compile` inside `tweeter-server`) so `./dist/` is up to date before running SAM commands.

## Build/Run Notes
- If `tweeter-shared` changes, rebuild it (`npm run build` inside `tweeter-shared`) before dependent modules.
- Typical local flow:
  1. Build shared: `cd tweeter-shared && npm run build`
  2. Build/run frontend: `cd tweeter-web && npm run build` (or `npm start` for dev server)
  3. Compile backend: `cd tweeter-server && npm run compile`
  4. Deploy backend: `sam build && sam deploy` from `tweeter-server/`
