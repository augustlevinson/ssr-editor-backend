Design
---
- DocumentList: varje dokument har en thumbnail istället för bara titel
- Styling i shadowDOM?
- Sortering på typ, namn osv
- Listvy och ikonvy
- Formatering (bold, italic osv)
- Ordräknare
- Lägg till inloggad-badge eller dylikt


Funktionalitet
---
- Alert innan radering
- app.js: get(/add) funkar, men finns en bugg som borde lösas när vi kopplar till frontenden. Behövs redirect eller kan vi lösa på annat sätt?
- sätt homepage i package.json till "~akronym/editor" innan inlämning
- ordna statuskoder att skicka med från backend?
- Spara med CMD+S
- Kommentera med CTRL+SHIFT+C/CMD+SHIFT+C?
- /add - ska det vara en app.post()?
- frontend / ska rendera DocumentList OM inloggad, annars landing page
- Lägg ev till "profilsida" där användaren kan byta lösenord/ta bort konto etc.
- Lägg till alternativ för att endast läsa eller redigera delade dokument
- Lägg till vem som är ägare av dokumentet
- Eventuellt byta userCookie mot enbart token i validateToken()
- Lista för att se vilka som kan delas med? (Emil nämnde under föreläsning)
    Här skulle man kunna lägga till att användaren, i sin profil, 
    kan välja att ha en publik profil (finns i listan), eller icke-publik (inte i listan).

- lägg in spärr så att en inbjudan bara kan skickas en gång per dokument och användare 
    (så att användaren bara kan finnas i "invited" en gång)

- sockets till output i code mode 