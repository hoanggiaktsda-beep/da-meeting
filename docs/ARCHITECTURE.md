# D&A Meeting architecture

Local-first modular system (planned): React/Vite PWA frontend; FastAPI local backend; SQLite for MVP; local media storage; Whisper ASR and Ollama LLM via opt-in installed services; 17 domain agents; evidence-linked transcripts and human approval.

## Current implementation
Static frontend foundation with in-memory draft list only. No ASR, API, database, recordings, authentication, or agent processing has been implemented yet.

## Privacy
Do not commit customer information, meeting recordings, transcripts, access tokens or local database files. Explicit recording consent and permissions are required before capture.

## Platform
Responsive browsers on iOS, iPadOS, Android, Windows and macOS; browser recording/background behavior requires device-specific testing.
