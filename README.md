# SafeOps — Monorepo Root

## Cấu trúc dự án

```
SafeOps/
├── backend/     # NestJS + TypeORM + PostgreSQL + Socket.IO
├── frontend/    # Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
├── .prettierrc  # Prettier config dùng chung
├── .husky/      # Git hooks (pre-commit, commit-msg)
└── package.json # Root devDependencies & lint-staged
```

## Quy ước Commit

```
<type>(<scope>): [<Task-ID>] <mô tả ngắn>
```

**Types:** `feat` | `fix` | `chore` | `docs` | `style` | `refactor` | `test` | `perf` | `ci`

**Ví dụ:**

```
feat(auth): [M1-05] implement JWT login endpoint
fix(incident): [M2-03] handle transaction rollback on attachment error
chore(infra): [M0-10] setup ESLint, Prettier và Husky
```

## Lệnh hữu ích

```bash
npm run lint          # Lint toàn bộ BE + FE
npm run format        # Format toàn bộ file
npm run format:check  # Kiểm tra format (không sửa)
```
