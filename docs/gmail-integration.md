# Gmail Integration — Product Engineering Spec

**Feature:** Automated Gmail tracking for job-related email activity
**Status:** Planning
**Owner:** Product Engineering

---

## 1. Problem Statement

Job seekers apply to tens or hundreds of companies and track their pipeline in ApplyTrack. But the moment a recruiter replies — an interview invite, a rejection, an offer — that context lives in Gmail and ApplyTrack stays stale. The user has to manually find the email, figure out which application it belongs to, and update the status themselves.

**This creates three real problems:**

1. **Dead tracking data** — the board says "Applied" but the inbox says "Interview scheduled for Thursday."
2. **Missed follow-up signals** — a reply that gets buried in inbox means a missed opportunity.
3. **Cognitive load** — the user must context-switch between Gmail and ApplyTrack constantly.

---

## 2. Goal

Automatically detect job-related emails in the user's Gmail, classify their intent (interview invite, rejection, offer, etc.), match them to an existing application in ApplyTrack, and surface that signal — either as a timeline event, a status suggestion, or an automated status update.

The user should never have to manually update their board because of an email they already received.

---

## 3. User Stories

| # | As a user I want to... | So that... |
|---|------------------------|------------|
| 1 | Connect my Gmail account with one click | ApplyTrack can read my job-related emails |
| 2 | See email replies as timeline events on each application | I have a full communication history in one place |
| 3 | Get a status suggestion when a recruiter replies | I can update my pipeline with minimal clicks |
| 4 | Have my status auto-updated for high-confidence signals | I don't need to touch the board for obvious updates |
| 5 | Disconnect Gmail at any time and revoke all stored data | I stay in control of my data |
| 6 | See which emails were matched vs. unmatched | I can correct mismatches manually |

---

## 4. Scope

### In Scope (v1)

- Google OAuth 2.0 connection flow (Gmail read-only scope)
- Backend cron job polling Gmail every 15 minutes via Gmail API
- Email classification: `interview_invite`, `rejection`, `offer`, `assessment`, `follow_up_required`, `unknown`
- Matching emails to existing ApplyTrack applications (by company name + sender domain heuristics)
- Creating timeline `Event` records on matched applications
- Status suggestion UI (non-destructive: user confirms)
- Auto-status update for high-confidence matches (configurable toggle per user)
- Disconnect Gmail flow (revoke OAuth token, delete stored credentials)
- Email sync history UI (last synced at, emails processed count)

### Out of Scope (v1)

- Sending emails from within ApplyTrack
- Outlook / other mail providers
- Full email body storage (only metadata + classification result stored)
- Real-time push (Gmail pub/sub webhooks) — deferred to v2
- NLP training or fine-tuning a custom model
- Bulk backfill of historical emails older than 90 days

---

## 5. Email Classification

### Signals Used

Classification is rule-based first (fast, no AI cost), falling back to an LLM call (OpenAI) for ambiguous cases.

| Signal | Method |
|--------|--------|
| Subject keywords | Regex patterns (`interview`, `next steps`, `offer`, `unfortunately`, `move forward`) |
| Sender domain | Match against company domain stored in application record |
| Sender role | Keywords in sender name/signature (`recruiter`, `talent`, `hiring`) |
| Email thread | Track `threadId` — if it's a reply in an existing thread, context carries |
| Tone markers | LLM fallback for ambiguous signals |

### Classification Categories

| Class | Description | Suggested Status Change |
|-------|-------------|------------------------|
| `interview_invite` | Recruiter scheduling an interview | `Applied` → `Interview` |
| `phone_screen` | Short intro call request | `Applied` → `Interview` |
| `assessment` | Take-home test / coding challenge | `Applied` → `Interview` |
| `offer` | Offer letter or verbal offer mention | `Interview` → `Offer` |
| `rejection` | Application declined | Any → `Rejected` |
| `follow_up_required` | Reply needed from the user | No status change |
| `unknown` | Can't determine intent | No status change, log only |

### Confidence Tiers

| Tier | Threshold | Action |
|------|-----------|--------|
| High | ≥ 0.85 | Auto-update status (if user enabled auto-mode) |
| Medium | 0.60–0.84 | Show suggestion banner — user confirms |
| Low | < 0.60 | Log as event only, no status suggestion |

---

## 6. Application Matching

Matching an inbound email to an application record is the hardest part of this feature. The strategy layers multiple signals:

1. **Sender domain match** — extract domain from `from` address, match against `company` field in application table (fuzzy domain lookup: `careers@google.com` → `google`)
2. **Subject line keywords** — if subject contains the company name stored in the application
3. **Thread ID tracking** — once a thread is linked to an application, all future emails in that thread auto-match
4. **Manual override** — user can manually link any email to any application from the unmatched emails view

If no match is found → log as unmatched, surface in the "Unmatched Emails" inbox panel.

---

## 7. Architecture

### High-Level Flow

