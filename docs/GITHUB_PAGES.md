# GitHub Pages preview

1. GitHub repository → Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Actions → **Deploy D&A Meeting Preview** → Run workflow (branch develop), or push to develop.
3. Once the deployment succeeds, open https://hoanggiaktsda-beep.github.io/da-meeting/ .

**Preview only:** GitHub Pages hosts static frontend assets, not FastAPI, SQLite, Whisper, Ollama, or the 17 agents. The UI will report that the local API is disconnected; meeting creation is disabled without a configured, secured backend. Never expose the unauthenticated local API publicly. Browser-to-localhost API calls from HTTPS Pages are not a supported remote multi-device solution.
