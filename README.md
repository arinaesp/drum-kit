# Drum Kit

An interactive browser-based drum kit, evolved from a hand-built vanilla JS project into a fuller audio instrument with the help of Claude Code.

## Built by Me (v1 — Base Project)

The original drum kit was built from scratch: a static HTML page with 7 `<button>` elements mapped to keyboard keys (`W A S D J K L`), each triggering an audio sample on `click` and `keydown` events via vanilla JavaScript.

**Core skills demonstrated:**

- DOM event handling (`addEventListener` for both mouse and keyboard input)
- Mapping keypress codes to corresponding UI elements and audio triggers
- Basic responsive layout and Google Fonts integration
- Project structure fundamentals (separating HTML/CSS/JS)

## Upgraded with Claude Code (v2 — Feature Expansion)

Using Claude Code as a pair-programming agent, I extended the base project with more advanced front-end and audio-engineering features:

- Web Audio API integration— added a `<canvas>`-based visualizer that renders real-time waveform/frequency feedback in sync with drum hits, using `AudioContext` and `AnalyserNode`.
- Dynamic audio controls — implemented a volume slider (`<input type="range">`) wired to a `GainNode`, allowing real-time amplitude control.
- Tempo system — added a BPM slider (60–200 range) with a live-updating display, laying the groundwork for tempo-synced playback.
- Reverb effect toggle— added a toggleable audio effect using `ConvolverNode`/effect chaining to shape the drum sound output.
- Step sequencer — built a programmable beat grid with Play/Stop/Clear controls, enabling users to compose and loop multi-step drum patterns — a significant jump in interactivity and audio-timing logic.
- UI/UX overhaul — restructured the markup into semantic sections (`header`, `pads-section`, `controls`, `sequencer`), added `data-sound` attributes for cleaner JS hooks, and updated typography (Orbitron/Rajdhani) for a more instrument-panel feel.

Skills demonstrated through AI-assisted development:

- Directing an AI coding agent to scaffold and implement Web Audio API features
- Reviewing, testing, and integrating AI-generated code into an existing codebase
- Iterative prompt-based development workflow (a key AI Engineering skill)

## Summary

> Started as a hand-built vanilla JS drum kit; evolved into a fuller audio instrument (visualizer, sequencer, effects) through AI-assisted development with Claude Code — my first hands-on experience pairing manual coding with agentic AI tooling.

## Tech Stack

- HTML5 / CSS3
- Vanilla JavaScript
- Web Audio API (`AudioContext`, `AnalyserNode`, `GainNode`, `ConvolverNode`)
- Google Fonts (Orbitron, Rajdhani)

## Usage

1. Clone the repo
2. Open `index.html` in a browser
3. Play drums via on-screen buttons or keyboard keys `W A S D J K L`
4. Use the sequencer to build and loop custom beat patterns

---

Made by Irishka eje❤️ in San Francisco.
