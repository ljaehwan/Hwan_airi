from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import logging
import torch
import soundfile as sf
import io

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("모델 로딩 중...")
# 실제 import는 qwen_tts 패키지가 설치된 환경에서만 동작
try:
    from qwen_tts import Qwen3TTSModel
    model = Qwen3TTSModel.from_pretrained(
        "/app/models/Qwen3-TTS-12Hz-1.7B-CustomVoice",
        device_map="auto",
        dtype=torch.bfloat16,
        attn_implementation="flash_attention_2",
    )
    MODEL_LOADED = True
except Exception as e:
    logger.error("모델 로드 실패: %s", e)
    MODEL_LOADED = False

class TTSRequest(BaseModel):
    model: str = "qwen3-tts"
    input: str
    voice: str = "Sohee"
    instruct_text: str | None = None
    language: str = "Korean"

@app.post("/audio/speech")
async def generate_speech(req: TTSRequest):
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="TTS model is not loaded. Check server logs for details.")

    if req.instruct_text:
        wavs, sr = model.generate_instruct(
            text=req.input,
            instruct_text=req.instruct_text,
            language=req.language,
        )
    else:
        wavs, sr = model.generate_custom_voice(
            text=req.input,
            language=req.language,
            speaker=req.voice,
        )

    buf = io.BytesIO()
    sf.write(buf, wavs[0], sr, format="WAV")
    buf.seek(0)
    return Response(content=buf.read(), media_type="audio/wav")

@app.get("/v1/audio/voices")
async def list_voices():
    return {
        "voices": [
            {"id": "Sohee",        "name": "Sohee (한국 여성)"},
            {"id": "Chiyou",       "name": "Chiyou (한국 남성)"},
            {"id": "__instruct__", "name": "🎨 커스텀 프롬프트 (Instruct 모드)"},
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
