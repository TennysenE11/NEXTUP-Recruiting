# Automatic sending

A weekly scheduled Claude task runs this:

1. Checks the connected Gmail account is the player's recruiting address. If not, it stops.
2. Looks for coach replies in the inbox and marks those schools Replied. They never get automatic follow-ups.
3. `node run.js plan` picks the week's emails: due follow-ups (at most 3 per coach, only while status is Emailed and no reply), then the 10 new schools with the most pitchers leaving. It skips rows marked "verify", schools without a business major, and states outside the Regions selection.
4. Sends each email from Gmail exactly as written by the app's own code, then runs `node run.js mark <id>` right away.
5. Commits `tracker.json` to `main`.

`tracker.json` holds program data only. The player's profile lives in the scheduled task's private instructions, not in this public repo.

To see the latest status in the app, download `tracker.json` from GitHub and use Import, then OK to replace.
