# Security Officer — Primary Security Audit (Stage 1)

**Роль:** Security Officer  
**Дата:** 2026-07-29  
**Объект:** foundation Next.js 15 app (до lead API / forms UI)  
**Вердикт:** ✅ **PASS — критических замечаний нет**

---

## 1. Threat model (текущая поверхность)

| Surface | Status | Risk |
|---------|--------|------|
| Public static landing smoke | Active | Low |
| Lead POST API | Not implemented | — |
| Admin / CMS | Out of scope v1 | — |
| Auth | None | — |
| Third-party scripts | None on critical path | Low |
| Env secrets | Schema only; `.env.example` | Low |

---

## 2. Controls in place

| Control | Evidence |
|---------|----------|
| No `X-Powered-By` | `next.config.ts` → `poweredByHeader: false` |
| Clickjacking | `X-Frame-Options: DENY` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Referrer | `strict-origin-when-cross-origin` |
| Permissions-Policy | camera/mic/geo/payment disabled |
| HSTS | `max-age=63072000; includeSubDomains; preload` |
| Env validation | `src/config/env.ts` (Zod) |
| Secrets not in client | Server-only names without `NEXT_PUBLIC_` |
| Honeypot field planned | `schemas/lead.ts` → `website` |
| React strict mode | enabled |

---

## 3. Findings

| ID | Severity | Finding | Disposition |
|----|----------|---------|-------------|
| S-01 | Medium (deferred) | CSP not yet configured | ⏳ Add on Conversion / before prod with nonces; document in Stage 4 |
| S-02 | Low | Rate limit / Turnstile not wired | ⏳ Expected — no lead endpoint yet |
| S-03 | Info | JSON-LD contacts may be placeholders | Content gate before prod index |
| S-04 | Info | Preview noindex depends on env discipline | Documented in SEO strategy |
| S-05 | — | No hardcoded API keys in `src/` | ✅ |

**Critical:** none for Stage 1 foundation.

---

## 4. Required before Production (not Stage 1 blockers)

1. CSP (`Content-Security-Policy`) tuned to images/fonts/analytics  
2. Lead endpoint: Zod + honeypot + rate limit (+ Turnstile if spam)  
3. Privacy policy URL + consent copy  
4. Secrets only via host env / vault  
5. Dependency audit (`npm audit`) on release  

---

## 5. OWASP-oriented checklist (foundation)

| Item | Stage 1 |
|------|---------|
| Injection via forms | N/A (no endpoint) — schema ready |
| XSS | React escaping; no `dangerouslySetInnerHTML` except JSON-LD (controlled) |
| Sensitive data exposure | No secrets in bundle |
| Broken access control | No auth surfaces |
| Security misconfig | Headers baseline ✅ |
| SSRF | No user-controlled fetch |

---

## 6. Sign-off

**Security Officer:** PASS (Stage 1)  
**Residual risk:** accepted deferred CSP / lead hardening until Conversion stage.
