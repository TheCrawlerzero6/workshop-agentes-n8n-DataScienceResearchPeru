"""Offline validation: Agent Skills metadata, local links and safe distribution artifacts."""
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
errors = []
SKILLS = ROOT / ".agents" / "skills"
MIRROR = ROOT / ".claude" / "skills"
skills = list(SKILLS.glob("*/SKILL.md"))
if len(skills) != 6:
    errors.append("Expected six skill entrypoints")
for p in skills:
    text = p.read_text(encoding="utf-8").replace("\r\n", "\n")
    match = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not match:
        errors.append(f"{p}: invalid frontmatter")
        continue
    name = re.search(r"^name: (.+)$", match[1], re.M)
    description = re.search(r"^description: (.+)$", match[1], re.M)
    if not name or name[1] != p.parent.name or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name[1]) or len(name[1]) > 64:
        errors.append(f"{p}: invalid name")
    if not description or not 1 <= len(description[1]) <= 1024:
        errors.append(f"{p}: invalid description")
    if len(text.splitlines()) > 500 or "[TODO" in text:
        errors.append(f"{p}: unfinished or oversized skill")
    ui = p.parent / "agents/openai.yaml"
    if ui.exists():
        content = ui.read_text(encoding="utf-8")
        if f"${p.parent.name}" not in content or "?" in content:
            errors.append(f"{ui}: invalid prompt or damaged encoding")

# Claude Code discovers .claude/skills; the copy must stay identical to .agents/skills.
source = {f.relative_to(SKILLS): f for f in SKILLS.rglob("*") if f.is_file()}
mirror = {f.relative_to(MIRROR): f for f in MIRROR.rglob("*") if f.is_file()} if MIRROR.exists() else {}
for rel in sorted(set(source) | set(mirror)):
    if rel not in mirror or rel not in source or source[rel].read_bytes() != mirror[rel].read_bytes():
        errors.append(f".claude/skills/{rel.as_posix()}: mirror differs from .agents/skills")

for p in ROOT.rglob("*.md"):
    if {"local", ".git", "node_modules"} & set(p.relative_to(ROOT).parts):
        continue
    for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", p.read_text(encoding="utf-8")):
        if re.match(r"[a-zA-Z]+:", target) or target.startswith("#"):
            continue
        target = target.split("#")[0].strip("<>")
        if not (p.parent / target).exists():
            errors.append(f"{p.relative_to(ROOT)}: missing link {target}")

for p in (ROOT / "backup/workflows").glob("*.json"):
    obj = json.loads(p.read_text(encoding="utf-8"))
    if "nodes" not in obj:
        continue
    if obj.get("active") is not False or obj.get("pinData"):
        errors.append(f"{p.name}: distribution must be inactive and unpinned")
    if any(n.get("credentials") for n in obj["nodes"]):
        errors.append(f"{p.name}: distribution contains credential references")

if errors:
    print("\n".join(errors))
    sys.exit(1)
print(f"OK: {len(skills)} skills (mirror in sync), local links and inactive distribution artifacts")
