from pathlib import Path
import shutil
src = Path('android-icons/res')
dst = Path('android/app/src/main/res')
if not dst.exists():
    raise SystemExit('Android project not found. Run npx cap add android first.')
for item in src.iterdir():
    target = dst / item.name
    if item.is_dir():
        target.mkdir(parents=True, exist_ok=True)
        for f in item.iterdir():
            shutil.copy2(f, target / f.name)
    else:
        shutil.copy2(item, target)
print('Aquarium World launcher icons installed.')
