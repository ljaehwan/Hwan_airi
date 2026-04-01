# Fish Speech Setup

This note documents the minimum setup needed to try Fish Speech with AIRI.

## What This Integrates

- Fish Speech runs as a local HTTP TTS server.
- AIRI connects to it through the `Fish Speech` speech provider.
- This initial integration focuses on inline style tags and optional `reference_id` usage.

## Requirements

- Linux or WSL is recommended by Fish Audio.
- GPU inference needs about 24 GB VRAM.
- The Fish Speech API server defaults to `http://localhost:8080/v1/`.

## Start Fish Speech

Official docs:

- `https://speech.fish.audio/install/`
- `https://speech.fish.audio/server/`

Typical upstream flow:

```bash
git clone https://github.com/fishaudio/fish-speech.git
cd fish-speech
docker compose --profile server up
```

If you run it manually, the documented server entrypoint is:

```bash
python tools/api_server.py \
  --llama-checkpoint-path checkpoints/s2-pro \
  --decoder-checkpoint-path checkpoints/s2-pro/codec.pth \
  --listen 0.0.0.0:8080
```

## Verify It

```bash
curl http://127.0.0.1:8080/v1/health
```

Expected response:

```json
{ "status": "ok" }
```

## AIRI Settings

- Provider: `Fish Speech`
- Base URL: `http://localhost:8080/v1/`
- Model: `s2-pro`
- Reference ID: optional, only if you already created one on the Fish side

## Prompting Style

Fish Speech works best when you put style control directly into the text.

Examples:

```text
[soft feminine voice] 안녕하세요. 오늘은 차분하게 이야기해볼게요.
```

```text
[old narrator] 아주 오래전, 깊은 산속에 작은 마을이 있었단다.
```

```text
[calm male voice] 지금부터 중요한 내용을 천천히 설명드리겠습니다.
```

## Notes

- This AIRI integration currently targets Fish Speech's `/v1/tts` endpoint.
- It does not yet upload reference audio directly from AIRI.
- For full voice cloning, use a server-side saved `reference_id` or extend the provider later.
