Design
---
- Styling i shadowDOM?
- Sortering på typ, namn osv
- Listvy och ikonvy
- Formatering (lägg till heading)
- Ordräknare
- Lägg till inloggad-badge eller dylikt
<!-- - Styling för signup-formuläret -->
- landing page?
<!-- - översyn font-family, samma överallt -->
- Flytta formateringsknapparna, kommentarsknappen och inbjudanknapp till document bar. Ta fram inputfält vid klick
<!-- - Flytta "Kör"-knappen och inbjudanknapp till document bar -->
- Styling på körknappen (code mode)
<!-- - Styling på outputelementet: färg, padding, margin-right -->
- Lägg till About i footer
<!-- - Flytta styling från footerkomponenten till CSS-filen -->


Funktionalitet
---
<!-- - Logga in finns bara som utloggad och Logga ut bara som inloggad -->
<!-- - Se till att invited och collaborator hinner uppdateras innan render (inga dubletter) -->
<!-- - Lägg till mer respons när invite går igenom. -->
<!-- - Inloggadstatus ska uppdateras reacty -->
- Hantera (fixa stöd eller ta bort) kodförslagsdropdown i kodeditorn
- Hantera åäö i kodeditorn (å blir idag e t. ex.)
<!-- - Raderaknapp finns bara tillgänglig hos ägaren - flytta till document bar -->
<!-- - Alert innan radering -->
<!-- - /add/:id ska vara en PUT-route -->

- Någon form av spinner/load bar under hämtning av dokument
- Någon form av spinner/load bar i kodeditorn med koden exekveras, innan den visas upp i output.
- Kommentera med CTRL+SHIFT+C/CMD+SHIFT+C?
- Lägg ev till "profilsida" där användaren kan byta lösenord/ta bort konto etc.
- Lista för att se vilka som kan delas med? (Emil nämnde under föreläsning)
    Här skulle man kunna lägga till att användaren, i sin profil, 
    kan välja att ha en publik profil (finns i listan), eller icke-publik (inte i listan).
- Verifiera mejladress? Typ skicka länk med SendGrid och när den klickas sätts user.verified: true
- Ändra landingpage om inga dokument finns för användaren

Innan inlämning
---
- Ta bort "Återställ databas"
- Ta bort console.log:ar
- Ta bort app.get("/all")