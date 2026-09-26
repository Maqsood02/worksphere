import imageio.v3 as iio
from PIL import Image
import os
import glob

sdir = r"C:\Users\Maqsood M D\Videos\Screen Recordings"
artifact_dir = r"C:\Users\Maqsood M D\.gemini\antigravity-ide\brain\6646c82c-07a7-44f1-9399-2a2a33e551c9"

for fp in glob.glob(os.path.join(sdir, "*.mp4")):
    fname = os.path.basename(fp)
    if 'review' in fname: continue
    try:
        frame = iio.imread(fp, index=100)
        img = Image.fromarray(frame)
        out_name = f"sr_{fname[:20]}.jpg"
        out_path = os.path.join(artifact_dir, out_name)
        img.save(out_path)
        print(f"Saved frame for {fname} -> {out_name}")
    except Exception as e:
        print(f"Error for {fname}: {e}")
