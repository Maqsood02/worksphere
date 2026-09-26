import sqlite3
import shutil
import os
import tempfile

history_path = r"C:\Users\Maqsood M D\AppData\Local\Google\Chrome\User Data\Default\History"
tmp_path = os.path.join(tempfile.gettempdir(), "chrome_history_copy.sqlite")
shutil.copy2(history_path, tmp_path)
conn = sqlite3.connect(tmp_path)
c = conn.cursor()
c.execute("SELECT target_path, tab_url, referrer FROM downloads WHERE target_path LIKE '%diabetic%' OR target_path LIKE '%Task 2%' OR target_path LIKE '%video%' OR target_path LIKE '%zip%'")
for r in c.fetchall():
    print('PATH:', r[0])
    print('TAB:', r[1])
    print('REF:', r[2])
    print('---')
conn.close()
os.remove(tmp_path)
