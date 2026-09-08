# Tea House Solitaire

A calm matching solitaire played at a tea-house table. Tiles show painted animals and tea-house items. Built for elderly players at home.

## Language

**Table**:
The current round: every tile still in its seat, plus the companion's line.
_Avoid_: board, puzzle, game state

**Seat**:
A place on the table (column, row, layer). Faces are dealt onto seats.
_Avoid_: slot, cell, position (too vague)

**Tile**:
One piece sitting in a seat. The face is a painted animal or a tea-house item.
_Avoid_: card, block

**Face**:
Which picture a tile shows: an animal or a tea-house item. A pair is two tiles with the same face.
_Avoid_: suit, rank, type, icon

**Free**:
A tile that is not covered and has an open left or right side, so it may be tapped.
_Avoid_: unlocked, available, playable (too generic)

**Covered**:
A tile with another tile on a higher layer overlapping its seat.
_Avoid_: blocked (blocked also means “not free on the side”)

**Pair**:
Two free tiles with the same face. Early tables use one pair per face; later tables add extra pairs so the table can grow.
_Avoid_: match (the verb is fine; the noun is Pair)

**Level**:
Which table you are on, from 1 to 100000. Higher levels add layers, more tiles, and new faces. Each table always starts with a free pair.

| Levels | Layers | Tiles |
|---|---|---|
| 1–50 | 1 | 6 → 20 |
| 51–300 | 2 | 20 → 50 |
| 301–500 | 3 | 50 → 70 |
| 501–1000 | 4 | 70 → 100 |
| 1001–5000 | 5 | 100 → 130 |
| 5001–10000 | 6 | 130 → 150 |
| 10001–30000 | 7 | 150 → 180 |
| 30001–50000 | 8 | 180 → 200 |
| 50001–100000 | 9 | 200 → 300 |

_Avoid_: stage, world, difficulty setting

**Kind shuffle**:
When no pair is free, the companion rearranges remaining faces so a pair exists. The round never dies.
_Avoid_: reshuffle, restart, fail, lose

**Companion**:
The cat who sits at the table, points at a pair on Hint, and speaks the buddy line.
_Avoid_: mascot, NPC, hint system

**Buddy line**:
The one sentence the companion is saying right now.
_Avoid_: tooltip, message, toast
