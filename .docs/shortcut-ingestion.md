# SMS import via Apple Shortcut

Turn bank-alert SMS into Solde transactions automatically: an iOS Messages
automation forwards each alert to Solde, which parses it, maps it to an account,
de-duplicates it, auto-categorizes it, and records the transaction.

## How it works

```
iMessage bank SMS ─▶ iOS Shortcut (Messages automation)
   POST /api/shortcuts/transactions   Authorization: Bearer <key>
   { "message": "<raw SMS>", "sender": "<sender id>" }
        ▼
   parse against your saved bank templates → resolve account → dedupe → categorize
        ▼
   JSON response → Shortcut shows a notification
```

Parsing is **server-side**: you teach Solde each bank's format once (no parsing
logic lives on the phone). The account is chosen by the bank template; the amount
stays in integer minor units; the same SMS re-fired on the same day de-dupes.

## One-time setup (in the app)

1. **Settings → SMS import → API key → Generate key.** Copy the key now — it's
   shown only once (only its hash is stored).
2. **Settings → SMS import → Add a bank.** Paste **two** recent alert messages
   from the **same card**. Solde diffs them to learn the template and detect the
   card identifier. Confirm the detected amount/merchant/date, pick the Solde
   account, enter the **SMS sender id** (the shortcode shown in Messages, e.g.
   `ADCBAlert`), the currency, and the direction. Repeat per card.

## The API

`POST {APP_URL}/api/shortcuts/transactions`
Headers: `Authorization: Bearer <key>`, `Content-Type: application/json`
Body:

```json
{ "message": "AED 42.80 spent on card ending 1234 at CARREFOUR on 30/06/2026", "sender": "ADCBAlert" }
```

Responses:

| Status | Body | Meaning |
|--------|------|---------|
| 200 | `{ ok:true, deduped:false, transaction:{…} }` | Recorded |
| 200 | `{ ok:true, deduped:true,  transaction:{…} }` | Already recorded (idempotent re-fire) |
| 400 | `{ ok:false, error:"Invalid request" }` | Bad/empty JSON or fields |
| 401 | `{ ok:false, error:"Unauthorized" }` | Missing/invalid key |
| 422 | `{ ok:false, error:"Unknown bank…", sender }` | No template matches — add the bank |

`transaction` includes `amount` (major units), `currency`, `accountLabel`,
`note`, `categoryName?`, and `date` — enough for a one-line notification.

## Build the Shortcut

1. **Shortcuts → Automation → New → Personal Automation → Message.** Set
   **Sender** to the bank's shortcode; enable **Run Immediately** (required for
   unattended runs).
2. **Get Contents of URL** → `POST {APP_URL}/api/shortcuts/transactions`.
   - Headers: `Authorization` = `Bearer <key>` (store the key in a preceding
     **Text** action, not inline), `Content-Type` = `application/json`.
   - Request Body **JSON**: `message` = the Shortcut Input (message text),
     `sender` = the Sender variable.
3. **Get Dictionary from Input** → **Show Notification** with
   `transaction.amount` + `transaction.account`; branch on `deduped`
   ("Already recorded").

iOS notes: bank SMS come from alphanumeric shortcodes (match the exact sender);
automations don't sync across devices; the device must be unlocked and online.

## Categorization

On import, the merchant text is looked up in a per-user keyword cache
(`MerchantCategory`). On a miss, an LLM (OpenAI, configured via `OPENAI_API_KEY`
/ `OPENAI_MODEL`) picks one of your existing categories and the result is cached.
Without an API key, imports are left uncategorized. When you re-categorize a
transaction by hand, that choice is cached too (manual wins over AI).

## Testing

```bash
URL={APP_URL}/api/shortcuts/transactions
KEY=<generated key>

# Record
curl -s -X POST $URL -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -d '{"message":"AED 42.80 spent on card ending 1234 at CARREFOUR on 30/06/2026","sender":"ADCBAlert"}'

# Re-send identical → deduped:true
# Bad key → 401 ; bad JSON → 400 ; unknown bank → 422
```

Test rows are `source:"shortcut"` with `externalId` prefixed `sms:` — clean up with
`Transaction.deleteMany({ source:"shortcut", externalId:/^sms:/ })`.
