import sqlite3
import shutil
import os
import tempfile

edge_history = r"C:\Users\Maqsood M D\AppData\Local\Microsoft\Edge\User Data\Default\History"
if os.path.exists(edge_history):
    tmp_path = os.path.join(tempfile.gettempdir(), "edge_history_copy.sqlite")
    shutil.copy2(edge_history, tmp_path)
    conn = sqlite3.connect(tmp_path)
    c = conn.cursor()
    c.execute("SELECT target_path, tab_url, referrer FROM downloads WHERE target_path LIKE '%diabetic%' OR target_path LIKE '%Task%' OR target_path LIKE '%video%' OR target_path LIKE '%Chinmay%'")
    for r in c.fetchall():
        tpath = str(r[0]).encode('ascii', 'replace').decode()
        tab = str(r[1]).encode('ascii', 'replace').decode()
        ref = str(r[2]).encode('ascii', 'replace').decode()
        print(f"PATH: {tpath}\nTAB:  {tab}\nREF:  {ref}\n---")
    conn.close()
    os.remove(tmp_path)
else:
    print("Edge history does not exist.")
