use tauri_plugin_dialog::DialogExt;
use std::process::Command;
use std::env;

// remember: this macro exposes the function to the React frontend
#[tauri::command]
async fn open_file_picker(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    
    // 1- Opens Windows file explorer using the blocking version!
    let file_paths = app.dialog().file()
        .add_filter("Images", &["png", "jpg", "jpeg", "heic", "heif", "dng"])
        .set_title("Select patient scansheets")
        .blocking_pick_files(); // without this, the app crashes
        // the purpose of it:
        // it freezes all code execution right here until the user either picks a file or hits Cancel

        
    // 2- Check what the user selected
    match file_paths {
        Some(paths) => {
            // convert the paths into standard Strings and return them
            let string_paths: Vec<String> = paths.into_iter().map(|p| p.to_string()).collect();
            Ok(string_paths)
        }
        None => { 
            Ok(Vec::new())
        }
    }
}

#[tauri::command]
// result is the message in "pipeline.py", the save file happens inside pipeline.py
async fn process_images(file_paths: Vec<String>) -> Result<String, String> {

    // THIS TO AVOID WINDOWS BS WITH  BACKSLASHES 
    // 1- Get the current absolute directory (mediscan-desktop)
    let current_dir = env::current_dir().map_err(|e| format!("Path error: {}", e))?;


    // 2- Safely jump up TWO folders, then into the python engine folder
    // note: Rust's .join() automatically uses correct Windows backslashes (\)
    let workspace_dir = current_dir.parent().unwrap().parent().unwrap(); // two jumps
    let engine_dir = workspace_dir.join("mediscan-py-engine");

    
    // 3- the absolute path to the Python executable
    let python_exe = engine_dir.join(".venv").join("Scripts").join("python.exe");

    // 1- terminal command for python\
    // python pipeline.py path1 path2 <- the command
    let output = Command::new(python_exe)
        .current_dir(&engine_dir) // so python can execute code inside its own folder and not jump around
        .arg("pipeline.py") // to pass one single sring
        .args(file_paths) // to pass multiple strings
        .output() //runs the command and waits for python to finish
        .map_err(|e| format!("Failed to execute Python code: {}", e))?;

    // 2- listen to python output
    let stdout: String = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr: String = String::from_utf8_lossy(&output.stderr).to_string();

    // 3- handle python output
    if stdout.contains("===MEDISCAN_SUCCESS===") {

        // splits the string to extract just the Excel file path
        let parts: Vec<&str> = stdout.split("===").collect();
        if parts.len() >= 3 {
            let excel_path = parts[2].to_string();
            return Ok(excel_path);
        }
    }

    Err(format!("Python AI Error:\nOutput: {}\nError: {}", stdout, stderr))
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init()) 
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_file_picker, process_images]) // dont forget this, add the functions
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}