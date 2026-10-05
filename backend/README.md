# Local API (experimental)

Requires Python 3.11+.

```bash
cd backend
python -m venv .venv
# Activate the virtual environment for your OS
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000
```

SQLite data defaults to `~/.da-meeting/meetings.sqlite3`. Set `DA_MEETING_DB` to change the location. Do not expose this unauthenticated API to the internet. No recordings, ASR, agents, authorization or multi-user access yet.
