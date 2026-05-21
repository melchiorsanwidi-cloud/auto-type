# TypingClub AutoTyper

A browser console script that automatically completes typing lessons on [typingclub.com](https://www.typingclub.com).

## Usage

1. Go to [typingclub.com](https://www.typingclub.com) and open a typing level
2. Open your browser's **Developer Console** (`F12` → **Console** tab)
3. Copy the contents of [`autotyper.js`](./autotyper.js)
4. Paste it into the console and press **Enter**

## Configuration

At the top of the script you can tweak two settings:

| Option | Default | Description |
|--------|---------|-------------|
| `minDelay` | `60` | Minimum delay between keystrokes (ms) |
| `maxDelay` | `60` | Maximum delay between keystrokes (ms) |

> **Note:** Setting the delay too low may cause the site to skip the results screen.
> A value of **60ms or higher** is recommended. For a more human-like typing speed, try `minDelay = 80` and `maxDelay = 150`.

## How It Works

TypingClub exposes an internal JavaScript API on the page (typically at `window.core`) with a method called `record_keydown_time`. The script:

1. Reads all target characters from the lesson's DOM
2. Searches `window` for the internal API object (handles cases where it's not at `window.core`)
3. Feeds each character into the API with a small delay between strokes

## Troubleshooting

| Error | Fix |
|-------|-----|
| `No characters found` | Make sure you're inside an active lesson, not on the menu or dashboard |
| `Could not find the TypingClub core object` | The site may have updated its internals — open an issue |

## Disclaimer

This script is intended for educational and personal use only. Use it responsibly and in accordance with TypingClub's terms of service.
