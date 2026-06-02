import os
import uuid
import subprocess
import threading
import glob
import time
from fastapi import FastAPI, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tasks = {}
BASE_DIR = os.path.expanduser("~/backend") if os.path.exists(os.path.expanduser("~/backend/main.py")) else os.path.expanduser("~")

def run_pipeline(task_id: str, pptx_path: str, face_image_path: str, work_dir: str):
    tasks[task_id] = "processing"
    try:
        # We run the command from work_dir, so the "output" folder goes there.
        # But we point python to the original main.py
        main_script = os.path.join(BASE_DIR, "main.py")
        env = os.environ.copy()
        env["PYTHONPATH"] = BASE_DIR

        process = subprocess.run(
            ["python3", main_script, pptx_path, face_image_path],
            cwd=work_dir,
            env=env,
            capture_output=True,
            text=True
        )

        if process.returncode == 0:
            tasks[task_id] = "completed"
        else:
            print(f"Task {task_id} failed: {process.stderr}")
            tasks[task_id] = "failed"

    except Exception as e:
        print(f"Task {task_id} exception: {e}")
        tasks[task_id] = "failed"


@app.post("/api/generate")
async def generate_video(pptx: UploadFile, face_image: UploadFile, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    work_dir = os.path.join(BASE_DIR, "tasks", task_id)
    os.makedirs(work_dir, exist_ok=True)

    pptx_path = os.path.join(work_dir, pptx.filename)
    with open(pptx_path, "wb") as f:
        f.write(await pptx.read())

    face_path = os.path.join(work_dir, face_image.filename)
    with open(face_path, "wb") as f:
        f.write(await face_image.read())

    tasks[task_id] = "starting"

    # Run in background
    background_tasks.add_task(run_pipeline, task_id, pptx.filename, face_image.filename, work_dir)

    return {"task_id": task_id, "status": "starting"}


@app.get("/api/status/{task_id}")
async def get_status(task_id: str):
    status = tasks.get(task_id, "not_found")
    return {"task_id": task_id, "status": status}


@app.get("/api/video/{task_id}")
async def get_video(task_id: str):
    video_path = os.path.join(BASE_DIR, "tasks", task_id, "output", "final_video.mp4")
    if os.path.exists(video_path):
        return FileResponse(video_path, media_type="video/mp4")
    return JSONResponse(status_code=404, content={"error": "Video not ready or not found"})

@app.get("/api/projects")
async def get_projects():
    projects = []
    tasks_dir = os.path.join(BASE_DIR, "tasks")
    if not os.path.exists(tasks_dir):
        return {"projects": []}

    for task_id in os.listdir(tasks_dir):
        task_path = os.path.join(tasks_dir, task_id)
        if os.path.isdir(task_path):
            output_video = os.path.join(task_path, "output", "final_video.mp4")
            if os.path.exists(output_video):
                pptx_files = glob.glob(os.path.join(task_path, "*.ppt*"))
                base_name = os.path.basename(pptx_files[0]) if pptx_files else "Generated Video"
                mod_time = os.path.getmtime(output_video)

                projects.append({
                    "id": task_id,
                    "title": base_name,
                    "date": time.strftime('%Y-%m-%d %H:%M', time.localtime(mod_time)),
                    "timestamp": mod_time,
                    "status": "completed"
                })

    projects.sort(key=lambda x: x["timestamp"], reverse=True)
    return {"projects": projects}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
