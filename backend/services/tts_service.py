import numpy as np

_pipeline = None


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        from kokoro import KPipeline
        _pipeline = KPipeline(lang_code='a')
    return _pipeline


def generate_audio(text: str, output_path: str, voice: str = 'af_heart') -> None:
    import soundfile as sf

    pipeline = get_pipeline()
    chunks = []
    for _, _, audio in pipeline(text, voice=voice, speed=1.0):
        chunks.append(audio)
    combined = np.concatenate(chunks)
    sf.write(output_path, combined, 24000)
