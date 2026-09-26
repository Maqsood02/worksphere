import os
import subprocess
import json

files_to_check = [
    r"C:\Users\Maqsood M D\OneDrive\Desktop\Video 3.mp4",
    r"C:\Users\Maqsood M D\Downloads\Video Project.mp4",
    r"C:\Users\Maqsood M D\Downloads\download.mp4"
]

for fp in files_to_check:
    if not os.path.exists(fp):
        print(f"Not found: {fp}")
        continue
    stat = os.stat(fp)
    print(f"\n==========================================")
    print(f"File: {fp}")
    print(f"Size: {stat.st_size / (1024*1024):.2f} MB")
    print(f"Created: {stat.st_ctime}")
    print(f"Modified: {stat.st_mtime}")

    # Use ffprobe if available
    try:
        cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration,tags:stream=codec_name,width,height', '-of', 'json', fp]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            info = json.loads(res.stdout)
            print("FFPROBE:", json.dumps(info, indent=2))
        else:
            print("FFprobe error:", res.stderr[:200])
    except Exception as e:
        print("FFprobe not available:", e)
