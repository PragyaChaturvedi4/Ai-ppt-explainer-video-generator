import os
import re
import subprocess
from slide_explainer import explain_slide
from text_extractor import extract_text_from_ppt
from ppt_to_images import ppt_to_images
from tts import text_to_speech, merge_mp3
from video_renderer import create_video

PPT_PATH = "uploads/sample.pptx"
FACE_IMAGE = "face.jpg"

OUTPUT_DIR = "output"
TEMP_AUDIO = os.path.join(OUTPUT_DIR, "temp_audio")

USE_AVATAR = True  # Toggle avatar

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_AUDIO, exist_ok=True)

# -------- BAD PATTERN --------
def is_garbage(text):
    text_low = text.lower()

    bad_patterns = [
        "slide content is",
        "this is a",
        "it is a",
        "for example",
        "you might say",
        "the answer is",
        "can be used to describe",
        "is a type of",
    ]

    if any(p in text_low for p in bad_patterns):
        return True

    if len(text.split()) < 6:
        return True

    return False

# ---------- CLEAN TEXT ----------
def clean_text(text):
    text = re.sub(r"\d+\.", "", text)
    text = text.replace("Slide:", "")
    text = re.sub(r"[^a-zA-Z0-9,.\-\s]", "", text)
    return text.strip()


# ---------- EXTRACT CLEAN POINTS ----------
def extract_points(lines):
    points = []

    for line in lines:
        line = clean_text(line)

        # split into sentences
        parts = re.split(r"\. ", line)

        for p in parts:
            p = p.strip()

            if len(p) < 25:
                continue

            # avoid repeated garbage patterns
            if any(p.lower() in x.lower() for x in points):
                continue

            p = p[0].upper() + p[1:]

            if not p.endswith("."):
                p += "."

            points.append(p)

    return points[:6]  # limit bullets


def main():
    print("🚀 Slide-wise pipeline started...\n")

    slides = extract_text_from_ppt(PPT_PATH)
    final_clips = []

    for i, slide in enumerate(slides):
        print(f"\n🔹 Processing Slide {i+1}")

        lines = [l.strip() for l in slide.split("\n") if l.strip()]
        if not lines:
            continue

        title = lines[0]

        # ---------- STRUCTURE ----------
        content_lines = lines[1:]
        points = extract_points(content_lines)

        # ---------- EXPLAIN (CONTROLLED AI) ----------
        explained_points = []

        for p in points:
            if is_garbage(p):
                continue
            try:
                exp = explain_slide(p)

                # remove bad AI outputs
                if is_garbage(exp):
                    exp = p

                # fallback if model output is bad
                if len(exp.split()) > 25 or len(exp) < 10:
                    exp = p


            except:
                exp = p

            explained_points.append(exp)

        # final safety
        explained_points = list(dict.fromkeys(explained_points))[:6]
        
        explanation = " ".join(explained_points)

        # ---------- AUDIO ----------
        audio_file = f"{OUTPUT_DIR}/audio_{i}.mp3"
        parts = text_to_speech(explanation, TEMP_AUDIO)
        merge_mp3(parts, audio_file)

        # ---------- IMAGE ----------
        slide_img_dir = f"{OUTPUT_DIR}/slide_{i}"
        slide_text = title + ". " + explanation
        ppt_to_images([slide_text], slide_img_dir)

        # ---------- WAV ----------
        wav_file = f"{OUTPUT_DIR}/audio_{i}.wav"
        subprocess.run(
            ["ffmpeg", "-y", "-i", audio_file, wav_file],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

        # ---------- AVATAR ----------
        avatar_video = f"{OUTPUT_DIR}/avatar_{i}.mp4"

        if USE_AVATAR:
            print("🎭 Generating avatar...")

            subprocess.run([
                "python3", "Wav2Lip/inference.py",
                "--checkpoint_path", "Wav2Lip/wav2lip_gan.pth",
                "--face", FACE_IMAGE,
                "--audio", wav_file,
                "--outfile", avatar_video,
                "--resize_factor", "4",
                "--fps", "15"
            ])
        else:
            avatar_video = None

        # ---------- SLIDE VIDEO ----------
        slide_video = f"{OUTPUT_DIR}/slide_video_{i}.mp4"
        create_video(slide_img_dir, audio_file, slide_video)

        # ---------- FINAL CLIP ----------
        final_clip = f"{OUTPUT_DIR}/final_clip_{i}.mp4"

        if USE_AVATAR:
            subprocess.run([
                "ffmpeg", "-y",
                "-i", slide_video,
                "-i", avatar_video,
                "-filter_complex",
                "[1:v]scale=200:-1[av];[0:v][av]overlay=main_w-overlay_w-40:main_h-overlay_h-40",
                "-c:v", "libx264",
                "-c:a", "aac",
                final_clip
            ])
        else:
            subprocess.run([
                "ffmpeg", "-y",
                "-i", slide_video,
                "-c:v", "libx264",
                "-c:a", "aac",
                final_clip
            ])

        final_clips.append(final_clip)

    # ---------- MERGE ----------
    print("\n🎬 Merging all slides...")

    with open("all_clips.txt", "w") as f:
        for clip in final_clips:
            f.write(f"file '{clip}'\n")

    subprocess.run([
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", "all_clips.txt",
        "-c:v", "libx264",
        "-c:a", "aac",
        f"{OUTPUT_DIR}/final_video.mp4"
    ])

    print("\n✅ FINAL VIDEO READY:", f"{OUTPUT_DIR}/final_video.mp4")


if __name__ == "__main__":
    main()
