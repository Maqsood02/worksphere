import imageio.v3 as iio
from PIL import Image
import os

filepath = r"C:\Users\Maqsood M D\Videos\Screen Recordings\review Recording.mp4"
artifact_dir = r"C:\Users\Maqsood M D\.gemini\antigravity-ide\brain\6646c82c-07a7-44f1-9399-2a2a33e551c9"

try:
    props = iio.improps(filepath)
    print(f"Shape: {props.shape}, dtype: {props.dtype}")
    # Read frame at index 500
    frame = iio.imread(filepath, index=500)
    img = Image.fromarray(frame)
    outpath = os.path.join(artifact_dir, "review_recording_frame.jpg")
    img.save(outpath)
    print("Saved to:", outpath)
except Exception as e:
    print("Error:", e)
