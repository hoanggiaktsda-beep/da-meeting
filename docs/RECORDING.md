# Experimental browser audio capture

This feature requires HTTPS, microphone permission and a supported MediaRecorder implementation. Recording starts only after explicit user interaction. Stop produces a downloadable local audio file; audio is **not** uploaded to GitHub or stored on a server. No speech-to-text, speaker diarization, recording consent management or automatic transcription is implemented. Ask every participant for permission before recording.

**Important:** Browser capture is not reliable for 5–8-hour meetings. iOS may suspend microphone capture when locking the screen, switching apps, receiving calls or running out of storage/memory. MediaRecorder chunks currently accumulate in memory and can be lost if the tab crashes. For important meetings use a dedicated recording device and import its files in a later phase. Test on each device before use.
