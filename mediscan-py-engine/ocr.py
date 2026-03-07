from difflib import SequenceMatcher
import datetime
import cv2
import re

# helper functions
def preprocess_image(img):
  """
   Makes text pop out for better OCR.
  1- Grayscale
  2- Upscale
  3- Threshold (Black text on White bg)
  """

  # Convert to gray
  gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

  # Upscale - makes small text readable
  scaled = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

  # Threshold - strict black and white
  _, thresh = cv2.threshold(scaled, 120, 255, cv2.THRESH_BINARY)

  return thresh

def clean_text(text):
  """
  Cleans up OCR mess from whitespaces + fixes typos in date
  """
  if not text:
    return "-"

  text = text.strip()

  # just to fix common OCR typos in dates (e.g., "202{" -> "2025")
  text = text.replace("{", "5").replace('}', '5').replace('[', '5')

  return text

def standardize_date(text):
  """
  Makes all dates into YYYY/MM/DD format
  """

  if not text or len(text) < 0: return "-"

  # normalize separators
  text = text.replace('.', '/').replace('-', '/')

  parts = text.split('/')
  if len(parts) != 3: return text


  YY, MM, DD = parts

  if len(MM) > 2: # means an extra space was read between numbers (the ocr keeps seeing an extra space when reading the month part)
    MM = MM.replace(" ", "")

  if len(YY) == 4:
    return f"{YY}/{MM}/{DD}" # already in format

  # the day part is the year part, eg "27/12/2025"
  if len(DD) == 4:
    return f"{DD}/{MM}/{YY}" # flip

  return text

def clean_age(text):
  """
    1- Tries to find a Year (19xx or 20xx) then calculates Age
    2- If no year, looks for a simple number (e.g., "76 Years")
  """
  if not text: return "-"

  text = text.strip()

  # 1- find a 4 digit year and calculate age (date of birth)
  year_match = re.search(r'(19|20)\d{2}', text)

  if year_match:
    birth_year = int(year_match.group(0))
    current_year = datetime.datetime.now().year

    age = current_year - birth_year

    if 0 <= age <= 120:
      return str(age)

  # 2- find a 2-digit number, actual age and not DOB
  # If it sees "Years", "Months", it keeps the first number

  num_match = re.search(r'\d+', text)

  if num_match:
    value = int(num_match.group(0))

    if value > 10:
      return str(value)

  return "-"

def similar(a, b):
  """
  Returns a similarity score between 0 and 1
  """
  return SequenceMatcher(None, a, b).ratio()


def clean_payment(text):

  if not text: return "-"
  text_clean = text.strip()
  text_lower = text.lower()

  # Format: (Return value, Target for similarity, Similarity threshold, [List of Keywords])
  PAYMENT_RULES = [
    # 1- Nathealth
    ("Nathealth", "nathealth", 0.8, ["nat", "nathealth"]),

    # 2- Cash (Personal/Self)
    ("Cash", "شخصي", 0.7, ["شخص", "self"]),
    ("Cash", "نقدي", 0.7, ["نقد"]),

    # 3- Military insurance
    ("الخدمات العسكرية", "الخدمات الطبية العسكرية الفلسطينية", 0.6, ["الفلسطينية"]),

    # 4- MOH (Ministry of Health)
    ("التأمين الصحي", "وزارة الصحة", 0.6, ["وزارة", "الصحة"]),
    ("التأمين الصحي", "التامين الصحي", 0.8, ["التأمين"]),
  ]

  for return_val, target_sim, threshold, keywords in PAYMENT_RULES:

    # strict substring match (fast)
    if any(k in text_lower for k in keywords):
      return return_val

    # similarity checking (slower)
    if similar(text_clean, target_sim) > threshold:
      return return_val

  return text # default fallback

def get_best_ocr(reader, crop_img):
  """
  1- Process images (grays + upscales)
  2- Read text from processed image
  3- Detect the scanned language to switch between "LTR" and "RTL"
  4- Return the scanned text with confidence level
  """
  # 1- process the image
  processed_img = preprocess_image(crop_img)

  # 2- read text
  # detail=1 gives boxes+text+conf
  results = reader.readtext(processed_img, detail=1)

  if not results:
    return "-", 0.0

  # 3- detect language and sort
  # note: easyocr usually scans Top->Bottom, Left->Right

  # 3.1- check if the scanned text is arabic to make it read Right->Left
  is_arabic = False
  for (_, text, _) in results:
    if any('\u0600' <= char <= '\u06FF' for char in text):
      is_arabic = True
      break

  if is_arabic:
    results.sort(key=lambda x: x[0][0][0], reverse=True)
  else: # english
    results.sort(key=lambda x: x[0][0][0], reverse=False)

  full_text = []
  total_confidence = 0

  for (_, text, confidence) in results:
    full_text.append(text)
    total_confidence += confidence

  avg_confidence = total_confidence / len(results)

  return " ".join(full_text), avg_confidence