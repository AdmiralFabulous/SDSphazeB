# SUIT AI v4.b - CI/CD & Merge Protocol
## Development Workflow & Automation

> **Document Version:** 1.0  
> **Date:** 2026-01-19

---

## 1. Git Branching Strategy

```
                                    ┌─────────────────┐
                                    │      main       │  (Production)
                                    │  Always Deploy  │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │     develop     │  (Staging)
                                    │  Integration    │
                                    └────────┬────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
     ┌────────▼────────┐          ┌─────────▼─────────┐          ┌────────▼────────┐
     │ feature/TASK-ID │          │ feature/TASK-ID   │          │ feature/TASK-ID │
     │ Short-lived     │          │ Short-lived       │          │ Short-lived     │
     └─────────────────┘          └───────────────────┘          └─────────────────┘
```

---

## 2. Branch Naming Convention

```
[type]/[TASK-ID]-[short-description]

Examples:
  feature/INFRA-E01-S01-T01-provision-gpu
  feature/DB-E01-S01-T01-create-users-table
  feature/FE-E02-S03-T01-fabric-selector
  fix/VIS-E02-S01-T03-pose-extraction-crash
  chore/TEST-E01-S01-T01-configure-jest
  
Prefixes:
  feature/  - New functionality
  fix/      - Bug fixes
  chore/    - Maintenance tasks
  docs/     - Documentation only
  refactor/ - Code restructuring
  hotfix/   - Emergency production fixes
```

---

## 3. Pull Request Rules

### 3.1 PR Title Format

```
[type]: [TASK-ID] Short description

Examples:
  feat: INFRA-E01-S01-T01 Provision GPU instance
  fix: VIS-E02-S01-T03 Fix pose extraction crash
  chore: TEST-E01-S01-T01 Configure Jest
  docs: Update API documentation
```

### 3.2 PR Template

```markdown
## Task Reference
- **Task ID:** [INFRA-E01-S01-T01]
- **Kanban Link:** [Link to task]

## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation
- [ ] Refactoring

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Definition of Done
- [ ] [Specific DoD from task]

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] No console.log or debug statements
- [ ] No hardcoded values
- [ ] Environment variables documented
```

### 3.3 Review Requirements

