from io import BytesIO
from PIL import Image
from ultralytics import YOLO
import numpy as np
import pandas as pd

import sys
import os
import cv2

import easyocr
import datetime
import pillow_heif

# Modules
from ocr import get_best_ocr, clean_text, standardize_date, clean_age, clean_payment

# --- CONFIG ---
HUNTER_MODEL_PATH = './models/detect/train1/weights/best.pt'
SURGEON_MODEL_PATH = './models/surgeon/train_v1/weights/best.pt'
OCR_CONFIDENCE_THRESHOLD = 0.3

hospital_map = {
  "amman": "مستشفى عمان الجراحي",
  "hayaa": "مستشفى الحياة",
  "almqased": "مستشفى المقاصد",
  "hanan": "مستشفى الحنان",
  "other": "Other"
}

excel_structure = [
  ("المريض", 30),
  ("تاريخ الدخول", 15),
  ("تاريخ الخروج", 15),
  ("ملاحظات", 15),
  ("Age", 5),
  ("المستشفى", 20),
  ("Payment", 20),
  ("Diagnosis", 25),
  ("Expected Payment", 15),
  ("Sticker image", 43),
  ("File Name", 10)
]

def process_sheet(image, hunter, surgeon, reader, filename):
    final_data = []
    sheet = image

    hunter_results = hunter(sheet, verbose=False)
    if len(hunter_results[0].boxes) == 0:
        raise Exception("Couldn't find any stickers")

    for _, sticker_box in enumerate(hunter_results[0].boxes):
        hospital_id = int(sticker_box.cls[0])
        hospital_name = hunter.names[hospital_id]

        x1, y1, x2, y2 = map(int, sticker_box.xyxy[0])
        sticker_crop = sheet[y1:y2, x1:x2]

        if sticker_crop.size == 0:
            continue

        if sticker_box.conf[0] <= 0.3:
            hospital_name = "other"

        success, encoded_image = cv2.imencode('.png', sticker_crop)
        sticker_bytes = encoded_image.tobytes() if success else None

        if hospital_name == "other":
            patient_info = {
                "المريض": "-", "تاريخ الدخول": "-", "تاريخ الخروج": "-", "ملاحظات": "-",
                "Age": "-", "المستشفى": hospital_map.get(hospital_name, "Other"),
                "Payment": "-", "Diagnosis": "-", "Expected Payment": "-",
                "Sticker image": "", "File Name": filename, "image_data": sticker_bytes,
            }
            final_data.append(patient_info)
            continue

        surgeon_result = surgeon(sticker_crop, verbose=False)

        patient_info = {
            "المريض": "-", "تاريخ الدخول": "-", "تاريخ الخروج": "-", "ملاحظات": "-",
            "Age": "-", "المستشفى": hospital_map.get(hospital_name, "Other"),
            "Payment": "-", "Diagnosis": "-", "Expected Payment": "-",
            "Sticker image": "", "File Name": filename, "image_data": sticker_bytes
        }

        names_map = surgeon.names

        if hospital_name == "amman":
            detected_classes = [names_map[int(box.cls[0])] for box in surgeon_result[0].boxes]
            if "field_payment" not in detected_classes:
                patient_info["Payment"] = "Cash"

        for box in surgeon_result[0].boxes:
            class_id = int(box.cls[0])
            class_name = names_map[class_id]

            bx1, by1, bx2, by2 = map(int, box.xyxy[0])
            field_cropped = sticker_crop[by1:by2, bx1:bx2]

            text, confidence = get_best_ocr(reader, field_cropped)

            final_value = "-" if confidence < OCR_CONFIDENCE_THRESHOLD else clean_text(text)

            if class_name == "field_name":
                if "nathealth" in final_value.lower() or "nat" in final_value.lower():
                    continue
                patient_info["المريض"] = final_value
            elif class_name == "field_date":
                patient_info["تاريخ الدخول"] = standardize_date(final_value)
            elif class_name == "field_age":
                patient_info["Age"] = clean_age(final_value)
            elif class_name == "field_payment":
                patient_info["Payment"] = clean_payment(final_value)

        final_data.append(patient_info)

    return final_data

