from fastapi import FastAPI
app = FastAPI(title="ICS AI Service")
@app.get("/health")
def health():
 return {"status": "ok"}