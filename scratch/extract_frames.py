import imageio.v3 as iio
from PIL import Image
import os

candidate_files = [
    (r"C:\Users\Maqsood M D\OneDrive\Desktop\Video 3.mp4", "video_3_frame.jpg"),
    (r"C:\Users\Maqsood M D\Downloads\Video Project.mp4", "video_project_frame.jpg"),
    (r"C:\Users\Maqsood M D\Downloads\download.mp4", "download_frame.jpg"),
    (r"C:\Users\Maqsood M D\Downloads\Python Video.mp4", "python_video_frame.jpg"),
]

artifact_dir = r"C:\Users\Maqsood M D\.gemini\antigravity-ide\brain\6646c82c-07a7-44f1-9399-2a2a33e551c9"

for filepath, outname in candidate_files:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (does not exist)")
        continue
    try:
        props = iio.improps(filepath)
        print(f"\n--- {filepath} ---")
        print(f"Shape: {props.shape}, dtype: {props.dtype}")
        
        # Read frame around 10% and 50%
        # index 50
        frame = iio.imread(filepath, index=min(100, props.shape[0]-1) if hasattr(props, 'shape') else 0)
        img = Image.fromarray(frame)
        outpath = os.path.join(artifact_dir, outname)
        img.save(outpath)
        print(f"Saved sample frame to: {outpath}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
