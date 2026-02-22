import numpy as np

VOICES = [
    {"id": "af_heart",    "name": "Heart (American Female)",    "lang": "a"},
    {"id": "af_bella",    "name": "Bella (American Female)",    "lang": "a"},
    {"id": "af_nicole",   "name": "Nicole (American Female)",   "lang": "a"},
    {"id": "af_sarah",    "name": "Sarah (American Female)",    "lang": "a"},
    {"id": "am_adam",     "name": "Adam (American Male)",       "lang": "a"},
    {"id": "am_michael",  "name": "Michael (American Male)",    "lang": "a"},
    {"id": "bf_emma",     "name": "Emma (British Female)",      "lang": "b"},
    {"id": "bf_isabella", "name": "Isabella (British Female)",  "lang": "b"},
    {"id": "bm_george",   "name": "George (British Male)",      "lang": "b"},
    {"id": "bm_lewis",    "name": "Lewis (British Male)",       "lang": "b"},
]

_VOICE_LANG: dict[str, str] = {v["id"]: v["lang"] for v in VOICES}
_pipelines: dict[str, object] = {}


def _get_pipeline(lang_code: str):
    if lang_code not in _pipelines:
        from kokoro import KPipeline
        _pipelines[lang_code] = KPipeline(lang_code=lang_code)
    return _pipelines[lang_code]


def generate_audio(text: str, output_path: str, voice: str = 'af_heart') -> None:
    import soundfile as sf

    lang_code = _VOICE_LANG.get(voice, 'a')
    pipeline = _get_pipeline(lang_code)
    chunks = []
    for _, _, audio in pipeline(text, voice=voice, speed=1.0):
        chunks.append(audio)
    combined = np.concatenate(chunks)
    sf.write(output_path, combined, 24000)
