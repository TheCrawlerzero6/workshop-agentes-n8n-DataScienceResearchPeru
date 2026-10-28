"""Copy .agents/skills (source) to .claude/skills (Claude Code mirror)."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / ".agents" / "skills"
MIRROR = ROOT / ".claude" / "skills"

if MIRROR.exists():
    shutil.rmtree(MIRROR)
shutil.copytree(SOURCE, MIRROR)
print(f"OK: {MIRROR.relative_to(ROOT)} synced from {SOURCE.relative_to(ROOT)}")
