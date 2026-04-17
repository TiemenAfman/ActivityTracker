# Activiteiten Tracker

Een mobiel-first web app voor het bijhouden van terugkerende activiteiten. Draait lokaal op een home server (NUC, Raspberry Pi, etc.) en is bereikbaar via de browser op je telefoon.

## Functies

- Activiteiten met een instelbaar interval (dagen of weken)
- Progressiebalk die leegloopt over de intervalperiode — groen → oranje → rood
- Categorieën met emoji-icoon, onbeperkt genest
- Voltooiing vastleggen met sterrenrating (optioneel), notitie en foto
- Geschiedenis per activiteit (laatste 10 voltooiingen)
- Meerdere gebruikers — categorieën kunnen privé of gedeeld zijn
- Data opgeslagen als JSON bestand op de server

## Installatie

### Vereisten
- Node.js 18 of nieuwer

### Stappen

```bash
git clone <repo-url>
cd activity-tracker
npm install
```

Maak een gebruiker aan in `data/users.json`:

```json
[
  { "id": "usr_1", "username": "naam", "password": "wachtwoord" }
]
```

## Gebruik

### Lokaal ontwikkelen

```bash
npm run dev
```

Opent de app op `http://localhost:5173`. De Express server draait op poort 3001.

### Productie (home server)

```bash
npm run build
npm start
```

De app is bereikbaar op `http://<server-ip>:3001` — ook via je telefoon op hetzelfde wifi-netwerk.

## Gebruikers beheren

Gebruikers worden beheerd in `data/users.json`. Wachtwoorden staan in platte tekst — bedoeld voor thuisgebruik zonder gevoelige informatie.

```json
[
  { "id": "usr_1", "username": "tiemen", "password": "wachtwoord1" },
  { "id": "usr_2", "username": "marije", "password": "wachtwoord2" }
]
```

Wijzigingen worden direct actief zonder herstart. Gebruikers kunnen hun eigen wachtwoord wijzigen via de 🔑 knop in de app.

## Data

Alle activiteiten en categorieën worden opgeslagen in `data/activities.json`. Dit bestand kun je backuppen of verplaatsen naar een andere server.

## Zichtbaarheid

- **Privé categorie** — alleen de eigenaar ziet hem
- **Publieke categorie** — iedereen kan zien, bewerken en activiteiten markeren als gedaan; alleen de eigenaar kan de categorie verwijderen
