# Strix security checkup

Tool: [Strix](https://github.com/usestrix/strix) `1.5.3`  
Run: `strix_runs/support-crm_93cf`  
Model: NVIDIA NIM `meta/llama-3.1-70b-instruct`  
Scan mode: quick, white-box, local source `/home/user/support-crm`

## What ran

```bash
strix -n -m quick --target ./support-crm --max-turns 12
```

- Docker sandbox `ghcr.io/usestrix/strix-sandbox:1.3.0` started
- 4 LLM requests, ~89k tokens
- **Result: 0 exploitable vulnerabilities detected**
- SARIF: empty `results[]`
- Exit code `0`

Strix printed a model-quality warning: Llama 3.1 70B is **not** a recommended frontier model for pentesting. The generated `penetration_test_report.md` is a stub (the model wrapped up after planning, it did not walk the tree deeply). Treat “0 findings” as **no confirmed exploit**, not as a formal certification.

## White-box checklist (same codebase)

| ID | Severity | Area | Result |
| --- | --- | --- | --- |
| S-01 | Info | Auth | None by design (PRD optional) |
| S-02 | Low | CORS | Open if `FRONTEND_URL` is unset / `*` |
| S-03 | Low | Persistence | Vercel JSON `/tmp` is not durable |
| S-04 | Pass | Injection | Parameterized SQL / JSON store |
| S-05 | Pass | XSS | React escaping; no `dangerouslySetInnerHTML` |
| S-06 | Pass | Ticket IDs | Must match `TKT-\d{1,8}` |
| S-07 | Pass | Validation | Required fields, email, status, length caps |
| S-08 | Pass | Secrets | `.env` gitignored; scan output ignored |
| S-09 | Pass | Rate limit | 120 req/min on `/api` |
| S-10 | Pass | Errors | 500s do not leak stacks |
| S-11 | Pass | Body size | JSON 32kb |
| S-12 | Pass | Headers | `X-Powered-By` off |

## Residual (product, not a bug)

Anyone who can open the public URL can create and edit tickets. Add auth before a real support desk.

## Deeper scan (recommended)

Use a frontier model Strix prefers:

```bash
export STRIX_LLM="anthropic/claude-sonnet-4-6"   # or openai/gpt-4o
export LLM_API_KEY="your-key"
strix -n -m standard --target ./support-crm
```
