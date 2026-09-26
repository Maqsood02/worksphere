import sqlite3
import os
import shutil
import tempfile

wpath = r'C:\Users\Maqsood M D\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm\LocalState\sessions\28917EC4B401759725B27C7B5A2BBABFBFB51DB9'

for fname in os.listdir(wpath):
    if fname.endswith('.db'):
        db_path = os.path.join(wpath, fname)
        tmp = os.path.join(tempfile.gettempdir(), f"wa_{fname}")
        try:
            shutil.copy2(db_path, tmp)
            wal = db_path + "-wal"
            if os.path.exists(wal):
                shutil.copy2(wal, tmp + "-wal")
            conn = sqlite3.connect(tmp)
            cur = conn.cursor()
            cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [t[0] for t in cur.fetchall()]
            
            for t in tables:
                try:
                    cur.execute(f"PRAGMA table_info({t})")
                    cols = [c[1] for c in cur.fetchall()]
                    text_cols = [c for c in cols if any(k in c.lower() for k in ['text', 'content', 'body', 'message', 'data', 'url', 'caption', 'name', 'value'])]
                    if not text_cols:
                        text_cols = cols
                    for cname in text_cols:
                        try:
                            cur.execute(f"SELECT {cname} FROM {t} WHERE {cname} LIKE '%task 3%' OR {cname} LIKE '%task3%' OR {cname} LIKE '%diabetic%' OR {cname} LIKE '%drive.google.com%' LIMIT 10")
                            rows = cur.fetchall()
                            if rows:
                                print(f"[{fname} -> {t}.{cname}] Found {len(rows)} matches:")
                                for r in rows:
                                    s = str(r[0])[:200].encode('ascii', 'replace').decode()
                                    print("  ", s)
                        except Exception as e:
                            pass
                except:
                    pass
            conn.close()
            try: os.remove(tmp)
            except: pass
        except Exception as e:
            pass
