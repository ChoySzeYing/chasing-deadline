# Chasing Deadline
HDAT2102 Emerging Technologies – Interactive Game Prototype

## Concept
This is a survival resource-management game visualising student burnout.
The player must finish tasks before energy runs out, while avoiding unexpected stressors and seeking limited rest opportunities.

## Interaction
- WASD / Arrow keys: move your character
- Space: start / restart game
- Blue circles: tasks, stay inside to gain progress
- Red moving circles: stress hazards, collide to lose energy
- Green circles: rest spots to recover energy
- Win: fill task progress before energy hits zero
- Lose: energy drops to zero → burnout

## Input–Process–Output
- Input: keyboard
- Process: collision detection, energy decay, spawn system, state machine (start / play / win / lose)
- Output: player movement, UI bars, game screens

## Technical Stack
p5.js, hosted on GitHub Pages

## Iteration Log
- Version 1: basic movement + static task
- Version 2: add moving hazards, rest points
- Version 3: win/lose screen, space restart, gradual difficulty
- Version 4: tune energy decay for better balance

## Credits
p5.js library
Original concept & code for HDAT2102
