import os
from text_extractor import extract_text
from slide_explainer import get_explainer, explain_slide
from tts import synthesize_speech
from explained_text_to_images import generate_image
from video_renderer import render_video_part, concatenate_videos  

import sys

def main():
    if len(sys.argv) > 1:
        input_pptx = sys.argv[1]
    else:
        input_pptx = "sample.pptx"

    if not os.path.exists(input_pptx):
        print(f"ERROR: Cannot find '{input_pptx}'. Please upload a sample file!")
        return

    # 1. Extract Text
    print("\n[Step 1 & 2] Extracting text from presentation...")  
    slides_text = extract_text(input_pptx)

    # 2. Explain
    print("\n[Step 3] Generating AI Explanations...")
    explainer = get_explainer()
    explanations = []
    for i, text in enumerate(slides_text):
        print(f" - Explaining slide {i+1}...")
        exp = explain_slide(explainer, text)
        explanations.append(exp)

    print("\n[Steps 4 & 5 & 6] Media Generation & Video Rendering...")  
    os.makedirs("output", exist_ok=True)
    video_parts = []

    for i, exp in enumerate(explanations):
        slide_num = i + 1
        print(f" => Processing assets for slide {slide_num}...")  

        audio_file = f"output/audio_{slide_num}.mp3"
        image_file = f"output/image_{slide_num}.png"
        video_part = f"output/part_{slide_num}.mp4"

        # Text to Speech using Amazon Polly
        synthesize_speech(exp, audio_file)

        # Create Visual Slide
        generate_image(exp, image_file)

        # Merge Visuals and Audio
        if os.path.exists(audio_file) and os.path.exists(image_file):                                                                           render_video_part(image_file, audio_file, video_part) 
            video_parts.append(video_part)

    # Combine outputs into final
    print("\n[Final Step] Concatenating final video...")
    if video_parts:
        final_video = "output/final_video.mp4"
        concatenate_videos(video_parts, final_video)
        print("\nSUCCESS! Pipeline complete! Check output/final_video.mp4")                                                             else:
        print("\nERROR: Failed to generate video parts.")

if __name__ == "__main__":
    main()
