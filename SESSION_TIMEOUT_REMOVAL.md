# Session Timeout Removal

- Removed the 15-minute auth/session countdown from the header.
- Removed automatic expiry/lock logic from `App.tsx`.
- Auth sessions now persist until the user manually locks or switches operative.
- Legacy persisted sessions are migrated to the no-timeout policy on load.
- Removed the 5/15/30/60 minute timeout selector from the auth terminal.
- Manual emergency lock remains available.
- Header now displays `SESSION: ACTIVE // MANUAL LOCK` instead of a countdown.
- Legacy sessions that were already auto-locked by the old timer are unlocked once during migration.
- Fixed the manual unlock callback so the retained manual lock cannot clear the active session object.
