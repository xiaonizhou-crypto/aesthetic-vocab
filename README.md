# Aesthetic Vocab · 看图学英文

**EN** | [中文](#中文说明)

Turn any photo into an immersive English vocabulary lesson — powered by Gemini AI and your camera roll.

**Live demo → https://xiaonizhou-crypto.github.io/aesthetic-vocab/**

![preview](preview.png)

---

## What it does

Upload a photo. Gemini reads it like a poet, then overlays evocative vocabulary directly on your image — not plain labels like *"window"* or *"man"*, but emotionally resonant words like *fragile*, *melancholic*, *luminous*, *reverie*.

- **Tap any word** on the image → instant pronunciation (Web Speech API, zero delay)
- **Listen to the Story** → Gemini reads a literary scene description aloud in a warm, gentle male voice (Umbriel TTS)
- **Glossary cards** below the image: phonetic transcription, Chinese translation, example sentence

## How to use

1. Open `index.html` in any modern browser — no install, no build
2. Enter your [Gemini API Key](https://aistudio.google.com/apikey) at the top
3. Drag & drop (or click to upload) any image
4. Click **Analyze the Scene**

## Use as a Claude Code Skill

Generate your own customized version with one sentence:

```bash
# 1. Install
curl -o ~/.claude/skills/aesthetic-vocab.md \
  https://raw.githubusercontent.com/xiaonizhou-crypto/aesthetic-vocab/main/skill.md

# 2. Use in Claude Code
/aesthetic-vocab
/aesthetic-vocab add a save-as-flashcard button for each word
/aesthetic-vocab Japanese UI, annotations in Japanese
```

## Stack

- **Gemini 2.5 Flash** — image analysis + evocative vocabulary extraction (JSON schema)
- **Gemini 2.5 Flash TTS** (Umbriel voice) — warm male narration of the literary description
- **Web Speech API** — instant zero-latency word pronunciation
- **Caveat** (Google Fonts) — hand-drawn chalk label style
- **Lora + Inter** — editorial typography for the page

---

## 中文说明

上传一张照片，AI 像诗人一样读懂它，然后把富有情感的英文词汇直接叠加在图片上。不是 *"窗户"* *"男人"* 这类基础词，而是 *fragile（脆弱）*、*melancholic（忧郁）*、*reverie（遐想）* 这类有意境的词——读者会划线的那种。

**功能：**
- 点图片上的词 → 即时读音（浏览器内置，无延迟）
- 点「Listen to the Story」→ Gemini 用温柔男声（Umbriel 声线）朗读文学描述
- 图片下方词汇卡：音标、词性、中文翻译、例句

**使用方法：**
1. 用浏览器直接打开 `index.html`，无需安装任何依赖
2. 顶部输入 [Gemini API Key](https://aistudio.google.com/apikey)（免费获取）
3. 拖入图片 → 点「Analyze the Scene」

**作为 Claude Code Skill 使用：**

```bash
curl -o ~/.claude/skills/aesthetic-vocab.md \
  https://raw.githubusercontent.com/xiaonizhou-crypto/aesthetic-vocab/main/skill.md
```

然后在 Claude Code 里：
```
/aesthetic-vocab
/aesthetic-vocab 给每个单词加「加入闪卡」按钮
```

## License

MIT

## API Key and data privacy / 密钥与数据说明

This is a bring-your-own-key learning demo. The key is held only in the current page's memory, is removed from the input after use, and is cleared on page exit; reload requires re-entry. The page also attempts to delete keys saved by older versions from browser storage. The “清除 Key” button clears the current key. Requests already sent cannot be recalled.

The browser sends images, text and API requests directly to Google using your key. Browser speech recognition may use your browser vendor's services. Local storage of a key is not required for these services to receive your input. Do not use confidential images or text, shared/public computers, or unrestricted keys. Review provider terms, account restrictions and quota/billing before use.

此版本只在当前页面内存中临时使用 Key，并尝试清理旧版保存的 Key。不会上传 Key 到本项目自建服务器，但请求会携带 Key 直接发往 Google。页面退出、刷新或手动清除后需重新输入。网页脚本、浏览器扩展仍可能接触当前页面数据，因此这不等于生产级密钥隔离。

For a hosted public product, use an authenticated backend with server-side secret storage, per-user authorization and rate limits; never embed the owner's key in public JavaScript.
