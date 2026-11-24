from pathlib import Path
import hashlib
import shutil

repo = Path.cwd()
source = Path(__file__).resolve().parent / "index.html"
target = repo / "index.html"
if not (repo / ".git").exists():
    raise SystemExit("Run this script from the root of the Set-Up.pro Git repository.")
if not target.is_file():
    raise SystemExit("index.html is missing in the current directory.")
raw = target.read_bytes()
sha = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
if sha != "8c65550e799495a4fbe0b5e7f652d457ee38ae84":
    raise SystemExit("index.html has changed since this patch was prepared. Review and merge instead of overwriting.")
old = repo / "workouts.html"
if old.exists():
    raw = old.read_bytes()
    sha = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
    if sha != "262f71499c0dc27ecc2467f5974767c0020ab834":
        raise SystemExit("workouts.html has changed since this patch was prepared. Review its changes first.")
if source == target.resolve():
    raise SystemExit("Extract the update package outside the repository before applying it.")
shutil.copyfile(source, target)
if old.exists():
    old.unlink()
print("Updated index.html; deleted workouts.html. Review git diff before committing.")