```
Gmail API (OAuth2)
       │
       ▼
  [Cron Job] (every 15 min, per connected user)
       │
       ├── Fetch new emails since last sync token
       │
       ├── Filter: job-related? (quick keyword pass)
       │
       ├── Classify email intent (rule-based → LLM fallback)
       │
       ├── Match to application record
       │
       ├── Create Event in DB (type: email_received, metadata: classification)
       │
       └── If high-confidence → update application status
                                 (or queue for user confirmation)
```

### Backend Modules

```
backend/
├── services/
│   ├── gmail/
│   │   ├── auth.js          # OAuth2 token management (store, refresh, revoke)
│   │   ├── client.js        # Gmail API client factory
│   │   ├── fetch.js         # Fetch emails, handle pagination, history token
│   │   ├── filter.js        # Quick job-relevance filter (keyword heuristics)
│   │   └── index.js         # Public API surface for gmail service
│   ├── classifier/
│   │   ├── rules.js         # Rule-based classification (regex + keyword)
│   │   ├── llm.js           # LLM fallback (OpenAI chat completion)
│   │   └── index.js         # Orchestrates rules → LLM pipeline
│   └── matcher/
│       ├── domain.js        # Domain-to-company fuzzy matching
│       ├── thread.js        # Thread ID → application ID cache
│       └── index.js         # Matching pipeline
├── jobs/
│   └── gmailSync.js         # Cron job definition (node-cron) — iterates all connected users
├── routes/
│   └── gmail.js             # REST endpoints: connect, disconnect, status, unmatched
├── store/
│   └── gmailTokens.js       # Encrypted token storage (DB layer)
```

### New DB Tables / Columns

#### `gmail_connections` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users |
| `access_token` | TEXT | Encrypted at rest |
| `refresh_token` | TEXT | Encrypted at rest |
| `token_expiry` | TIMESTAMP | |
| `history_id` | TEXT | Gmail history ID for incremental sync |
| `last_synced_at` | TIMESTAMP | |
| `auto_update_status` | BOOLEAN | Default false — user opt-in |
| `connected_at` | TIMESTAMP | |
| `disconnected_at` | TIMESTAMP | Nullable — soft delete |

#### `gmail_email_events` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK |
| `application_id` | UUID | FK → applications (nullable if unmatched) |
| `gmail_message_id` | TEXT | Gmail message ID (dedup key) |
| `gmail_thread_id` | TEXT | For thread tracking |
| `from_address` | TEXT | |
| `from_name` | TEXT | |
| `subject` | TEXT | |
| `received_at` | TIMESTAMP | |
| `classification` | TEXT | Enum: classification categories above |
| `confidence` | FLOAT | 0.0–1.0 |
| `status_suggestion` | TEXT | Nullable — suggested new status |
| `status_applied` | BOOLEAN | Whether status was changed |
| `matched_by` | TEXT | `domain` / `thread` / `manual` / `unmatched` |
| `created_at` | TIMESTAMP | |

#### Modify `events` table (existing)

Add `source` column: `manual` (default) | `gmail` — so timeline events created from email sync are distinguishable.

---

## 8. API Endpoints

### `GET /api/gmail/connect`
Initiates Google OAuth2 flow. Redirects to Google consent screen.

**Scopes requested:**
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/userinfo.email`

### `GET /api/gmail/callback`
OAuth2 callback handler. Exchanges code for tokens, stores in `gmail_connections`, triggers first sync.

### `GET /api/gmail/status`
Returns connection status for the current user.

```json
{
  "connected": true,
  "email": "user@gmail.com",
  "lastSyncedAt": "2026-03-18T10:30:00Z",
  "emailsProcessed": 142,
  "unmatchedCount": 3,
  "autoUpdateStatus": false
}
```

### `DELETE /api/gmail/disconnect`
Revokes OAuth token via Google API, deletes stored tokens, marks connection as disconnected.

### `GET /api/gmail/unmatched`
Returns emails that couldn't be matched to an application.

```json
{
  "emails": [
    {
      "id": "...",
      "fromAddress": "hr@somecompany.com",
      "subject": "Re: Your Application",
      "receivedAt": "...",
      "classification": "interview_invite",
      "confidence": 0.91
    }
  ]
}
```

### `POST /api/gmail/unmatched/:emailId/link`
Manually link an unmatched email to an application.

```json
{ "applicationId": "..." }
```

### `PATCH /api/gmail/settings`
Update user Gmail settings.

```json
{ "autoUpdateStatus": true }
```

---

## 9. Frontend Changes

### Settings Page — Gmail Integration Section

A new "Integrations" section in user settings:

- **Connect Gmail** CTA → triggers OAuth flow
- Post-connect state: shows connected email, last synced timestamp, emails processed count
- **Auto-update status** toggle (default off) with tooltip explaining what it does
- **Disconnect** button with confirmation modal

### Application Detail — Timeline

Email events surface in the existing events timeline with a distinct visual treatment:

- Gmail icon marker on the event
- Sender name + subject line displayed
- Classification badge (e.g. "Interview Invite", "Rejection")
- If status was auto-updated: a subtle "Status updated via Gmail" note

### Status Suggestion Banner

When a medium-confidence email matches an application, a non-blocking suggestion banner appears on the application card and detail view:

```
📬 New email from Acme Corp — looks like an interview invite.
   Suggested: Applied → Interview   [Apply]  [Dismiss]
