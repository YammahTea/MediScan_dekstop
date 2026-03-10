use tauri_plugin_dialog::DialogExt;
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader}; // for reading line by line
use tauri::Emitter;
use std::env;

// remember: this macro exposes the function to the React frontend
#[tauri::command]
async fn open_file_picker(app: tauri::AppHandle, file_type: String) -> Result<Vec<String>, String> {
    
    // 1- Opens Windows file explorer with the blocking version 
    // depnding on the file type requested from the frontend
        
    let file_paths = { 
        if file_type == "Images" {
            app.dialog().file()
            .add_filter("Images", &["png", "jpg", "jpeg", "heic", "heif", "dng"])
            .set_title("Select patient scansheets")
            .blocking_pick_files() // without this, the app crashes
            // the purpose of it:
            // it freezes all code execution right here until the user either picks a file or hits Cancel
        } else {
            app.dialog().file()
            .add_filter("Excel Files", &["xlsx", "xls"])
            .set_title("Select Excel reports")
            .blocking_pick_files() // without this, the app crashes         
        } 
    };
        
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
async fn process_images(app: tauri::AppHandle, file_paths: Vec<String>) -> Result<String, String> {

    // 1- Get the directories  
    // THIS TO AVOID WINDOWS BS WITH  BACKSLASHES 
    // Gets the current absolute directory (mediscan-desktop)
    let current_dir = env::current_dir().map_err(|e| format!("Path error: {}", e))?;

    // Safely jump up TWO folders, then into the python engine folder
    // note: Rust's .join() automatically uses correct Windows backslashes (\)
    let workspace_dir = current_dir.parent().unwrap().parent().unwrap(); // two jumps
    let engine_dir = workspace_dir.join("mediscan-py-engine");

    let python_exe = engine_dir.join(".venv").join("Scripts").join("python.exe");

    // 2- Process the images
    let mut child = Command::new(python_exe)
        .current_dir(&engine_dir)
        .arg("pipeline.py")
        .args(file_paths)
        .stdout(Stdio::piped()) // this opens a live pipe to python's output
        .stderr(Stdio::piped())
        .spawn() // starts the script in the background
        .map_err(|e| format!("Failed to start Python: {}", e))?;

    // 3- Listen to python's live output 
    let stdout = child.stdout.take().expect("Failed to grab stdout");
    let reader = BufReader::new(stdout);

    
    let mut final_excel_path = String::new();
    let mut error_log = String::new();

    // 4- handle python outputs
    for line in reader.lines() {
        if let Ok(line_str) = line {

            // If it's a progress update, it sends to react loaderModal
            if line_str.contains("===PROGRESS===") {
                let parts: Vec<&str> = line_str.split("===").collect();
                if parts.len() >= 3 {
                    let progress_msg = parts[2].to_string();
                    // This uses the Emitter trait to send the message to the frontend!
                    let _ = app.emit("scan-progress", progress_msg);
                }
            }

            // if it's a final success message, it saves the path
            else if line_str.contains("===MEDISCAN_SUCCESS===") {
                let parts: Vec<&str> = line_str.split("===").collect();
                if parts.len() >= 3 {
                    final_excel_path = parts[2].to_string();
                }
            }

            else if line_str.contains("===MEDISCAN_ERROR===") {
                error_log.push_str(&line_str);
            }
        }

    }

    let _ = child.wait(); // waits for the script to finish

    // 6- Return the final result
    if !final_excel_path.is_empty() {
        Ok(final_excel_path)
    } else {
        Err(format!("Python Engine Failed:\n{}", error_log))
    }
}


#[tauri::command]
async fn merge_files(file_paths: Vec<String>) -> Result<String, String> {

    // 1- Run python script 
    let current_dir = env::current_dir().map_err(|e| format!("Path error: {}", e))?;

    let workspace_dir = current_dir.parent().unwrap().parent().unwrap();
    let engine_dir = workspace_dir.join("mediscan-py-engine");

    let python_exe = engine_dir.join(".venv").join("Scripts").join("python.exe");


    let output = Command::new(python_exe)
        .current_dir(&engine_dir) 
        .arg("merge_tools.py")
        .args(file_paths)
        .output()
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
        .invoke_handler(tauri::generate_handler![open_file_picker, process_images, merge_files]) // dont forget this, add the functions
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}