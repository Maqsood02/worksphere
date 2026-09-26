import sqlite3
import shutil
import os
import tempfile

history_path = r"C:\Users\Maqsood M D\AppData\Local\Google\Chrome\User Data\Default\History"
tmp_path = os.path.join(tempfile.gettempdir(), "chrome_history_copy3.sqlite")
shutil.copy2(history_path, tmp_path)
conn = sqlite3.connect(tmp_path)
c = conn.cursor()
c.execute("SELECT target_path, tab_url, referrer FROM downloads WHERE target_path LIKE '%diabetic%' OR target_path LIKE '%Task%' OR target_path LIKE '%Chinmay%'")
for r in c.fetchall():
    tpath = str(r[0]).encode('ascii', 'replace').decode()
    tab = str(r[1]).encode('ascii', 'replace').decode()
    ref = str(r[2]).encode('ascii', 'replace').decode()
    print(f"PATH: {tpath}\nTAB:  {tab}\nREF:  {ref}\n---")
conn.close()
os.remove(tmp_path)
