import zipfile
import os

zip_path = r"C:\Users\Maqsood M D\Downloads\diabetic-retinopathy-systemNew folder.zip"
with zipfile.ZipFile(zip_path, 'r') as z:
    for name in z.namelist():
        if any(name.lower().endswith(ext) for ext in ['.md', '.txt', '.html', '.json', '.py', '.js', '.docx']):
            print("File:", name)
            if any(key in name.lower() for key in ['readme', 'link', 'video', 'demo', 'url', 'submission', 'note']):
                print("--- CONTENT OF:", name)
                try:
                    content = z.read(name).decode('utf-8', errors='ignore')
                    print(content[:1000])
                except Exception as e:
                    print("Error reading:", e)
