CREATE TABLE IF NOT EXISTS life_records (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL, subject TEXT NOT NULL CHECK(subject IN ('self','other')),
 name TEXT NOT NULL, birthday TEXT NOT NULL, category TEXT NOT NULL, created_at INTEGER NOT NULL,
 payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','ready'))
);
CREATE INDEX IF NOT EXISTS life_records_user_created ON life_records(user_id,status,created_at DESC,id);
CREATE INDEX IF NOT EXISTS life_records_user_subject ON life_records(user_id,status,subject,created_at DESC,id);
