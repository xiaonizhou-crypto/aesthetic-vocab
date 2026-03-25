---
name: aesthetic-vocab
description: Generate a single-file HTML app for learning English vocabulary from any image. Uses Gemini to identify evocative, intermediate-to-advanced words, overlays hand-drawn labels on the image, and reads a literary scene description aloud with a gentle male voice (Gemini TTS). Zero build step — open in browser directly.
---

Generate a **single self-contained HTML file** that turns any uploaded image into an interactive English vocabulary lesson.

## What it does

1. User uploads a photo (drag & drop or click)
2. Gemini analyzes the image and returns 6–8 **evocative, emotionally resonant English words** tied to bounding boxes — not basic nouns like "window" or "man", but words like *fragile*, *melancholic*, *reverie*, *luminous*, *drape*, *solitude*
3. Words are overlaid on the image as **hand-drawn chalk-style labels** (Caveat font), with dashed connector lines to the objects
4. Clicking a word speaks it instantly via **Web Speech API** (zero latency)
5. A **Listen to Story** button reads the literary scene description aloud using **Gemini TTS** (Umbriel voice — warm, youthful, easy-going male)
6. A glossary card section below shows phonetic, part of speech, Chinese translation, and an example sentence

## Required stack (all CDN, no npm)

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet">
```

All Gemini calls use the **REST API via `fetch()`** — no SDK needed.

## Gemini API calls

### 1. Image analysis — `gemini-2.5-flash`

```js
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [
      { inline_data: { mime_type: imageMime, data: imageBase64 } },
      { text: PROMPT }
    ]}],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: SCHEMA  // see below
    }
  })
})
```

**Prompt philosophy (critical):** Ask for *emotionally resonant* vocabulary, not object labels.
```
You are a poetic linguist teaching English through imagery. Choose words with soul —
not plain nouns like "window" or "man", but evocative, intermediate-to-advanced vocabulary
that captures the emotional texture of the scene.
Think: fragile, melancholic, luminous, drape, linger, tattered, solitude, reverie, silhouette,
tender, wistful — words a reader would underline.

For each word: English (lowercase), IPA phonetic, part of speech, Chinese translation,
short poetic example sentence, and bounding box (ymin/xmin/ymax/xmax in 0–1000 units).
Also write a short literary scene description (English + Chinese) and a poetic title.
```

**Response schema:**
```json
{
  "title": "string",
  "literaryDescription": { "english": "string", "chinese": "string" },
  "items": [{
    "english": "string", "phonetic": "string", "partOfSpeech": "string",
    "chinese": "string", "example": "string",
    "boundingBox": { "ymin": 0, "xmin": 0, "ymax": 0, "xmax": 0 }
  }]
}
```

### 2. Story narration TTS — `gemini-2.5-flash-preview-tts`

```js
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
  method: 'POST',
  body: JSON.stringify({
    contents: [{ parts: [{ text: `Read this in a warm, youthful, gentle male voice — like a soft bedtime story. Natural pace:\n\n${storyText}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Umbriel' } } }
    }
  })
})
```

The API returns raw 24kHz mono 16-bit PCM as base64. You must prepend a WAV header (see `makeWavUrl()` in the live demo) to make it playable.

### 3. Word pronunciation — Web Speech API (instant, zero API cost)

```js
function speakWord(word) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'en-US'; u.rate = 0.88; u.pitch = 1.05;
  const voices = speechSynthesis.getVoices();
  const male = voices.find(v => v.lang.startsWith('en') && /male|daniel|alex|tom|oliver/i.test(v.name));
  if (male) u.voice = male;
  speechSynthesis.speak(u);
}
```

## Label rendering

- Overlay a `<div>` absolutely positioned over the image, sized to match the *actual rendered area* (accounting for `object-fit: contain` letterboxing)
- Convert bounding box `(ymin+ymax)/2 / 10` → percentage position
- Run collision avoidance: try increasing radii (20→30→40→50) at 24 angles, pick the first non-overlapping spot
- Render each label as a `.lbl` div with `font-family: 'Caveat', cursive`
- Draw SVG dashed connector lines and hand-drawn circles (path: `M50,15 C70,12 88,32 85,52…`) for every 3rd label or those far from center
- Animate in with staggered `opacity` transitions

## Visual style

```css
/* Label on image */
.lbl {
  font-family: 'Caveat', cursive;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0,0,0,.7), 0 0 2px rgba(0,0,0,.9);
  filter: drop-shadow(0 1px 3px rgba(0,0,0,.5));
}
.lbl-word { font-size: clamp(1.3rem, 3.2vw, 2.2rem); font-weight: 600; }
.lbl-cn   { font-size: clamp(.85rem, 1.9vw, 1.15rem); opacity: .9; }

/* Page background */
body { background: #fdfdfb; font-family: 'Inter', sans-serif; }
/* Story text */
.story { font-family: 'Lora', serif; font-size: 1.5rem; line-height: 1.7; }
```

## Output rules

- **Single file only** — all CSS, JS, HTML inline, no external files
- Include an **API key input bar** at the top (store in `localStorage`)
- Include a small camera-preview-style minimap of the uploaded image (optional) OR just show the full image
- Show loading state while Gemini processes (`Seeking the perfect words…`)
- Graceful fallback: if TTS API fails, fall back to Web Speech API for the story too

## Example invocations

- `/aesthetic-vocab` → generates the full app with default settings
- `/aesthetic-vocab 日语版，词汇注解用日文` → same app but Chinese UI → Japanese
- `/aesthetic-vocab add a "save as flashcard" button for each word` → adds flashcard export feature
- `/aesthetic-vocab make the labels animated, words float in one by one with blur` → adds entrance animations

---

**Live demo:** https://xiaonizhou-crypto.github.io/aesthetic-vocab/
**Source:** https://github.com/xiaonizhou-crypto/aesthetic-vocab
