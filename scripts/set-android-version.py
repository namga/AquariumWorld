from pathlib import Path
import re

candidates = [Path("android/app/build.gradle"), Path("android/app/build.gradle.kts")]
target = next((p for p in candidates if p.exists()), None)
if target is None:
    raise SystemExit("Android app Gradle file not found")
text = target.read_text(encoding="utf-8")
if re.search(r"\bversionCode\s*=?\s*\d+", text):
    text = re.sub(r"\bversionCode\s*=?\s*\d+", "versionCode 231" if target.suffix == ".gradle" else "versionCode = 231", text, count=1)
else:
    raise SystemExit("versionCode declaration not found")
if re.search(r"\bversionName\s*=?\s*['\"][^'\"]+['\"]", text):
    text = re.sub(r"\bversionName\s*=?\s*['\"][^'\"]+['\"]", 'versionName "2.3.1"' if target.suffix == ".gradle" else 'versionName = "2.3.1"', text, count=1)
else:
    raise SystemExit("versionName declaration not found")
target.write_text(text, encoding="utf-8")
print(f"Set Android versionCode=231, versionName=2.3.1 in {target}")
