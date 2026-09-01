# Shazamat Life Simulator — Concept Brief

## Goal

Create a genuinely fun, replayable browser game on the Shazamat website that works as a standalone experience — not as an obvious promotional quiz.

The game serves three goals simultaneously:

1. **Entertainment & virality** — something fans actually want to play, replay, compare, and share.
2. **Deepen the Shazamat universe** — the entire game is built from real stories, personalities, lyrics, songs, and inside jokes from the seven band members.
3. **Marketing funnel** — collect email addresses naturally, build a mailing list, and ultimately create a soft path toward buying tickets for the upcoming Shuni show.

The inspiration is partly the **Wu-Tang Name Generator**: give people something culturally fun and shareable, while the email collection happens almost invisibly as part of the experience.

But instead of a simple generator or personality quiz, this should feel like an actual **life-simulation game**.

---

## Core Fantasy

**“Live your entire life and discover which member of Shazamat you were destined to become.”**

The player starts as a child and progresses through different stages of life:

**Childhood → School → Teenage Years → Army → Post-Army Trip → Early Adulthood → Music Career → Shazamat**

At each stage, the player encounters decisions, random events, dilemmas, and absurd situations.

Eventually, their accumulated life choices determine which Shazamat member they become.

The seven possible endings are:

| Member | Role |
|---|---|
| Aviad | Bassist |
| Itay | Drummer |
| Nimrod | Guitarist |
| Shay | Producer |
| Reef | Keyboardist |
| Nir | Rapper |
| Gidon | Rapper |

The important distinction is that the player is **not explicitly choosing an instrument**.

They are choosing how to live their life.

The instrument/member emerges from those choices.

---

## Two Parallel Progression Systems

The game should have **visible stats** and **hidden stats**.

### Visible Stats

The player sees a small number of fun character attributes that change throughout the game.

For example:

- **Musicianship 🎸** — How technically/musically developed you've become.
- **Swag 😎** — How cool, charismatic, ridiculous, or culturally powerful your character has become.

Potentially there could be a third stat later, but two is probably enough initially.

These should behave like game stats.

For example:

> **+10 Musicianship**  
> **-5 Swag**

with a little animation, sound, sprite reaction, etc.

The player therefore gets immediate feedback and feels that their decisions matter.

### Hidden Shazamat Affinity

Behind the scenes, there are seven hidden scores:

```ts
aviad: 0
itay: 0
nimrod: 0
shay: 0
rif: 0
nir: 0
gideon: 0
```

Every decision can secretly move one or several of these.

The choices are based on **real events and details from the band members' lives**.

For example:

### Army

> You have profile 97.  
> Fuck. You're going to infantry.
>
> Where are you going?

- **Nahal**
- **Golani**

In reality, most of Shazamat served in Nahal, while Shay served in Golani.

So:

```text
Nahal → affinity toward the relevant band members
Golani → Shay +5
```

The player doesn't see this calculation.

They just know they made a life decision.

This gives fans an additional layer: people who know the band well will recognize the references.

---

## Life Decisions Should Be Based on the Actual Band

This is one of the most important principles.

Rather than inventing generic personality-test questions like:

> “Would you rather be on stage or in the studio?”

we use actual Shazamat history.

For example:

### Post-Army Trip

> The army is finally over.
>
> Where are you going?

- India
- South America
- East Asia
- United States

Each answer secretly moves the player closer to the band member(s) who actually traveled there.

This makes the game simultaneously:

- a life simulator
- a Shazamat trivia machine
- an inside-joke generator
- a personality test

without explicitly being any of those things.

---

## Randomness / Risk

Choices shouldn't always produce deterministic outcomes.

This is crucial for replayability.

For example, during the post-army trip:

> A suspicious-looking stranger offers you an equally suspicious-looking substance.
>
> Do you take it?

### No

Nothing happens. Life continues.

### Obviously

🎲 **50% chance:**

You have a life-changing musical revelation.

**+15 Musicianship**

🎲 **50% chance:**

You have the worst night of your life, decide you've “seen enough of the world,” and book the first flight back to Israel.

**-10 Swag**

**Trip ends immediately.**

This introduces **risk/reward**.

More importantly, the player can make the exact same decisions in another run and still get a different life.

That makes:

> **START A NEW LIFE**

meaningful.

---

## Events, Not Questions

The writing should avoid feeling like a questionnaire.

Instead of:

> “What do you prefer?”

the game constantly tells the player:

> **Something happened. What do you do?**

So each screen is effectively an **event card**.

Example structure:

### AGE 22 — GOA, INDIA

**[PIXEL ART SCENE]**

> You've been awake for 31 hours.
>
> A German guy called Florian says he knows someone who knows someone who has “the good stuff.”
>
> This feels extremely trustworthy.

- **→ Absolutely.**
- **→ I have parents who love me.**

Then:

🎲

**THE OUTCOME**

Sprite animation.

**+10 Musicianship**

Next event.

---

## Pixel-Art / Sprite System

The game should have a strong visual identity rather than being primarily text.

A **retro pixel-art life simulator** feels particularly suitable.

The player's sprite evolves throughout their life:

**Child → Teenager → Soldier → Traveler → Young Musician → Professional Musician → Shazamat Member**

We don't need AI image generation during gameplay.

Instead, build a modular sprite system from pre-generated assets.

