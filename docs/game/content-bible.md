# Shazamat Life Simulator — Content Bible

This is the canonical event spec. Every card here has been reviewed by Aviad (2026-09-01).
Before writing any TypeScript, get a thumbs-up on any "needs Aviad" note below.

After approval, delete the 4 placeholder events in `src/game/content/events/` and implement the cards from this document.

Run `npm run game:validate` after every file added.

---

## Table of contents

1. [Design rules](#design-rules)
2. [Member routing spine](#member-routing-spine)
3. [Flag catalog](#flag-catalog)
4. [Stage definitions](#stage-definitions)
5. [Event cards](#event-cards)
  - [1. ילדות](#1-ילדות)
  - [2. בית ספר](#2-בית-ספר)
  - [3. צבא](#3-צבא)
  - [4. טיול אחרי צבא](#4-טיול-אחרי-צבא)
  - [5. בחזרה לארץ](#5-בחזרה-לארץ)
  - [6. הקריירה](#6-הקריירה)
  - [7. שאזאמאט](#7-שאזאמאט)
6. [Recurring rare: מה עם שאזאמאט](#recurring-rare-מה-עם-שאזאמאט)
7. [Tone notes](#tone-notes)
8. [Needs Aviad](#needs-aviad)

---



## Design rules

- **Stages stay chronological and generic.** ילדות → בית ספר → צבא → טיול אחרי צבא → בחזרה לארץ → הקריירה → שאזאמאט. The player lives a life, not a discography.
- **Songs title events, not stages.** The lore tag appears in the kicker. Fans recognise it. New players just see a situation.
- **Events are things that happened**, never "what do you prefer?" Every headline reads like something that occurred.
- **Affinity follows biography, not instrument.** Army unit, trip destination, day job, and the real stories are what routes the player to a member. The instrument surfaces only at the reveal.
- **Album chronology doesn't constrain life chronology.** A song can land in any stage if it fits the story.
- **Not every interlude becomes an event.** `שוואסנה`, `שפוך ורע לו`, `דוד שחר`, `רכב מפורק – שאזאבבילון` are too short. Skip or use as ultra-rare flavor text only.
- **Full run: 2–3 events per stage** (~18 cards, ~5 min). Keystone events have high `weight` so the biographical spine always appears.

---



## Member routing spine

These are the choices that meaningfully move affinities. Everything else is flavor, stats, and jokes.


| Gate            | Event          | Routing                                                                                                                                                                      |
| --------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| מוצא            | קוקילידה       | צפון (קרית טבעון, אלון הגליל) → גדעון, ניר · צפון רחוק (יפתח/גונן) → שי, נמרוד, איתי · מרכז (שפיים, מפתח תקווה) → ריף, אביעד |
| צבא             | היידה ניצחונות | נח״ל → אביעד, נמרוד, איתי, ריף, ניר, גדעון · גולני → שי                                                                            |
| טיול            | תופס אוויר     | הודו → שי · דרום אמריקה → ריף, ניר · מזרח אסיה → נמרוד · ארה״ב → אביעד, גדעון · אוסטרליה → איתי                                    |
| עבודה           | שירת התפרנים   | וולט → ריף, ניר, גדעון · הייטק → אביעד · רק מוזיקה → נמרוד, שי, איתי                                                               |
| בית ספר למוזיקה | עכשיו זה הזמן  | רימון → אביעד, נמרוד, שי · BPM → ריף · אקדמיה ירושלים → איתי · לא לומד → ניר, גדעון                                                |


**Itay vs Nimrod tiebreak** — both from יפתח. Separate by: איתי is always late (`alwaysLate` flag from `היום אני לא`) + Australia + drums academy. נמרוד is East Asia + guitar/Rimon.

---



## Flag catalog

Document new flags here before using them in events.


| Key                 | Type                                                                         | Set by                      |
| ------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| `hometown`          | `"north" \| "far-north" \| "center"`                                          | `childhood-kookilida`       |
| `alwaysLate`        | `boolean`                                                                    | `school-hayom-ani-lo`       |
| `romantic`          | `boolean`                                                                    | `school-sheva-lev-adom`     |
| `armyUnit`          | `"nahal" | "golani"`                                                         | `army-hayda-nitzhonot`      |
| `protestSeed`       | `boolean`                                                                    | `army-rak-litzok`           |
| `travelDestination` | `"india" | "south-america" | "east-asia" | "usa" | "australia"`              | `trip-tofes-avir`           |
| `tookDrug`          | `boolean`                                                                    | `trip-mayim-amukim`         |
| `quitSmoking`       | `boolean`                                                                    | `trip-allen-carr`           |
| `didGraffiti`       | `boolean`                                                                    | `home-ashkenazi-betahana`   |
| `gotArrested`       | `boolean`                                                                    | `home-rak-litzok-payoff`    |
| `dayJob`            | `"wolt" | "hitech" | "music-only"`                                           | `home-shirat-hamitparnasim` |
| `musicSchool`       | `"rimon" | "bpm" | "academy" | "none"`                                       | `career-achshav-ze-hazman`  |
| `seenMaIm`          | `boolean`                                                                    | any מה עם שאזאמאט variant   |


---



## Stage definitions

These replace the two placeholder stages in `src/game/content/stages.ts`.

```ts
// stages.ts
[
  { id: "childhood",    label: "ילדות",           ageLabel: "גילאי 6–12",  eventCount: 2 },
  { id: "school",       label: "בית ספר",          ageLabel: "גילאי 13–18", eventCount: 3 },
  { id: "army",         label: "צבא",              ageLabel: "גילאי 18–21", eventCount: 3 },
  { id: "trip",         label: "טיול אחרי צבא",   ageLabel: "גילאי 21–23", eventCount: 3 },
  { id: "home",         label: "בחזרה לארץ",       ageLabel: "גילאי 23–27", eventCount: 3 },
  { id: "career",       label: "הקריירה",          ageLabel: "גילאי 27–30", eventCount: 3 },
  { id: "shazamat",     label: "שאזאמאט",          ageLabel: "ההווה",        eventCount: 3 },
]
```

`onEnter` effects (sprite swap) TBD by the artist. Placeholders: child → teen → soldier → backpack/plain → casual → musician → band-shirt.

---



## Event cards

Each card is formatted as a draft spec. Hebrew copy is a first draft — adjust tone, shorten button labels for mobile thumbs, and verify song names match the Spotify screenshots.

Format legend:

- **lore:** song or album that titles/inspires the event
- **id:** `[stage]-[slug]` — unique across the entire pack
- **rarity:** common / rare / ultra
- **weight:** relative draw weight (default 1)
- **requires:** condition gate (engine condition syntax)
- **roll:** probabilistic outcome (weight:total)

---



### 1. ילדות

`eventCount: 2` — exactly 2 cards: קוקילידה (keystone) and אולה. Both always fire.

---



#### קוקילידה *(keystone)*

```
lore: "קוקילידה" — בוא נרגע (EP 2020)
id: childhood-kookilida
stage: childhood
weight: 10
rarity: common
oncePerRun: true
mood: funny
scene: childhood-bedroom
```

**kicker:** גיל 7 — הקיוסק של השכונה

**headline:** יש קוקילידה בקיוסק.

**body:** אתה עומד מול הוויטרינה. מאחוריך, השכונה שלך. איפה זה?

**choices:**


| id           | label       | effects                                                                         |
| ------------ | ----------- | ------------------------------------------------------------------------------- |
| `north`      | צפון        | `affinity gidon+5, nir+5` · `setFlag hometown north`                            |
| `far-north`  | צפון רחוק   | `affinity shay+5, nimrod+5, itay+5` · `setFlag hometown far-north`              |
| `center`     | מרכז        | `affinity reef+5, aviad+5` · `setFlag hometown center`                          |

> צפון = קרית טבעון (גדעון), אלון הגליל (ניר) · צפון רחוק = קיבוץ גונן (שי), קיבוץ יפתח (נמרוד, איתי) · מרכז = קיבוץ שפיים (ריף), מפתח תקווה (אביעד)

---



#### אולה

```
lore: "אולה" — בוא נרגע (EP 2020)
id: childhood-ola
stage: childhood
weight: 6
rarity: common
oncePerRun: true
mood: funny
scene: school-classroom
```

**kicker:** גיל 8 — הפסקה

**headline:** מישהו בחצר צועק מילה שאף אחד לא הגדיר.

**body:** כולם מסתכלים. הוא צועק שוב. זה נשמע כמו שם. זה לא שם.

**choices:**


| id          | label       | effects                                           |
| ----------- | ----------- | ------------------------------------------------- |
| `yell-back` | לצעוק בחזרה | `stat swag+6` · `affinity gidon+3, nir+3`         |
| `ignore`    | להתעלם      | `stat musicianship+3` · `affinity shay+2, reef+2` |


---



~~**ליגה לאומית** — cut by Aviad (2026-09-01). Childhood runs with 2 cards: קוקילידה + אולה.~~

---



### 2. בית ספר

`eventCount: 3` — draws 3 from a pool of 5–6.

---



#### חבר מביא חבר *(keystone)*

```
lore: "חבר מביא חבר" — שיחת ליטופים (2023)
id: school-haver-mevi-haver
stage: school
weight: 10
rarity: common
oncePerRun: true
mood: neutral
scene: school-practice-room
```

**kicker:** גיל 14 — חדר החזרות

**headline:** יש בחור בבית הספר שמנגן גיטרה. הוא הביא עוד בחור. גם הוא מנגן.

**body:** אחד מהם מסתכל עלייך ואומר: "אתה מנגן על משהו?"

**choices:**


| id        | label        | effects                                                                                                       |
| --------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| `yes`     | "כן"         | `stat musicianship+8` · `affinity aviad+2, nimrod+2, itay+2, shay+2, reef+2` · `setFlag joinedFirstBand true` |
| `no-crew` | "אנלא בגאנג" | `stat swag+6` · `affinity nir+4, gidon+4`                                                                     |


---



#### היום אני לא *(keystone)*

```
lore: "היום אני לא" — שיחת ליטופים (2023)
id: school-hayom-ani-lo
stage: school
weight: 10
rarity: common
oncePerRun: true
mood: funny
scene: school-classroom
```

**kicker:** גיל 15 — שש וחצי בבוקר

**headline:** השעון מצלצל. שיעור ראשון בעוד עשרים דקות.

**body:** המיטה מנצחת.

**choices:**


| id       | label        | effects                                                       |
| -------- | ------------ | ------------------------------------------------------------- |
| `snooze` | עוד חמש דקות | `stat swag+3` · `affinity itay+5` · `setFlag alwaysLate true` |
| `get-up` | לקום         | `stat musicianship+3` · `affinity nimrod+2, shay+2`           |


---



#### ילד מניאק *(may cut later)*

```
lore: "ילד מניאק" — שיחת ליטופים (2023)
id: school-yeled-maniac
stage: school
weight: 4
rarity: common
oncePerRun: true
mood: funny
scene: school-classroom
```

**kicker:** גיל 16 — שיעור מתמטיקה

**headline:** המורה מסתכלת עלייך.

**body:** לא בגלל שעשית משהו. בגלל שאתה אתה.

**choices:**


| id          | label                | effects                                   |
| ----------- | -------------------- | ----------------------------------------- |
| `lean-in`   | ״מה?״                | `stat swag+5` · `affinity gidon+4, nir+4` |
| `sit-still` | לנסות להיראות נורמלי | `stat musicianship+3` · `affinity shay+3` |


---



#### תחושת בטן *(roll)*

```
lore: "תחושת בטן" — שיחת ליטופים (2023)
id: school-tahushat-beten
stage: school
weight: 5
rarity: common
oncePerRun: true
mood: tense
scene: school-stage
```

**kicker:** גיל 17 — יום שישי בלילה

**headline:** יש תוכנית. לא ברור למה.

**body:** כולם בטוחים שזה יצא מעולה.

**choices:**


| id     | label      | roll                                                                                                                                         |
| ------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `go`   | ״יאללה״    | 60% → לילה אגדי (`stat swag+10, musicianship+5` · `affinity gidon+3, nir+3`) / 40% → ״הורים בוחרים בשקט״ (`stat swag-8` · `affinity shay+2`) |
| `bail` | ״אני עייף״ | direct effects: `stat musicianship+4` · `affinity shay+3, reef+3`                                                                            |


**Roll outcome labels:**

- 60%: "הלך מצוין. כנראה."
- 40%: "זה לא הלך כמו שתכננת. בכלל."

---



#### שבע לב אדום

```
lore: "שבע לב אדום" — שיחת ליטופים (2023)
id: school-sheva-lev-adom
stage: school
weight: 5
rarity: common
oncePerRun: true
mood: neutral
scene: school-classroom
```

**kicker:** גיל 17 — אחרי שיעורים

**headline:** יש מישהי.

**body:** היא לא יודעת שאתה קיים. זו לא בהכרח בעיה.

**choices:**


| id          | label               | effects                                                     |
| ----------- | ------------------- | ----------------------------------------------------------- |
| `all-in`    | ללכת על זה בכל הכוח | `stat swag+5` · `affinity reef+5` · `setFlag romantic true` |
| `play-cool` | לשמור על קול        | `stat musicianship+4` · `affinity nimrod+3, aviad+2`        |


---



#### שיחת ליטופים – אשכן / גדעון *(rare, affinity-gated, unreviewed)*

```
lore: "שיחת ליטופים" — שיחת ליטופים (2023)
id: school-siahat-litufim
stage: school
weight: 1
rarity: rare
oncePerRun: true
mood: funny
requires: { type: "any", conditions: [
  { type: "affinity", memberId: "nir", min: 10 },
  { type: "affinity", memberId: "gidon", min: 10 }
]}
```

**kicker:** גיל 18 — שבוע לפני הגיוס

**headline:** שיחה שאי אפשר להסביר אותה לאף אחד מבחוץ.

**body:** (ריק — האירוע עצמו הוא הפאנצ׳ליין)

**choices:**


| id      | label     | effects                                           |
| ------- | --------- | ------------------------------------------------- |
| `nod`   | לאשר בראש | `stat swag+8` · `affinity nir+5, gidon+5`         |
| `stare` | להביט     | `stat musicianship+3` · `affinity nir+2, gidon+2` |


> **Needs Aviad:** Track 1 of שיחת ליטופים was cut off in the screenshot. Confirm the title and whether this rare fires for "אשכן" (ניר) or "גדעון" specifically, or both.

---



### 3. צבא

`eventCount: 3` — draws 3 from a pool of 4. התעוררנו מאוחר may be cut later.

---



#### היידה ניצחונות *(keystone)*

```
lore: "היידה ניצחונות" — רכב מפורק (2024)
id: army-hayda-nitzhonot
stage: army
weight: 10
rarity: common
oncePerRun: true
mood: tense
scene: school-stage
```

**kicker:** גיל 18 — מרכז הגיוס

**headline:** פרופיל 97. אתה הולך לקרבי.

**body:** הקצין שואל לאן אתה מבקש. לפניך שני אוטובוסים.

**choices:**


| id       | label | effects                                                                                                         |
| -------- | ----- | --------------------------------------------------------------------------------------------------------------- |
| `nahal`  | נח״ל  | `affinity aviad+4, nimrod+4, itay+4, reef+4, nir+4, gidon+4` · `setFlag armyUnit nahal` · `stat musicianship+3` |
| `golani` | גולני | `affinity shay+8` · `setFlag armyUnit golani` · `stat swag+5`                                                   |


---



#### פסק זמן – מחצית

```
lore: "פסק זמן – מחצית" — התעוררנו מאוחר (2022)
id: army-pesek-zman
stage: army
weight: 6
rarity: common
oncePerRun: true
mood: funny
scene: school-classroom
```

**kicker:** גיל 19 — חופשת שישי

**headline:** יש לך שתים עשרה שעות.

**body:** אתה בבית. כולם ישנים. הבית שקט.

**choices:**


| id           | label                     | effects                                   |
| ------------ | ------------------------- | ----------------------------------------- |
| `basketball` | כדורסל / NBA בטלוויזיה    | `stat swag+5` · `affinity aviad+4, nir+3` |
| `football`   | כדורגל — לשחק שוער        | `stat swag+4` · `affinity gidon+4`        |
| `sleep`      | לישון עוד ארבע שעות       | `stat swag+3` · `affinity itay+5`         |
| `laptop`     | לפתוח לפטופ ולעשות מוזיקה | `stat musicianship+7` · `affinity shay+5` |


---



#### רק לצעוק

```
lore: "רק לצעוק" — שיחת ליטופים (2023)
id: army-rak-litzok
stage: army
weight: 5
rarity: common
oncePerRun: true
mood: tense
scene: school-stage
```

**kicker:** גיל 20 — חופשת שישי

**headline:** יש הפגנה בתל אביב.

**body:** לא כולם הולכים. אתה יכול.

**choices:**


| id     | label        | effects                                                         |
| ------ | ------------ | --------------------------------------------------------------- |
| `go`   | ללכת         | `stat swag+6` · `affinity gidon+5` · `setFlag protestSeed true` |
| `stay` | להישאר בבסיס | `stat musicianship+4` · `affinity shay+3, nimrod+2`             |


---



#### התעוררנו מאוחר *(maybe cut later)*

```
lore: "התעוררנו מאוחר" — התעוררנו מאוחר (2022)
id: army-hitoreinu-meuhar
stage: army
weight: 3
rarity: common
oncePerRun: true
mood: funny
scene: school-classroom
```

**kicker:** גיל 19 — חמש בבוקר

**headline:** הכינוס התחיל לפני שש דקות.

**body:** כולם שם. חוץ ממך.

**choices:**


| id       | label       | effects                                   |
| -------- | ----------- | ----------------------------------------- |
| `sprint` | לרוץ בפחד   | `stat musicianship+2` · `affinity itay+5` |
| `stroll` | להיכנס בנחת | `stat swag+7` · `affinity nir+4`          |


---



### 4. טיול אחרי צבא

`eventCount: 3` — draws 3 from a pool of 4+ (destination color counts as 1 of the 3).

---



#### תופס אוויר *(keystone)*

```
lore: "תופס אוויר" — תופס אוויר (2021)
id: trip-tofes-avir
stage: trip
weight: 10
rarity: common
oncePerRun: true
mood: epic
scene: school-stage
```

**kicker:** גיל 21 — נמל תעופה בן גוריון

**headline:** הצבא נגמר. הדרכון ביד.

**body:** לאן?

**choices:**


| id              | label       | effects                                                                              |
| --------------- | ----------- | ------------------------------------------------------------------------------------ |
| `india`         | הודו        | `affinity shay+6` · `setFlag travelDestination india` · `stat musicianship+5`        |
| `south-america` | דרום אמריקה | `affinity reef+5, nir+5` · `setFlag travelDestination south-america` · `stat swag+5` |
| `east-asia`     | מזרח אסיה   | `affinity nimrod+6` · `setFlag travelDestination east-asia` · `stat musicianship+4`  |
| `usa`           | ארצות הברית | `affinity aviad+5, gidon+5` · `setFlag travelDestination usa` · `stat swag+4`        |
| `australia`     | אוסטרליה    | `affinity itay+6` · `setFlag travelDestination australia` · `stat musicianship+4`    |


---



#### מים עמוקים *(roll)*

```
lore: "מים עמוקים" — תופס אוויר (2021)
id: trip-mayim-amukim
stage: trip
weight: 6
rarity: common
oncePerRun: true
mood: tense
```

**kicker:** גיל 22 — איפשהו בחו״ל

**headline:** בחור שנראה לגמרי אמין מציע לך משהו.

**body:** הוא אומר שזה "החומר הטוב". הוא נראה כמו מישהו שמוכר ציוד גנוב בשוק. יש לו עיניים ידידותיות.

**choices:**


| id    | label                      | roll                                                                                                                                                                              |
| ----- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yes` | "בסדר"                     | 50% → גילוי מוזיקלי (`stat musicianship+15` · `affinity shay+3` · `setFlag tookDrug true`) / 50% → הטיסה הראשונה חזרה (`stat swag-10` · `advanceStage` · `setFlag tookDrug true`) |
| `no`  | "יש לי הורים שאוהבים אותי" | direct: `stat swag+3` · `affinity aviad+3`                                                                                                                                        |


**Roll outcome labels:**

- 50%: "התגלית המוזיקלית הכי גדולה בחייך."
- 50%: "ראית מספיק מהעולם. הזמנת כרטיס הביתה."

---



#### Destination color cards *(one fires per run, gated by* `travelDestination`*)*

---



##### מה עם שאזאמאט וגביע האש *(הודו)*

```
lore: "מה עם שאזאמאט וגביע האש" — תופס אוויר (2021)
id: trip-destination-india
stage: trip
weight: 6
rarity: common
oncePerRun: true
mood: epic
requires: { type: "flag", key: "travelDestination", value: "india" }
```

**kicker:** גיל 22 — גואה

**headline:** אתה ער כבר שלושים ושש שעות.

**body:** לא ברור אם זה בגלל הים, המוזיקה, או מה שהיה אתמול. כנראה שילוב.

**choices:**


| id           | label  | effects                                           |
| ------------ | ------ | ------------------------------------------------- |
| `keep-going` | להמשיך | `stat musicianship+8, swag+5` · `affinity shay+5` |
| `sleep`      | לישון  | `stat musicianship+5` · `affinity itay+3`         |


---



##### מסע פילים *(דרום אמריקה)*

```
lore: "מסע פילים" — שיחת ליטופים (2023)
id: trip-destination-south-america
stage: trip
weight: 6
rarity: common
oncePerRun: true
mood: epic
requires: { type: "flag", key: "travelDestination", value: "south-america" }
```

**kicker:** גיל 22 — בואנוס איירס

**headline:** אתה על אוטובוס שאי אפשר להסביר לאן הוא הולך.

**body:** מישהו שישב לידך יצא בתחנה שלפני. השאיר ספר בספרדית. אתה לא מדבר ספרדית.

**choices:**


| id                 | label               | effects                                          |
| ------------------ | ------------------- | ------------------------------------------------ |
| `read-it`          | לנסות לקרוא את הספר | `stat musicianship+6` · `affinity reef+4, nir+3` |
| `stare-out-window` | להסתכל על הנוף      | `stat swag+6` · `affinity reef+3, nir+4`         |


---



##### לואי ויטון *(ארה״ב)*

```
lore: "לואי ויטון" — תופס אוויר (2021)
id: trip-destination-usa
stage: trip
weight: 6
rarity: common
oncePerRun: true
mood: funny
requires: { type: "flag", key: "travelDestination", value: "usa" }
```

**kicker:** גיל 22 — ניו יורק

**headline:** אתה עומד מחוץ לחנות עם ויטרינה יפה מאוד.

**body:** המחיר שרשום בחלון הוא לא לך. אבל.

**choices:**


| id     | label         | effects                                              |
| ------ | ------------- | ---------------------------------------------------- |
| `flex` | להיכנס        | `stat swag+8` · `affinity gidon+4, aviad+3`          |
| `save` | לשמור את הכסף | `stat musicianship+4` · `affinity aviad+4, nimrod+3` |


---



##### גדול עליי *(אוסטרליה)*

```
lore: "גדול עליי" — תופס אוויר (2021)
id: trip-destination-australia
stage: trip
weight: 6
rarity: common
oncePerRun: true
mood: epic
requires: { type: "flag", key: "travelDestination", value: "australia" }
```

**kicker:** גיל 22 — בונדי ביץ׳

**headline:** זה גדול עלייך.

**body:** הים. השמיים. האנשים. הכל. גדול עלייך.

**choices:**


| id         | label        | effects                                    |
| ---------- | ------------ | ------------------------------------------ |
| `absorb`   | להישאר עם זה | `stat musicianship+8` · `affinity itay+6`  |
| `call-mom` | להתקשר לאמא  | `stat swag+3` · `affinity itay+3, aviad+2` |


---



##### שחק את המשחק *(מזרח אסיה)*

```
lore: "שחק את המשחק" — רכב מפורק (2024)
id: trip-destination-east-asia
stage: trip
weight: 6
rarity: common
oncePerRun: true
mood: neutral
requires: { type: "flag", key: "travelDestination", value: "east-asia" }
```

**kicker:** גיל 22 — טוקיו

**headline:** הכל מסודר. הכל שקט. הכל עובד.

**body:** זה מוזר בצורה שממש עובדת.

**choices:**


| id              | label          | effects                                     |
| --------------- | -------------- | ------------------------------------------- |
| `embrace-order` | להיכנע לסדר    | `stat musicianship+7` · `affinity nimrod+6` |
| `find-chaos`    | למצוא את הבלגן | `stat swag+6` · `affinity nir+3, gidon+3`   |


---



#### אלן קאר

```
lore: "אלן קאר" — רכב מפורק (2024)
id: trip-allen-carr
stage: trip
weight: 4
rarity: common
oncePerRun: true
mood: funny
```

**kicker:** גיל 22 — אכסניה

**headline:** על השולחן: חפיסת סיגריות. פחות מחצי.

**body:** אתה מעשן כבר שלוש שנים. זה לא ממש תוכנית, זה פשוט קרה. אבל אולי עכשיו זה הזמן.

**choices:**


| id           | label                   | effects                                    |
| ------------ | ----------------------- | ------------------------------------------ |
| `quit`       | לגמור את החפיסה ולהפסיק | `stat swag-5` · `setFlag quitSmoking true` |
| `keep-going` | להמשיך                  | `stat swag+5`                              |


> The joke is that quitting makes you less cool. No musicianship move — this is a pure swag gag.

---



#### מי יכול עליי *(rare)*

```
lore: "מי יכול עליי" — תופס אוויר (2021)
id: trip-mi-yachol-alay
stage: trip
weight: 1
rarity: rare
oncePerRun: true
mood: tense
```

**kicker:** גיל 22 — בר, איפשהו

**headline:** מישהו שנראה לא נחמד מסתכל עלייך.

**body:** אתה רגוע לחלוטין. הוא ממשיך להסתכל.

**choices:**


| id           | label      | effects                                    |
| ------------ | ---------- | ------------------------------------------ |
| `stare-back` | להחזיר מבט | `stat swag+10` · `affinity nir+4, gidon+3` |
| `leave`      | ללכת       | `stat musicianship+3` · `affinity shay+3`  |


---



### 5. בחזרה לארץ

`eventCount: 3` — draws 3 from a pool of 5. `רק לצעוק` payoff requires `protestSeed` — won't always fire.

---



#### שירת התפרנים *(keystone)*

```
lore: "שירת התפרנים" — רכב מפורק (2024)
id: home-shirat-hamitparnasim
stage: home
weight: 10
rarity: common
oncePerRun: true
mood: funny
scene: school-classroom
```

**kicker:** גיל 23 — תל אביב

**headline:** השכירות צריכה להשתלם.

**body:** לפניך שלוש אפשרויות. כולן לגיטימיות. כולן עצובות קצת.

**choices:**


| id           | label      | effects                                                                                   |
| ------------ | ---------- | ----------------------------------------------------------------------------------------- |
| `wolt`       | שליח ווֹלט | `stat swag+5` · `affinity reef+4, nir+4, gidon+4` · `setFlag dayJob wolt`                 |
| `hitech`     | הייטק      | `stat musicianship+3` · `affinity aviad+6` · `setFlag dayJob hitech`                      |
| `music-only` | רק מוזיקה  | `stat musicianship+8` · `affinity nimrod+4, shay+4, itay+4` · `setFlag dayJob music-only` |


---



#### אשכנזי בתחנה *(keystone, roll)*

```
lore: "אשכנזי בתחנה" — רכב מפורק (2024)
id: home-ashkenazi-betahana
stage: home
weight: 8
rarity: common
oncePerRun: true
mood: funny
scene: school-stage
```

**kicker:** גיל 24 — דרום תל אביב, אחרי חצות

**headline:** יש פחית ספריי. יש קיר. יש "שאזאמאט".

**body:** כולכם שם. מישהו אומר ״שאם תפסו אותנו זה בגלל הג׳ינג׳י.״

**choices:**


| id          | label            | roll                                                                                                                                                                                                                              |
| ----------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spray`     | לרסס             | 70% → ברחתם בזמן (`stat swag+8` · `affinity gidon+4, nir+4` · `setFlag didGraffiti true`) / 30% → תחנת המשטרה (`stat swag+5` · `affinity nir+3, gidon+3` · `setFlag didGraffiti true` · `gotoEvent home-ashkenazi-tahana-sequel`) |
| `lookout`   | לעמוד שמירה      | 70% → עבר בשקט (`stat musicianship+4` · `affinity aviad+5` · `setFlag didGraffiti true`) / 30% → ראו אתכם (`stat swag+3` · `affinity aviad+4` · `setFlag didGraffiti true`)                                                       |
| `walk-away` | ״אני הולך הביתה״ | direct: `stat musicianship+5` · `affinity shay+5`                                                                                                                                                                                 |


**Roll outcome labels:**

- 70% spray: "ברחתם. ספריי עדיין יורד על הידיים."
- 30% spray: "ישבתם בתחנה עד השש בבוקר."
- 70% lookout: "עבר בשלום. בקושי."
- 30% lookout: "ראו אתכם. לא עצרו. עדיין."

> **Implementation note:** The 30% "spray" roll outcome uses `gotoEvent home-ashkenazi-tahana-sequel` to queue a flavour follow-up the next turn — a short card that costs no choice, just a line about the station. This is optional polish; the game works without the sequel card.

---



#### רק לצעוק – הפח *(payoff, requires* `protestSeed`*)*

```
lore: "רק לצעוק" — שיחת ליטופים (2023)
id: home-rak-litzok-payoff
stage: home
weight: 6
rarity: common
oncePerRun: true
mood: tense
requires: { type: "flag", key: "protestSeed", value: true }
```

**kicker:** גיל 25 — הפגנה, תל אביב

**headline:** מישהו הדליק פח.

**body:** האש גבוהה. המשטרה בדרך. לידך עומד גדעון עם מבט שאומר הכל.

**choices:**


| id         | label          | effects                                                          |
| ---------- | -------------- | ---------------------------------------------------------------- |
| `claim-it` | ״זה הייתי אני״ | `stat swag+10` · `affinity gidon+8` · `setFlag gotArrested true` |
| `run`      | לרוץ           | `stat swag+5` · `affinity nir+4, gidon+3`                        |
| `document` | לצלם מהצד      | `stat musicianship+4` · `affinity shay+5`                        |


---



#### שום דבר חדש / שים לב

```
lore: "שום דבר חדש" — תופס אוויר (2021) / "שים לב" — שיחת ליטופים (2023)
id: home-shum-davar-hadash
stage: home
weight: 5
rarity: common
oncePerRun: true
mood: sad
scene: school-classroom
```

**kicker:** גיל 26 — סטודיו, לילה

**headline:** על שולחן העבודה: קפה קר, מתאם אודיו, ותיבת כדורים.

**body:** שי ממשיך לערבב. זה המיקס הרביעי של הלילה.

**choices:**


| id            | label               | effects                                   |
| ------------- | ------------------- | ----------------------------------------- |
| `acknowledge` | ״אחי, אתה ישן?״     | `stat musicianship+5` · `affinity shay+7` |
| `keep-mixing` | להמשיך לעבוד        | `stat musicianship+7` · `affinity shay+4` |
| `walk-away`   | לצאת בלי להגיד כלום | `stat swag+3`                             |


> **Tone:** Israeli matter-of-factness. The blister pack is just there, like the coffee. Not a punchline, not a lesson. Both choices that *notice* it move שי.

---



#### חברים ערסים

```
lore: "דרום 03" — רכב מפורק (2024)
id: home-haverim-arsim
stage: home
weight: 4
rarity: common
oncePerRun: true
mood: funny
```

**kicker:** גיל 25 — שישי בצהריים

**headline:** חברים מהשכונה הגיעו לתל אביב.

**body:** הם לא השתנו בכלל. אתה — שאלה פתוחה.

**choices:**


| id               | label           | effects                                             |
| ---------------- | --------------- | --------------------------------------------------- |
| `stay-with-them` | להשאר           | `stat swag+6` · `affinity aviad+6`                  |
| `pretend-busy`   | ״יש לי עניינים״ | `stat musicianship+4` · `affinity nimrod+3, shay+3` |


---



### 6. הקריירה

`eventCount: 3` — draws 3 from a pool of 4.

---



#### עכשיו זה הזמן *(keystone)*

```
lore: "עכשיו זה הזמן" — רכב מפורק (2024)
id: career-achshav-ze-hazman
stage: career
weight: 10
rarity: common
oncePerRun: true
mood: neutral
scene: school-stage
```

**kicker:** גיל 27 — ינואר

**headline:** יש הרשמה לבתי ספר למוזיקה.

**body:** לאן?

**choices:**


| id          | label                   | effects                                                                                    |
| ----------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| `rimon`     | רימון                   | `stat musicianship+8` · `affinity aviad+4, nimrod+4, shay+4` · `setFlag musicSchool rimon` |
| `bpm`       | BPM                     | `stat musicianship+7` · `affinity reef+6` · `setFlag musicSchool bpm`                      |
| `academy`   | האקדמיה למוזיקה ירושלים | `stat musicianship+8` · `affinity itay+6` · `setFlag musicSchool academy`                  |
| `no-school` | לא ללמוד, פשוט לעשות    | `stat swag+6` · `affinity nir+5, gidon+5` · `setFlag musicSchool none`                     |


---



#### תכנית העלייב *(roll)*

```
lore: "תכנית העלייב" — רכב מפורק (2024)
id: career-tohnit-halive
stage: career
weight: 6
rarity: common
oncePerRun: true
mood: tense
scene: school-stage
```

**kicker:** גיל 28 — הופעה ראשונה

**headline:** אתה עומד מאחורי הקלעים. הבמה ממולך.

**body:** לא ידוע כמה אנשים יש שם. אפשר לשמוע שתיקה.

**choices:**


| id      | label | roll                                                                                                                                                               |
| ------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `go-on` | לעלות | 60% → ״הקהל שלך״ (`stat swag+10, musicianship+5` · `affinity gidon+4, nir+4`) / 40% → ״החדר היה ריק״ (`stat musicianship+8, swag-3` · `affinity shay+3, nimrod+3`) |


**Roll outcome labels:**

- 60%: "החדר היה שלך."
- 40%: "החדר היה כמעט ריק. ניגנת עד הסוף."

> For mobile: the "go-on" choice is the only option (no bail). The drama is in the roll.

---



#### בלעדינו אין משחק *(keystone)*

```
lore: "בלעדינו אין משחק" — תופס אוויר (2021)
id: career-blaadenu-en-mishak
stage: career
weight: 10
rarity: common
oncePerRun: true
mood: epic
```

**kicker:** גיל 29 — הודעה בוואטסאפ

**headline:** ״אנחנו מתחילים להקה. אתה בפנים?״

**body:** יש לך עבודה. יש לך שכירות. יש לך שש שניות להחליט.

**choices:**


| id          | label           | effects                                                                     |
| ----------- | --------------- | --------------------------------------------------------------------------- |
| `quit-job`  | לעזוב את העבודה | `stat musicianship+8, swag+5` · `affinity nimrod+5, shay+5, itay+5, reef+5` |
| `keep-both` | לשמור על שתיהן  | `stat musicianship+5` · `affinity aviad+8`                                  |


> "Keep both" is the Aviad path — he kept the הייטק job. It's a valid win, not a coward choice.

---



#### הארי פוטר *(rare)*

```
lore: "הארי פוטר" (as in גביע האש reference) — רכב מפורק (2024)
id: career-harry-potter
stage: career
weight: 1
rarity: rare
oncePerRun: true
mood: funny
```

**kicker:** גיל 28 — אחרי חזרה

**headline:** מישהו הביא את הגביע האש לחדר החזרות.

**body:** הספר, לא הסרט. לא ברור מה הוא עושה שם. לא ברור מי הביא.

**choices:**


| id       | label              | effects                                                     |
| -------- | ------------------ | ----------------------------------------------------------- |
| `read`   | לפתוח              | `stat musicianship+5, swag+5` · `affinity shay+3, nimrod+3` |
| `ignore` | ״אנחנו באמצע חזרה״ | `stat swag+4` · `affinity gidon+4, nir+3`                   |


---



### 7. שאזאמאט

`eventCount: 3` — draws 3 from a pool of 5.

---



#### קוזה נוסטרה *(keystone)*

```
lore: "קוזה נוסטרה" — רכב מפורק (2024)
id: shazamat-koza-nostra
stage: shazamat
weight: 10
rarity: common
oncePerRun: true
mood: epic
scene: school-stage
```

**kicker:** ההווה — הלהקה

**headline:** שבעה אנשים. אף אחד לא מפקד. כולם מפקדים.

**body:** זה עובד ממש לא ברור איך.

**choices:**


| id        | label                | effects                                                    |
| --------- | -------------------- | ---------------------------------------------------------- |
| `loyalty` | זה המשפחה            | `stat swag+6` · `affinity aviad+3, reef+3, gidon+3, nir+3` |
| `solo`    | אתה יכולת להיות סולו | `stat musicianship+5` · `affinity nimrod+4, shay+4`        |


---



#### טוסקנה *(requires* `romantic` *or high reef affinity)*

```
lore: "טוסקנה" — מכה בכנף (2019)
id: shazamat-toskana
stage: shazamat
weight: 5
rarity: common
oncePerRun: true
mood: funny
requires: { type: "any", conditions: [
  { type: "flag", key: "romantic", value: true },
  { type: "affinity", memberId: "reef", min: 20 }
]}
```

**kicker:** ההווה — חתונה שלישית

**headline:** ריף מתחתן שוב. עם אותה אישה. הפעם באיטליה.

**body:** זה המסיבה הכי יפה שהיית בה. גם השנייה הייתה יפה. גם הראשונה.

**choices:**


| id                  | label         | effects                                             |
| ------------------- | ------------- | --------------------------------------------------- |
| `fly-out`           | לטוס          | `stat swag+8` · `affinity reef+7`                   |
| `cant-i-have-a-gig` | ״יש לי הופעה״ | `stat musicianship+5` · `affinity nimrod+3, shay+3` |


---



#### הביתה

```
lore: "הביתה" — מכה בכנף (2019)
id: shazamat-habayta
stage: shazamat
weight: 6
rarity: common
oncePerRun: true
mood: sad
```

**kicker:** ההווה — הופעה, שישי

**headline:** לאחד מחברי הלהקה יש ילדה.

**body:** ההופעה נגמרת בחצות. הוא רוצה להיות שם בבוקר.

**choices:**


| id             | label          | effects                                               |
| -------------- | -------------- | ----------------------------------------------------- |
| `go-home`      | ״לך הביתה״     | `stat swag+5` · `affinity aviad+4, nimrod+4, gidon+4` |
| `stay-on-road` | ״אנחנו בהופעה״ | `stat musicianship+6` · `affinity itay+3, reef+3`     |


> The three who actually have daughters — Aviad, Nimrod, Gidon — get the bigger affinity bump. This fires for everyone; the real story only surfaces if those three are already leading.

---



#### הייטרים

```
lore: "הייטרים" — מכה בכנף (2019)
id: shazamat-heyterim
stage: shazamat
weight: 5
rarity: common
oncePerRun: true
mood: funny
```

**kicker:** ההווה — האינסטגרם

**headline:** מישהו כתב תגובה.

**body:** היא מיוחדת בצורה שקשה לתאר. כולם רואים אותה.

**choices:**


| id          | label         | effects                                            |
| ----------- | ------------- | -------------------------------------------------- |
| `clap-back` | לענות         | `stat swag+8` · `affinity gidon+5, nir+5`          |
| `mute`      | לנטרל ולהמשיך | `stat musicianship+5` · `affinity aviad+4, shay+3` |


---



#### שבע רעות / שבע טובות *(high weight, last-card feel)*

```
lore: "שבע רעות" / "שבע טובות" — מכה בכנף (2019)
id: shazamat-sheva-raot-tovot
stage: shazamat
weight: 8
rarity: common
oncePerRun: true
mood: epic
scene: school-stage
```

**kicker:** ההווה — שמחנו

**headline:** שבעה אנשים. לילה אחד. רק אחת מהשתיים יכולה לקרות.

**body:** לא ברור מה תהיה. זה לא היה ברור מאז.

**choices:**


| id            | label    | effects                                                                                              |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `sheva-tovot` | לילה טוב | `stat swag+8, musicianship+5` · `affinity aviad+2, itay+2, nimrod+2, shay+2, reef+2, nir+2, gidon+2` |
| `sheva-raot`  | לילה רע  | `stat swag+3` · `affinity gidon+4, nir+4, shay+3`                                                    |


> Neither choice is wrong. "Sheva Tovot" slightly boosts everyone — it's the canonical Shazamat night. "Sheva Raot" is funnier and better for the rappers.

---



#### לא אותו דבר *(quiet closer)*

```
lore: "לא אותו דבר" — מכה בכנף (2019)
id: shazamat-lo-oto-davar
stage: shazamat
weight: 3
rarity: common
oncePerRun: true
mood: sad
```

**kicker:** ההווה

**headline:** אתה לא אותו אחד שהיה בשכונה עם הקוקילידה.

**body:** ...

**choices:**


| id           | label   | effects                                           |
| ------------ | ------- | ------------------------------------------------- |
| `thats-fine` | זה בסדר | `stat musicianship+5, swag+5`                     |
| `not-sure`   | לא בטוח | `stat musicianship+3` · `affinity shay+3, reef+3` |


---



## Recurring rare: מה עם שאזאמאט

The "מה עם שאזאמאט" arc appears across 5 of 6 albums. One of these fires per run at most (gate: `requires: { type: "not", condition: { type: "flag", key: "seenMaIm" } }`). Superfan bait — fans see the wink; new players see a bizarre non-event.


| id                             | stage    | lore                                                                         |
| ------------------------------ | -------- | ---------------------------------------------------------------------------- |
| `school-ma-im-shavat-hamelech` | school   | מה עם שאזאמאט 3 – שבעת המלך (שיחת ליטופים, 2023)                             |
| `army-ma2shazamat`             | army     | מה2שאזאמאט (התעוררנו מאוחר, 2022)                                            |
| `trip-ma-im-gavia-haesh`       | trip     | מה עם שאזאמאט וגביע האש (תופס אוויר, 2021) — only if not used as India color |
| `home-ma-im`                   | home     | מה עם שאזאמאט? (רכב מפורק, 2024)                                             |
| `shazamat-hagashem-lo-yavo`    | shazamat | הגשם לא יבוא (מכה בכנף, 2019)                                                |


Each card has `oncePerRun: true` plus the `seenMaIm` gate. After firing, `setFlag seenMaIm true`.

Copy template (same tone for all):

**kicker:** [age + location]  
**headline:** ״מה עם שאזאמאט?״  
**body:** אין תשובה טובה לשאלה הזו.

**choices:**


| id       | label                 | effects                                                 |
| -------- | --------------------- | ------------------------------------------------------- |
| `shrug`  | לא יודע               | `stat swag+5` · `setFlag seenMaIm true`                 |
| `answer` | [תשובה ספציפית לגרסה] | `stat musicianship+3, swag+3` · `setFlag seenMaIm true` |


> **Needs Aviad:** Fill in the specific `answer` label per version — each one is a different Shazamat inside joke.

---



## Tone notes

**שי + pills** — Affectionate, specific, never diagnostic. The visual is the blister pack sitting on the mix desk next to the coffee cup. The choice is whether you *notice*. Both choices that engage move שי. Walking away cold gives nothing.

**גדעון's arrest / graffiti** — Cartoon crime. Nobody is a martyr. The police station scene is the punchline ("the ginger at the precinct"), not a statement. The dumpster fire is a separate beat only for players who set `protestSeed` in the army.

**וולט / הייטק** — Class comedy, not class commentary. Aviad kept the day job and it's a perfectly valid high-scoring path. Don't frame the "richer" choices as obviously better.

**ריף's three weddings** — Joyful running gag. He married the same woman three times. The Tuscany card should feel like a party invitation, not a scandal.

**ניר's ginger energy** — He's the ginger (`אשכן`). When he appears in a police station at 3am it's because the story went exactly how you'd expect.

---



## Needs Aviad

### ✅ Resolved (2026-09-01)

1. **Track 1 of שיחת ליטופים** — it's *מגלגל אבנים*. Not included as an event.
3. **ליגה לאומית** — cut. Childhood runs with `eventCount: 2` (קוקילידה + אולה).
5. **Hometown bucket count** — consolidated to 3 choices: צפון / צפון רחוק / מרכז.

### ⏳ Defer to later

2. **מה עם שאזאמאט — specific answer labels.** Each variant needs its own joke answer button. Aviad will fill these in when copy is being finalised.
4. **שיחת ליטופים – אשכן/גדעון rare** — tone and specific choices TBD. Keep the card in the pool as a stub; fill copy before implementation.

### 🔲 Still open

6. **Affinity point calibration** — keystone gates give 5–8 points each. A perfect run toward one member should reach ~50–70 points for that member and ~5–10 for others. Worth a sanity pass once all event copy is locked.

