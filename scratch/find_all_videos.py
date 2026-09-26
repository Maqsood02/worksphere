import os
import zipfile
import glob

print("=== CHECKING ZIP FILE CONTENT ===")
zip_path = r"C:\Users\Maqsood M D\Downloads\diabetic-retinopathy-systemNew folder.zip"
if os.path.exists(zip_path):
    with zipfile.ZipFile(zip_path, 'r') as z:
        all_files = z.namelist()
        print(f"Total files in zip: {len(all_files)}")
        vids = [f for f in all_files if any(f.lower().endswith(ext) for ext in ['.mp4', '.mkv', '.webm', '.mov', '.avi', '.wmv'])]
        print("Videos in zip:", vids)
        # Check if there are any docs/text or submission notes
        docs = [f for f in all_files if any(f.lower().endswith(ext) for ext in ['.txt', '.pdf', '.docx', '.md', '.html'])]
        print("Docs/text files in zip (first 10):", docs[:10])
else:
    print("Zip not found")

print("\n=== SEARCHING USER DIRECTORIES FOR VIDEOS ===")
search_dirs = [
    r"C:\Users\Maqsood M D\Downloads",
    r"C:\Users\Maqsood M D\Videos",
    r"C:\Users\Maqsood M D\OneDrive\Desktop",
    r"C:\Users\Maqsood M D\Documents",
    r"C:\Users\Maqsood M D\AppData\Local\Temp"
]

video_exts = {'.mp4', '.webm', '.mkv', '.mov', '.avi'}

for sdir in search_dirs:
    if not os.path.exists(sdir):
        continue
    print(f"\n--- Searching in: {sdir} ---")
    for root, dirs, files in os.walk(sdir):
        # Skip node_modules, .git, venv
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'venv', '.gemini', 'AppData']]
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in video_exts:
                full_path = os.path.join(root, f)
                try:
                    size_mb = os.path.getsize(full_path) / (1024 * 1024)
                    print(f"Found: {full_path} ({size_mb:.2f} MB)")
                except Exception as e:
                    pass