| Target Branch | Required Approvals | Status Checks |
|--------------|-------------------|---------------|
| main | 2 | All CI + E2E |
| develop | 1 | Lint + Unit Tests |
| feature/* | 0 (self-merge OK) | Lint |

---

## 4. GitHub Actions Workflow

### 4.1 Main CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  PYTHON_VERSION: '3.11'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run ESLint
        run: npm run lint
        
      - name: Run TypeScript check
        run: npm run typecheck
        
      - name: Check formatting
        run: npm run format:check

  unit-tests-frontend:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm test -- --coverage --watchAll=false
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  unit-tests-backend:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          
      - name: Install dependencies
        run: |
          cd services/vision
          pip install -r requirements.txt
          pip install pytest pytest-cov
          
      - name: Run tests
        run: |
          cd services/vision
          pytest --cov=src --cov-report=xml
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

  integration-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests-frontend, unit-tests-backend]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Start services
        run: docker-compose up -d
        
      - name: Wait for services
        run: |
          sleep 30
          curl --retry 10 --retry-delay 5 http://localhost:3000/api/health
          
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Stop services
        run: docker-compose down

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.base_ref == 'main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Build application
        run: npm run build
        
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000
          
      - name: Upload test artifacts
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy-staging:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: e2e-tests
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

### 4.2 Vision Service Pipeline

```yaml
# .github/workflows/vision.yml
name: Vision Service CI

on:
  push:
    paths:
      - 'services/vision/**'
  pull_request:
    paths:
      - 'services/vision/**'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./services/vision
          push: false
          tags: suit-ai-vision:test
          cache-from: type=gha
          cache-to: type=gha,mode=max
          
      - name: Run tests in container
        run: |
          docker run --rm suit-ai-vision:test pytest tests/

  push-to-registry:
    runs-on: ubuntu-latest
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./services/vision
          push: true
          tags: ghcr.io/${{ github.repository }}/vision:latest
```

---

## 5. Conflict Prevention Protocol

### 5.1 Before Starting Work

```bash
# 1. Check Kanban Board
# Ensure task is not assigned to someone else

# 2. Assign Yourself
# Mark task as "In Progress" on board

# 3. Pull Latest
git checkout develop
git pull origin develop

# 4. Create Branch
git checkout -b feature/TASK-ID-short-description
```

### 5.2 During Development

```bash
# Small, atomic commits
git add .
git commit -m "feat: TASK-ID Add fabric selector component"

# Push regularly (at least daily)
git push origin feature/TASK-ID-short-description

# Keep up with develop
git fetch origin
git rebase origin/develop
```

### 5.3 Before Creating PR

```bash
# 1. Rebase on develop
git fetch origin
git rebase origin/develop

# 2. Run tests locally
npm test
npm run lint
npm run typecheck

# 3. Self-review
git diff develop...HEAD

# 4. Push final changes
git push origin feature/TASK-ID-short-description --force-with-lease
```

### 5.4 Conflict Resolution

```bash
# If conflicts occur during rebase
git rebase origin/develop

# VS Code/editor will highlight conflicts
# Resolve each file manually

# After resolving
git add .
git rebase --continue

# If too complex, abort and merge instead
git rebase --abort
git merge origin/develop
# Resolve conflicts
git add .
git commit -m "merge: resolve conflicts with develop"
```

---

## 6. Release Process

### 6.1 Version Numbering

```
MAJOR.MINOR.PATCH

Examples:
  0.1.0  - Initial alpha (MVP)
  0.2.0  - Track B complete
  0.3.0  - Voice integration
  1.0.0  - Production launch
  1.0.1  - Bug fix
  1.1.0  - New feature
```

### 6.2 Release Workflow

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. Update version numbers
npm version 1.0.0 --no-git-tag-version

# 3. Update CHANGELOG.md
# Add release notes

# 4. Create PR to main
# Title: "Release v1.0.0"

# 5. After merge, tag the release
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 6. Merge main back to develop
git checkout develop
git merge main
git push origin develop
```

### 6.3 Release Checklist

```markdown
## Pre-Release Checklist

### Testing
- [ ] All E2E tests pass
- [ ] No critical bugs in staging
- [ ] Security audit passed
- [ ] Performance benchmarks met

### Documentation
- [ ] API documentation updated
- [ ] CHANGELOG.md updated
- [ ] README.md current
- [ ] Migration guide (if breaking changes)

### Operations
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Rollback plan prepared
- [ ] Monitoring alerts configured

### Deployment
- [ ] Version bumped
- [ ] Tagged in git
- [ ] Deployed to production
- [ ] Smoke tests passed
- [ ] Team notified
```

---

## 7. Hotfix Protocol

For critical production issues:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-description

# 2. Fix the issue
# Make minimal changes

# 3. Test thoroughly
npm test
npm run test:e2e

# 4. Create PR directly to main
# Title: "HOTFIX: Critical bug description"

# 5. After merge, immediately merge to develop
git checkout develop
git merge main
git push origin develop

# 6. Tag the hotfix
git checkout main
git tag -a v1.0.1 -m "Hotfix: Critical bug description"
git push origin v1.0.1
```

---

## 8. Environment Management

### 8.1 Environment Hierarchy

```
┌─────────────┐
│ Production  │  main branch
│ (Live)      │  Real customers
└──────┬──────┘
       │
┌──────▼──────┐
│  Staging    │  develop branch
│  (Test)     │  Internal testing
└──────┬──────┘
       │
┌──────▼──────┐
│  Preview    │  feature/* branches
│  (PR)       │  PR-specific deploys
└──────┬──────┘
       │
┌──────▼──────┐
│   Local     │  Developer machine
│  (Dev)      │  npm run dev
└─────────────┘
```

### 8.2 Environment Variables

Each environment has isolated configs:

```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:3000
SUPABASE_URL=http://localhost:54321

# .env.staging
NEXT_PUBLIC_API_URL=https://staging.suitai.com
SUPABASE_URL=https://xxx.supabase.co

# .env.production
NEXT_PUBLIC_API_URL=https://suitai.com
SUPABASE_URL=https://xxx.supabase.co
```

---

## 9. Code Quality Gates

### 9.1 Required Checks

| Check | Tool | Threshold |
|-------|------|-----------|
| Linting | ESLint | 0 errors |
| Type Safety | TypeScript | 0 errors |
| Formatting | Prettier | 100% |
| Unit Tests | Jest | 80% coverage |
| E2E Tests | Playwright | 100% pass |
| Security | npm audit | 0 critical |

### 9.2 Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### 9.3 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>

Types:
  feat     - New feature
  fix      - Bug fix
  docs     - Documentation
  style    - Formatting
  refactor - Code restructuring
  test     - Adding tests
  chore    - Maintenance

Examples:
  feat(scanner): add ArUco marker detection
  fix(checkout): resolve Stripe webhook timeout
  docs(api): update session endpoint docs
```

---

*End of CI/CD Protocol Document*
