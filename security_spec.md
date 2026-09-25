# HealthFlow AI — Security & Threat Modeling Specification

## 1. Data Invariants
1. **Identity Immutability**: `userId` in `/users/{userId}` and `userId` in `/audit_logs/{logId}` must strictly match `request.auth.uid`. A user cannot impersonate another operator or forge identity headers.
2. **Role Escalation Protection**: Users cannot self-assign `system_admin` or `regional_director` clearance during profile creation or update unless authenticated with bootstrap admin credentials (`ramprakashshah8236@gmail.com`).
3. **Audit Log Immutability**: Documents in `/audit_logs/` are strictly **append-only** (create only). Updates and deletes are mathematically forbidden (`allow update, delete: if false`).
4. **Redistribution State Machine**: Status transitions must follow `PROPOSED` -> `APPROVED` -> `DISPATCHED` -> `DELIVERED` or `CANCELLED`. Once `DELIVERED` or `CANCELLED`, orders enter terminal state and cannot be modified.
5. **Path Variable Hardening**: All IDs `{userId}`, `{logId}`, `{transferId}`, `{scenarioId}` must conform to alphanumeric/hyphen patterns under 128 characters (`isValidId()`).
6. **Denial-of-Wallet & Schema Size Constraints**: Every string field has strict maximum character lengths to block resource exhaustion payloads.

---

## 2. The "Dirty Dozen" Adversarial Payloads

### Payload 1: Privilege Escalation Attack on Registration
- **Target**: `POST /users/attacker-uid`
- **Payload**: `{"userId": "attacker-uid", "email": "attacker@evil.com", "role": "system_admin", "createdAt": "2026-09-15T00:00:00Z"}`
- **Expected Outcome**: `PERMISSION_DENIED` (Regular non-admin users cannot grant themselves `system_admin`).

### Payload 2: Ghost Field Injection (Shadow Update)
- **Target**: `UPDATE /users/{userId}`
- **Payload**: `{"displayName": "Dr. Valid", "isSuperUser": true}`
- **Expected Outcome**: `PERMISSION_DENIED` (Strict affectedKeys constraint forbids ghost fields).

### Payload 3: Audit Log Tampering (Update Existing Log)
- **Target**: `UPDATE /audit_logs/audit-001`
- **Payload**: `{"status": "SUCCESS", "details": "Covered up security incident"}`
- **Expected Outcome**: `PERMISSION_DENIED` (Audit logs are strictly write-once / append-only).

### Payload 4: Audit Log Deletion Attack
- **Target**: `DELETE /audit_logs/audit-001`
- **Expected Outcome**: `PERMISSION_DENIED` (No operator, not even admin, can erase compliance history).

### Payload 5: ID Poisoning / Buffer Overflow Attack
- **Target**: `GET /users/a_very_long_string_overflowing_1000_bytes_injection...`
- **Expected Outcome**: `PERMISSION_DENIED` (`isValidId` rejects IDs > 128 characters or containing illegal regex characters).

### Payload 6: Spoofed Author in Redistribution Transfer
- **Target**: `POST /redistributions/tx-999`
- **Payload**: `{"transferId": "tx-999", "approvedBy": "director-bob-uid", ...}` where `request.auth.uid == "intern-eve"`
- **Expected Outcome**: `PERMISSION_DENIED` (Non-directors cannot self-approve or spoof authorizer UID).

### Payload 7: Terminal State Re-Opening Attack
- **Target**: `UPDATE /redistributions/tx-101`
- **Existing**: `{"status": "DELIVERED"}`
- **Payload**: `{"status": "APPROVED", "quantity": 99999}`
- **Expected Outcome**: `PERMISSION_DENIED` (Terminal state locking prevents modifications to delivered orders).

### Payload 8: Blanket Query Scraping Attack
- **Target**: `GET /users` (unbounded list)
- **Expected Outcome**: `PERMISSION_DENIED` (Blanket listing of user profiles is restricted to system administrators).

### Payload 9: Unauthenticated Stress Simulation Execution
- **Target**: `POST /crisis_events/scen-01` with `request.auth == null`
- **Expected Outcome**: `PERMISSION_DENIED` (Anonymous/unauthenticated users cannot record or alter crisis scenarios).

### Payload 10: Negative or Excessive Quantity Poisoning
- **Target**: `POST /redistributions/tx-102`
- **Payload**: `{"quantity": -500, ...}`
- **Expected Outcome**: `PERMISSION_DENIED` (Validation requires quantity > 0 and <= 1,000,000).

### Payload 11: Email Domain Spoofing Attack
- **Target**: `POST /users/{uid}` with unverified email or mismatched email token
- **Expected Outcome**: `PERMISSION_DENIED` (`request.auth.token.email` validation).

### Payload 12: Cross-Tenant Facility Data Overwrite
- **Target**: `UPDATE /redistributions/tx-202`
- **Attacker**: Logistics lead assigned to Hospital B attempting to modify orders exclusive to Hospital A.
- **Expected Outcome**: `PERMISSION_DENIED` (Facility-scoped permissions enforce local jurisdiction).
