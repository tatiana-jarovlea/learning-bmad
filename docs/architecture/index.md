# Architecture Index — PawTrust

**Version:** 1.0 | **Source:** `docs/architecture.md`

This index lists all architecture shard files and the recommended reading order for different story types.

---

## Reading Order by Story Type

### ALL Stories (always read first)

1. `tech-stack.md` — technology choices and versions
2. `coding-standards.md` — naming conventions, patterns, rules
3. `source-tree.md` — directory structure for both repos
4. `testing-strategy.md` — what to test and how

### Backend / API Stories (additionally)

5. `data-models.md` — entity definitions and field specs
6. `database-schema.md` — migration order, indexes, constraints
7. `backend-architecture.md` — controllers, services, policies structure
8. `rest-api-spec.md` — endpoint definitions and auth requirements
9. `external-apis.md` — S3, SES, Stripe integration details

### Frontend / UI Stories (additionally)

5. `frontend-architecture.md` — routing, state management, i18n
6. `components.md` — React component tree
7. `core-workflows.md` — sequence diagrams for key flows
8. `data-models.md` — for API response shapes

### Infrastructure / DevOps Stories (additionally)

5. `deployment.md` — AWS resources, CI/CD pipelines
6. `security.md` — auth, rate limiting, HTTPS, S3 access

---

## Shard File Directory

| File                           | Source Section | Description                                |
| ------------------------------ | -------------- | ------------------------------------------ |
| `tech-stack.md`                | §3             | Technology versions and purpose            |
| `data-models.md`               | §4             | Entity definitions with full field tables  |
| `rest-api-spec.md`             | §5             | All API endpoints                          |
| `components.md`                | §6             | React component tree                       |
| `external-apis.md`             | §7             | S3, SES, Stripe integration                |
| `core-workflows.md`            | §8             | Sequence diagrams                          |
| `database-schema.md`           | §9             | Migrations, indexes, constraints           |
| `frontend-architecture.md`     | §10            | React directory structure, routing, state  |
| `backend-architecture.md`      | §11            | Laravel directory structure, service layer |
| `unified-project-structure.md` | §12            | Polyrepo layout, CI/CD yaml                |
| `development-workflow.md`      | §13            | Local setup, branching, commits            |
| `deployment.md`                | §14            | Environments, GitHub Actions, AWS          |
| `security.md`                  | §15            | Security controls, performance             |
| `testing-strategy.md`          | §16            | PHPUnit, Jest, manual tests                |
| `coding-standards.md`          | §17            | PHP, TypeScript, Git conventions           |
| `error-handling.md`            | §18            | Error formats, HTTP codes                  |
| `monitoring.md`                | §19            | Logging, health checks, alerts             |
| `source-tree.md`               | §10+§11        | Combined directory trees                   |

