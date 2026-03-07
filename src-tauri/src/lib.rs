use tauri_plugin_dialog::DialogExt;

// remember: this macro exposes the function to the React frontend
#[tauri::command]
async fn open_file_picker(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    
    // 1- Opens Windows file explorer using the blocking version!
    let file_paths = app.dialog().file()
        .add_filter("Images", &["png", "jpg", "jpeg", "heic", "heif", "dng"])
        .set_title("Select patient scansheets")
        .blocking_pick_files();

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init()) 
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_file_picker]) // dont forget this, add the function
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}