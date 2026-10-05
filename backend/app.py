"""D&A Meeting local-first MVP API. No cloud calls."""
import os
import sqlite3
import uuid
from contextlib import contextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB = Path(os.environ.get("DA_MEETING_DB", str(Path.home() / ".da-meeting" / "meetings.sqlite3")))
app = FastAPI(title="D&A Meeting Local API", version="0.2.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_methods=["GET", "POST"], allow_headers=["Content-Type"])

@contextmanager
def connection():
    DB.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB)
    db.row_factory = sqlite3.Row
    try:
        db.execute("CREATE TABLE IF NOT EXISTS meetings (id TEXT PRIMARY KEY, title TEXT NOT NULL, department TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)")
        db.commit()
        yield db
        db.commit()
    finally:
        db.close()

class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    department: str = Field(default="Chung", max_length=80)

@app.get("/api/v1/health")
def health():
    return {"status": "ok", "mode": "local", "ai_ready": False}

@app.get("/api/v1/meetings")
def list_meetings():
    with connection() as db:
        return [dict(r) for r in db.execute("SELECT * FROM meetings ORDER BY created_at DESC, rowid DESC").fetchall()]

@app.post("/api/v1/meetings", status_code=201)
def create_meeting(payload: MeetingCreate):
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Tên cuộc họp không được để trống")
    record = {"id": str(uuid.uuid4()), "title": title, "department": payload.department.strip() or "Chung"}
    with connection() as db:
        db.execute("INSERT INTO meetings (id,title,department) VALUES (:id,:title,:department)", record)
        row = db.execute("SELECT * FROM meetings WHERE id=?", (record["id"],)).fetchone()
        return dict(row)
