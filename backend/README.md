# SafeOps Base Backend

NestJS 11, TypeScript strict, PostgreSQL 16 and TypeORM (migrations only).
Use pnpm 10.34.9, matching the root workspace. Install local dependencies from
the repository root; run backend scripts with `corepack pnpm --dir backend <script>`.
The backend lockfile supports the independent Docker build context.

## Development

```powershell
cd ..
corepack pnpm install --frozen-lockfile
cd backend
Copy-Item .env.example .env
docker compose up -d --build
```

Use development-only credentials in .env; replace secrets before deployment.
The local .env DATABASE_URL uses localhost:5432. Compose overrides the hostname
to db:5432. PostgreSQL data persists in the named pgdata volume.

- Health: http://localhost:3001/api/v1/health (executes SELECT 1)
- Swagger: http://localhost:3001/api
- OpenAPI JSON: http://localhost:3001/api-json
- Logs: `docker compose logs --tail=50 backend`

To run Node locally: `docker compose up -d db`, then `pnpm start:dev`.
Stop the Compose backend first if port 3001 is already occupied.
When PowerShell blocks pnpm.ps1, use `pnpm.cmd` or `corepack.cmd pnpm`.

## Verification

```powershell
pnpm lint
pnpm build
pnpm test
pnpm test:e2e
```

E2E starts the actual application and queries the database configured in .env.
It also simulates a query failure to verify the 503 error contract.

## Database tools

```powershell
pnpm migration:generate src/database/migrations/Name
pnpm migration:run
pnpm migration:revert
pnpm seed
```

No business entities/migrations/data are included at this stage. The seed
entrypoint checks the connection and reports that no business seeds exist.
Migration commands will be useful when business entities are introduced.
Do not enable synchronize. The base entity intentionally has no version column.

## Production image

```powershell
docker build --target production -t safeops-backend:production .
docker run --rm --env-file .env -e NODE_ENV=production -p 3001:3001 safeops-backend:production
```

Supply DATABASE_URL with a host reachable from the container; localhost in a
container refers to itself. The production stage runs compiled JS as user node.
