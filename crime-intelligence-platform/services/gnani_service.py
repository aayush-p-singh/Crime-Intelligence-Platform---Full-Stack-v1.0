import os
import requests

def transcribe_audio(audio_file_path):
    api_key = os.getenv("GNANI_API_KEY")
    if not api_key:
        raise ValueError("GNANI_API_KEY is missing")
    
    url = "https://api.vachana.ai/stt/v3"
    headers = {"X-API-Key-ID": api_key}
    
    with open(audio_file_path, "rb") as f:
        files = {"audio_file": (os.path.basename(audio_file_path), f, "audio/wav")}
        payload = {
            "language_code": "en-IN",
            "format": "transcribe",
            "itn_native_numerals": "true"
        } 
        response = requests.post(url, headers=headers, files=files, data=payload)
    
    # E.g. {"success": true, "request_id": "...", "timestamp": "...", "transcript": "..."}
    try:
        return response.json()
    except Exception:
        return {"success": False, "error": response.text}

def synthesize_speech(text):
    api_key = os.getenv("GNANI_API_KEY")
    if not api_key:
        raise ValueError("GNANI_API_KEY is missing")
        
    url = "https://api.vachana.ai/api/v1/tts/inference"
    headers = {
        "X-API-Key-ID": api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "voice": "Nalini",
        "model": "timbre-v2.5",
        "language": "hi-IN",
        "speed": 1.0,
        "audio_config": {
            "sample_rate": 48000,
            "num_channels": 1,
            "sample_width": 2,
            "encoding": "linear_pcm",
            "container": "wav"
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        raise ValueError(f"TTS API Error: {response.text}")
    return response.content
