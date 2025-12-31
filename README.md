# RogueDev


Product Requirements Document (PRD)

Project Title

Runtime Survivors
(Working title — rename later, not now)

Genre

Roguelike / Survivors-like
Top-down, 360° combat

Platform

Mobile Web App

Android phones only

Runs in Chrome-based browsers

Deployed via URL (PWA-ready later)


Orientation

Portrait only

One-hand playable



---

1. Product Vision

Runtime Survivors is a fast, chaotic roguelike where the player embodies a programming language runtime fighting bugs, system failures, and escalating complexity.

Each run is a deployment cycle:

Start fragile

Accumulate paradigms, optimizations, and tools

Become absurdly powerful

Collapse under scale


The game is about systems growing faster than control.


---

2. Target Player

Mobile users

Developers and non-developers alike

Familiar with swipe/tap interactions

Sessions played in short bursts


No coding knowledge required to enjoy the game.


---

3. Core Gameplay Loop (MVP)

1. Player spawns in center of arena


2. Enemies spawn from all directions


3. Enemies path toward player


4. Player auto-attacks using equipped weapon


5. Enemies drop XP (“Lines of Code”)


6. Level up → choose 1 of 3 upgrades


7. Difficulty scales continuously


8. Boss appears at fixed intervals


9. Player dies → run ends → meta unlocks



This loop must function with zero additional systems.


---

4. Controls (Mobile-First)

Left thumb: virtual joystick (movement)

Attacks: automatic

Optional on-screen button for special ability (future)

Pause button always visible


No aiming stick. No precision taps.


---

5. Player Character

Core Stats

Stability (HP)

Move Speed

Damage

Attack Speed

Area / Range

Cooldown Reduction


Stats scale via upgrades only during a run.


---

6. Classes (Programming Languages)

Each class represents a philosophy, not syntax.

MVP Classes (Max 3)

Python

High utility, low raw damage

Passive: +XP gain

Strong late-game scaling


C++

High damage, low forgiveness

Passive: Critical damage bonus

Lower starting HP


JavaScript

Flexible, chaotic

Passive: Chance to duplicate effects

Unpredictable builds


Each class starts with:

1 weapon

1 passive trait



---

7. Weapons (Execution Models)

Weapons define how damage is delivered.

MVP Weapons

Interpreter Beam
Continuous short-range damage

Compiler Burst
Slow, high-damage projectiles

Async Tasks
Delayed explosions around player

Garbage Collector
Periodic area-clearing pulse


Weapons scale via:

Damage

Fire rate

Projectile count

Area


No weapon switching mid-run in MVP.


---

8. Enemies (Bugs)

Enemies are abstract system failures.

MVP Enemy Types

Null Pointer

Slow, basic swarm enemy


Race Condition

Fast, low HP

Forces panic movement


Memory Leak

Tanky

Punishes staying in one area


Enemies only differ in:

Speed

HP

Size


No special abilities in MVP.


---

9. Bosses (System Failures)

Bosses spawn every X minutes.

Boss Rules

Large enemy

One clear mechanic

High pressure, not complexity

Drops a powerful upgrade


Example Bosses

Infinite Loop

Production Outage

Legacy Monolith


Only 1 boss required for MVP.


---

10. Upgrade System (Critical System)

Upgrades define replayability.

Upgrade Categories

Paradigms

Functional Programming

Object-Oriented

Event-Driven

Multithreading


Optimizations

Caching

Memoization

JIT Compilation


Tooling

Libraries

Frameworks

Debuggers


Upgrade Rules

Choose 1 of 3

Every upgrade has a tradeoff

Synergies > raw power


Example:

> “Functional Programming: projectiles chain to nearby enemies, but fire rate is reduced.”




---

11. Progression & Economy

In-Run

XP = Lines of Code

Used for leveling up only


Meta Progression

Currency: Dev Hours

Unlocks:

New classes

New weapons

New upgrades



No permanent damage boosts in MVP.


---

12. UI & UX Requirements

Large, readable text

Thumb-friendly buttons

High contrast visuals

No tooltips

Upgrade cards readable in <2 seconds


If the player must stop moving to read, the UI failed.


---

13. Audio & Feedback (Minimal)

Distinct hit sounds

Level-up sound cue

Boss spawn audio cue


No voice acting.


---

14. Technical Stack

Language

TypeScript


Engine

Phaser.js (2D Canvas)


Architecture

Scene-based

Entity-system style (lightweight, no heavy ECS)

Data-driven upgrades (JSON/TS objects)


Storage

LocalStorage or IndexedDB (meta progression)


Performance Targets

60 FPS on mid-tier Android

Max ~300 enemies on screen

No DOM manipulation during gameplay



---

15. Non-Goals (Explicit)

MVP will NOT include:

Multiplayer

Story mode

Skill trees

Crafting

Multiple maps

Online services



---

16. MVP Scope (Hard Limit)

To ship v1:

1 map

1 class

1 weapon

3 enemies

1 boss

15–20 upgrades


Anything beyond this is post-validation.


---

17. Success Criteria

First run playable without tutorial

Runs last 8–15 minutes

Player deaths feel earned

Builds feel meaningfully different after a few runs



---

Final Anchor

This game is not about programming jokes.
It’s about systems scaling faster than control.

TypeScript + Phaser gives you:

Fast iteration

Fewer bugs

Mobile-friendly performance

A straight path to shipping



