import boto3
import os

polly = boto3.client("polly")

MAX_CHARS = 2500  # Safe below Polly limit

def split_text(text, max_chars=MAX_CHARS):
    chunks = []
    current = ""

    for sentence in text.split(". "):
        if len(current) + len(sentence) < max_chars:
            current += sentence + ". "
        else:
            chunks.append(current.strip())
            current = sentence + ". "

    if current.strip():
        chunks.append(current.strip())

    return chunks


def merge_mp3(files, output_file):
    with open(output_file, "wb") as out:
        for file in files:
            with open(file, "rb") as f:
                out.write(f.read())



def text_to_speech(text, output_dir, voice_id="Joanna"):
    os.makedirs(output_dir, exist_ok=True)

    chunks = split_text(text)
    audio_files = []

    for i, chunk in enumerate(chunks, start=1):
        response = polly.synthesize_speech(
            Text=chunk,
            OutputFormat="mp3",
            VoiceId=voice_id
        )

        file_path = f"{output_dir}/part_{i}.mp3"
        with open(file_path, "wb") as f:
            f.write(response["AudioStream"].read())

        audio_files.append(file_path)

    return audio_files
