# AI Video Generator: Cloud Presentation Tool

This project provides a frontend and backend platform to automatically convert PowerPoint (`.pptx`) presentations into fully-narrated MP4 videos using AWS cloud infrastructure. 

The architecture consists of a **Vite/React Frontend** dashboard, and a **FastAPI AWS EC2 Backend** that handles file uploads and triggers a Python background pipeline (using Amazon Polly, FLAN-T5, and FFmpeg).

---

## ☁️ 1. Running the Backend (AWS EC2)

The backend server is a lightweight Python FastAPI application deployed on an AWS EC2 instance. It wraps your existing `main.py` pipeline.

### Prerequisites on EC2
Ensure you have Python installed and the required pip packages.
```bash
python3 -m pip install fastapi uvicorn python-multipart
```

### Required Infrastructure Setup
1. Open your AWS Console.
2. Go to **EC2 > Security Groups**.
3. Select the Security Group attached to your instance (`51.20.117.218`).
4. Add an **Inbound Rule**:
   - **Type**: Custom TCP
   - **Port Range**: `8000`
   - **Source**: `0.0.0.0/0` (Anywhere IPv4)

### Starting the Server
SSH into your EC2 instance using your `.pem` key, and launch the server in the background:

```bash
# Securely SSH into the EC2 instance
ssh -i keys/cloud_computing_key.pem ec2-user@51.20.117.218

# Launch the FastAPI server in the background and detach it
nohup python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &
```

*The backend will now correctly listen for file uploads and progress checks at `http://51.20.117.218:8000`.*

---

## 🖥 2. Running the Frontend (Local React Dashboard)

The frontend is a completely styled React mapping interface using `Vite`.

### Quick Start
1. Ensure you have Node.js installed locally.
2. Clone/open the `cloud` repository folder.
3. Install user interface dependencies:
```bash
npm install
```
4. Start the interactive development environment:
```bash
npm run dev
```
5. Navigate to `http://localhost:5173` in your browser.

## 🔗 Architecture Overview
1. **Upload Phase**: The React frontend sends a `POST` FormData request with the PPTX file to `/api/generate` on the EC2 IP.
2. **Execution Phase**: The EC2 `server.py` isolates the file into a task directory and runs `subprocess.run(python3 main.py ...)` asynchronously.
3. **Tracking Phase**: The React frontend polls `GET /api/status/{task_id}` to know when the processing pipeline finishes.
4. **Playback Phase**: React maps a native `<video>` tag directly to the generated media located on the cloud at `GET /api/video/{task_id}`.
