import sqlite3
import shutil
import os
import tempfile

history_path = r"C:\Users\Maqsood M D\AppData\Local\Google\Chrome\User Data\Default\History"
tmp_path = os.path.join(tempfile.gettempdir(), "chrome_history_copy2.sqlite")
shutil.copy2(history_path, tmp_path)
conn = sqlite3.connect(tmp_path)
c = conn.cursor()
c.execute("SELECT target_path, tab_url, referrer, start_time FROM downloads WHERE start_time > 13390000000000000 ORDER BY start_time DESC")
for r in c.fetchall():
    tpath = str(r[0]).encode('ascii', 'replace').decode()
    tab = str(r[1]).encode('ascii', 'replace').decode()
    ref = str(r[2]).encode('ascii', 'replace').decode()
    print(f"PATH: {tpath}\nTAB:  {tab}\nREF:  {ref}\n---")
conn.close()
os.remove(tmp_path)