For example:

```text
body
hair
shirt
pants
accessory
instrument
background
expression
```

The game can combine these assets dynamically.

This gives us lots of visual variation without needing hundreds of manually illustrated characters.

Choices can also modify the sprite.

For example:

- Joined a terrible teenage metal band → band shirt appears.
- Army → uniform.
- India → backpack / ridiculous pants.
- Musicianship rises → instrument appears.
- Certain event → stupid hat that remains for the rest of your life.

That last category is particularly useful because decisions leave **visible scars on the run**.

---

## Visual Event Cards

Every major event gets its own small visual scene/icon/sprite animation.

It doesn't need to be elaborate.

For example:

### Army Choice

Pixel-art soldier standing between two buses:

```text
← NAHAL       GOLANI →
```

### Drug Event

Tiny mysterious pixel bag appears.

### Bad Trip

Screen shakes / colors go insane / sprite looks horrified.

### Musical Breakthrough

Character suddenly plays an absurdly impressive bass solo.

The visuals turn otherwise simple decision trees into something that feels like an actual game.

---

## Branching Philosophy

We don't want an enormous traditional branching narrative where every decision creates completely separate storylines.

That becomes impossible to maintain.

Instead:

### Decisions change STATE.

The game then selects future events based on that state.

For example:

```ts
age
musicianship
swag

armyUnit
travelDestination
tookDrug
firstBand
relationshipStatus

affinity.aviad
affinity.itay
affinity.nimrod
affinity.shay
affinity.rif
affinity.nir
affinity.gideon
```

An event can have requirements.

For example:

```ts
if (
  travelDestination === "india" &&
  tookDrug === true &&
  musicianship > 40
) {
  // Unlock rare event
}
```

This allows the game to **feel massively branching** without actually requiring thousands of completely separate story paths.

---

## Rare Events

Some outcomes should be deliberately difficult to discover.

Maybe 5–10% probability.

For example:

> **ULTRA RARE EVENT**
>
> You accidentally played the correct note during soundcheck.

Or secret references to specific Shazamat songs.

This gives hardcore fans something to hunt for and creates social conversation:

> “Wait, you got THAT event?!”

---

## Shazamat Songs as Game Lore

Lyrics, song titles, characters, situations, and references from Shazamat's catalog can appear throughout the player's life.

Ideally they shouldn't feel like advertisements.

They're simply part of the game's universe.

Fans recognize them.

New players don't need to.

This means the game becomes richer the more someone knows Shazamat.

---

## The Ending

At the end, the game evaluates the hidden affinity scores alongside the player's life history.

Then:

> **YOUR LIFE IS COMPLETE**

A short recap of the ridiculous life they lived.

Then the reveal.

For example:

# YOU ARE AVIAD

**BASSIST**

**[Pixel Aviad appears]**

And preferably a custom explanation generated from the run:

> Against all statistical probability, you survived infantry, made several questionable decisions abroad, developed an unhealthy obsession with groove, and somehow ended up playing bass in Shazamat.

The player's final visible stats appear too:

**Musicianship: 87**  
**Swag: 63**

Potentially with additional silly achievements earned during the run.

---

## Shareability

The ending should automatically generate a beautiful share card.

Something like:

> **I lived an entire life and became AVIAD**
>
> 🎸 Bassist  
> Musicianship: 87  
> Swag: 63
>
> *What the fuck did you become?*
>
> **Shazamat Life Simulator**

With a visual of their final sprite.

The share URL should ideally preserve either the result or a run ID so someone clicking it can see:

> **Aviad became Aviad.**
>
> Think you can do better?
>
> **START YOUR LIFE**

That creates an actual viral loop instead of simply putting Instagram/TikTok share buttons at the end.

---

## Email Collection

The email shouldn't feel like:

> “Subscribe to our newsletter.”

A better framing is to make it part of the game.

For example, before the starting:

> **YOUR LIFE IS BEING CREATED.**
>
> One final step.
>

**[ EMAIL ]**

Then start the game immediately.

We should still clearly communicate whatever marketing consent is legally required, but from a UX perspective the email collection is embedded naturally in the experience.

The email gets stored in the existing database and becomes part of the Shazamat mailing audience.

---

## Shuni Integration

The Shuni show should **not dominate the game**.

If players smell “this entire thing is an ad for a concert” from the beginning, we've weakened the idea.

The game itself should be worth playing even if Shazamat weren't currently selling tickets.

Only at the end does the connection become explicit.

Something like:

> **Congratulations. You're officially in Shazamat.**
>
> Unfortunately, you have a show at Shuni on September 26.
>
> You should probably show up.

**GET TICKETS →**

That makes the CTA the punchline to the game rather than an interruption.

---

## The Core Design Principle

The strongest version of this isn't:

**“Which Shazamat member are you?”**

It's:

> **“Live a completely questionable life as an Israeli musician and find out where you end up.”**

Shazamat is the universe in which that life takes place.

And underneath that silly browser game is a very deliberate funnel:

**Play → invest 3–5 minutes → laugh → get a result → submit email → share → friend plays → discover Shazamat → ticket CTA.**

The key metric to optimize for isn't even email conversion initially.

It's **“New Life” rate**:

> If a meaningful percentage of people immediately play a second run, we've actually built a game rather than a marketing gimmick.