def save_data(patient_data):
    if not patient_data:
        raise Exception("Couldn't extract data from stickers")

    df = pd.DataFrame(patient_data)
    display_cols = [col[0] for col in excel_structure]
    df_export = df[[c for c in display_cols if c in df.columns]]

    # Save directly to the user's Documents folder 
    docs_folder = os.path.join(os.path.expanduser("~"), "Documents", "MediScan_Results")
    os.makedirs(docs_folder, exist_ok=True) # creates the folder if it doesn't exist
    
    filename_str = datetime.datetime.now().strftime("Report_%Y-%m-%d_%H-%M-%S.xlsx")
    file_path = os.path.join(docs_folder, filename_str)

    with pd.ExcelWriter(file_path, engine='xlsxwriter') as writer:
        df_export.to_excel(writer, index=False, sheet_name="Sheet1")
        workbook = writer.book
        worksheet = writer.sheets['Sheet1']
        worksheet.right_to_left()

        for i, (col_name, width) in enumerate(excel_structure):
            worksheet.set_column(i, i, width)

        img_col_index = display_cols.index("Sticker image")
        for i, row_data in df.iterrows():
            image_bytes = row_data.get('image_data')
            if image_bytes:
                excel_row = i + 1
                worksheet.set_row(excel_row, 100)
                with Image.open(BytesIO(image_bytes)) as img:
                    target_height = 125
                    aspect_ratio = img.width / img.height
                    new_width = int(target_height * aspect_ratio)
                    img_resized = img.resize((new_width, target_height), Image.Resampling.LANCZOS)
                    image_stream = BytesIO()
                    img_resized.save(image_stream, format="PNG")
                    image_stream.seek(0)

                worksheet.insert_image(
                    excel_row, img_col_index, "sticker.png",
                    {'image_data': image_stream, 'object_position': 1, 'x_offset': 5, 'y_offset': 5}
                )

    return file_path

# --- NOTE: THE CHILD PROCESS PATTERN ---
# This script does NOT run as an imported module or a web server
# It runs as an isolated background process managed by Rust
# Rust acts like a user typing in a hidden terminal, passing local image paths via sys.argv
# it prints a formatted string (===MEDISCAN_SUCCESS===...) at the end for Rust to intercept and read

if __name__ == "__main__":
    try:
        # 1- Grab all the file paths passed from Rust
        image_paths = sys.argv[1:] 
        
        if not image_paths:
            raise Exception("No image paths were provided to the engine.")

        # 2- load up models
        hunter = YOLO(HUNTER_MODEL_PATH)
        surgeon = YOLO(SURGEON_MODEL_PATH)
        reader = easyocr.Reader(['en', 'ar'], gpu=True)

        all_patient_data = []

        # 3- Process all image paths
        for path in image_paths:
            if not os.path.exists(path):
                continue

            filename = os.path.basename(path)
            
            # read image directly from the local disk
            if path.lower().endswith(('.heic', '.heif')):
                heif_file = pillow_heif.read_heif(path)
                pil_image = Image.frombytes(heif_file.mode, heif_file.size, heif_file.data, "raw")
                np_image = np.array(pil_image)
                image_array = cv2.cvtColor(np_image, cv2.COLOR_RGB2BGR)
            else:
                image_array = cv2.imread(path)

            if image_array is None:
                continue

            sheet_result = process_sheet(image_array, hunter, surgeon, reader, filename)
            all_patient_data.extend(sheet_result)

        # 4- Save
        saved_excel_path = save_data(all_patient_data)

        # so rust can knows the exact message if it successed/failed from the scanning spam
        print(f"===MEDISCAN_SUCCESS==={saved_excel_path}===END===")

    except Exception as e:
        print(f"===MEDISCAN_ERROR==={str(e)}===END===")
        sys.exit(1)