import sqlite3
import shutil
import os
import tempfile

history_path = r"C:\Users\Maqsood M D\AppData\Local\Google\Chrome\User Data\Default\History"
if not os.path.exists(history_path):
    print("History file not found at:", history_path)
    # Check other profiles
    parent = os.path.dirname(history_path)
    for p in os.listdir(os.path.dirname(parent)):
        hp = os.path.join(os.path.dirname(parent), p, "History")
        if os.path.exists(hp):
            print("Found history in:", hp)
            history_path = hp
            break

if os.path.exists(history_path):
    # Copy to temp because Chrome locks the file
    tmp_path = os.path.join(tempfile.gettempdir(), "chrome_history_copy.sqlite")
    try:
        shutil.copy2(history_path, tmp_path)
        conn = sqlite3.connect(tmp_path)
        cursor = conn.cursor()

        queries = [
            "SELECT url, title, last_visit_time FROM urls WHERE url LIKE '%drive.google.com%' OR url LIKE '%youtube.com%' OR url LIKE '%youtu.be%' OR url LIKE '%video%' OR url LIKE '%chinmay%' OR title LIKE '%chinmay%' OR title LIKE '%task 3%' OR title LIKE '%task3%' ORDER BY last_visit_time DESC LIMIT 40",
            "SELECT target_path, tab_url FROM downloads ORDER BY start_time DESC LIMIT 30"
        ]

        for q in queries:
            print("\n================== QUERY ==================")
            print(q)
            try:
                cursor.execute(q)
                rows = cursor.fetchall()
                for r in rows:
                    print(r)
            except Exception as e:
                print("Error:", e)

        conn.close()
        os.remove(tmp_path)
    except Exception as e:
        print("Copy/read error:", e)