```

### Unmatched Emails Panel

Accessible from the Dashboard header or settings. Lists emails that arrived but couldn't be matched. Each row has:
- Sender, subject, received time, classification
- "Link to application" dropdown (searchable)
- "Ignore" action

---

## 10. Security & Privacy

| Concern | Mitigation |
|---------|-----------|
| OAuth token storage | Encrypt `access_token` and `refresh_token` at rest using AES-256 (server-side key) |
| Scope minimization | Request only `gmail.readonly` — ApplyTrack never sends email |
| Email body storage | Do NOT store full email body. Store only: `from`, `subject`, `received_at`, classification result |
| Token refresh | Handle `invalid_grant` errors — prompt user to reconnect rather than silently failing |
| User revocation | Users can revoke at any time. On revoke: call Google token revocation endpoint, delete stored tokens, delete all `gmail_email_events` records |
| Rate limiting | Gmail API has per-user quota. The cron job runs every 15 min using incremental sync (history API) — well within limits |

---

## 11. Cron Job Design

**Scheduler:** `node-cron` (already in ecosystem) running inside the Express backend.

**Schedule:** Every 15 minutes (`*/15 * * * *`)

**Per-user execution:**
1. Load all users with active `gmail_connections` (`disconnected_at IS NULL`)
2. For each user (sequential, not parallel — respect API rate limits):
   a. Refresh token if expiry < 5 minutes
   b. Fetch new messages using `history.list` since `historyId`
   c. For each new message: filter → classify → match → persist
   d. Update `history_id` and `last_synced_at`
3. Log duration and email count per run

**Error handling:**
- `invalid_grant` (token revoked by user) → mark connection as disconnected, notify user in UI
- Gmail API quota exceeded → skip, retry next cycle
- Classification failure → log as `unknown`, do not fail the sync
- DB write failure → log, do not advance `history_id` (will reprocess next cycle — idempotent via `gmail_message_id` dedup)

---

## 12. Observability

| What | How |
|------|-----|
| Cron job execution | Log start, end, duration, emails processed, errors per run |
| Classification accuracy | Track `classification` distribution over time |
| Match rate | % of emails matched vs unmatched — surface in admin/debug |
| Token refresh failures | Alert on `invalid_grant` spikes |
| API quota headroom | Log quota usage per run |

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Low match accuracy (wrong company linked) | Medium | High | Default to "suggest" not auto-update. Manual link override always available. |
| Gmail API quota limits | Low | Medium | Incremental sync (history API) + 15 min polling keeps well under 1B quota units/day |
| OAuth token expiry mid-sync | Medium | Low | Proactive token refresh before each sync run |
| User Gmail receives non-job spam that matches keywords | Medium | Low | Confirmation-first UX; low-confidence emails logged only |
| Data privacy concerns | Medium | High | No email body stored; revoke-and-delete flow; clear privacy copy in onboarding |
| Google OAuth app review required for production | High | High | Start with "Testing" mode (100 users); submit for verification in parallel |

---

## 14. Open Questions

- [ ] **OAuth app verification:** Will we need to go through Google's OAuth app verification process? (Yes — `gmail.readonly` is a restricted scope. Budget 2–4 weeks for review.)
- [ ] **LLM cost model:** What's the acceptable cost per classification call? Should we batch, cache, or set a hard daily spend cap?
- [ ] **Multi-account support:** Should one user be able to connect multiple Gmail accounts? (Deferred to v2 for simplicity.)
- [ ] **Notification system:** Do we have push notifications or email digests in ApplyTrack? If not, how do we surface "3 new email events synced" without it being silent?
- [ ] **Data retention:** How long do we retain `gmail_email_events` records after a user disconnects?

---

## 15. Acceptance Criteria

- [ ] User can connect their Gmail account via Google OAuth without leaving ApplyTrack
- [ ] Cron job runs every 15 minutes and fetches only new emails since last sync
- [ ] An email from a known company domain creates a timeline event on the matching application
- [ ] Classification correctly identifies interview invites and rejections with ≥ 80% accuracy on test set
- [ ] Medium-confidence matches show a suggestion banner; they do not auto-update status
- [ ] High-confidence matches auto-update status only when the user's `autoUpdateStatus` toggle is ON
- [ ] Unmatched emails are visible in the Unmatched Emails panel and can be manually linked
- [ ] Disconnect flow revokes the Google OAuth token and clears all stored email metadata
- [ ] No full email body is stored at any point in the pipeline
- [ ] Duplicate emails (same `gmail_message_id`) are never processed twice

---

## 16. Phased Rollout

| Phase | Scope | Exit Criteria |
|-------|-------|---------------|
| **Alpha** | Internal / dogfood (1–5 users) | Manual QA, match rate > 70%, no token leak bugs |
| **Beta** | 25–100 users (Google Testing mode) | Classification accuracy validated, no P0 bugs for 1 week |
| **GA** | All users | Google OAuth app verified, monitoring in place |

---

*This doc is the source of truth for the Gmail integration feature. Update it as decisions are made.*
