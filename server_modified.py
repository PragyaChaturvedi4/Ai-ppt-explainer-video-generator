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
BASE_DIR = os.path.expanduser("~/ai_presentation_project")

def run_pipeline(task_id: str, pptx_path: str, face_image_path: str, work_dir: str, voice: str = "Joanna", style: str = "Detailed", use_avatar: bool = True):
    tasks[task_id] = "processing"
    try:
        # We run the command from work_dir, so the "output" folder goes there.
        # But we point python to the ai_presentation_project/main.py
        main_script = os.path.join(BASE_DIR, "main.py")
        output_dir = os.path.join(work_dir, "output")
        log_file = os.path.join(work_dir, "pipeline.log")

        env = os.environ.copy()
        env["PYTHONPATH"] = BASE_DIR

        # Run subprocess with real-time output logging
        process = subprocess.Popen(
            ["python3", main_script, pptx_path, face_image_path, output_dir, voice, style, str(use_avatar)],
            cwd=BASE_DIR,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )

        # Stream output to log file and stdout in real-time
        with open(log_file, "w") as log_f:
            for line in process.stdout:
                print(f"[{task_id}] {line}", end='')
                log_f.write(line)
                log_f.flush()

        process.wait()

        if process.returncode == 0:
            tasks[task_id] = "completed"
        else:
            print(f"Task {task_id} failed with return code {process.returncode}")
            tasks[task_id] = "failed"

    except Exception as e:
        print(f"Task {task_id} exception: {e}")
        tasks[task_id] = "failed"


@app.post("/api/generate")
async def generate_video(pptx: UploadFile, face_image: UploadFile, voice: str = "Joanna", style: str = "Detailed", use_avatar: str = "true", background_tasks: BackgroundTasks = None):
    task_id = str(uuid.uuid4())
    work_dir = os.path.join(BASE_DIR, "tasks", task_id)
    os.makedirs(work_dir, exist_ok=True)

    # Save PPTX in work_dir
    pptx_path = os.path.join(work_dir, pptx.filename)
    with open(pptx_path, "wb") as f:
        f.write(await pptx.read())

    # Save face image in work_dir
    face_path = os.path.join(work_dir, face_image.filename)
    with open(face_path, "wb") as f:
        f.write(await face_image.read())

    tasks[task_id] = "starting"

    # Convert string to boolean
    use_avatar_bool = use_avatar.lower() == "true"

    # Run in background
    background_tasks.add_task(run_pipeline, task_id, pptx_path, face_path, work_dir, voice, style, use_avatar_bool)

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


@app.delete("/api/projects/{task_id}")
async def delete_project(task_id: str):
    task_path = os.path.join(BASE_DIR, "tasks", task_id)
    if os.path.exists(task_path):
        import shutil
        try:
            shutil.rmtree(task_path)
            if task_id in tasks:
                del tasks[task_id]
            return {"success": True, "message": "Project deleted successfully"}
        except Exception as e:
            return JSONResponse(status_code=500, content={"success": False, "error": str(e)})
    return JSONResponse(status_code=404, content={"success": False, "error": "Project not found"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
