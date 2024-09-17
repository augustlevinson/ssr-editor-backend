Design
---
- DocumentList: varje dokument har en thumbnail istället för bara titel
- 


Funktionalitet
---
- Alert innan radering
- Snyggare/säkrare dokument-ID:n (i URL:en, inte hela ObjectId) OK
- Lägg till knapp för reset av db?
- Ev flytta setupContent till separat Json-fil OK
- Ändra tidsstämpeln i db, så den visar 24-timmarsformat istället för AM/PM?
- app.js: get(/add) funkar, men finns en bugg som borde lösas när vi kopplar till frontenden. Behövs redirect eller kan vi lösa på annat sätt?
- Lägg till tidstämpel updated (samma som created) vid add - ändras vid update