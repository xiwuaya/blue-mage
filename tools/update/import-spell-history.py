import argparse
import csv
import difflib
import io
import json
from pathlib import Path
import re
import subprocess
import tempfile
import time
from urllib.error import URLError
from urllib.request import urlopen

UPSTREAM = "https://github.com/thewakingsands/ffxiv-datamining-cn.git"
RAW = "https://raw.githubusercontent.com/thewakingsands/ffxiv-datamining-cn"
DATA = Path(__file__).resolve().parents[1] / "data"
COLOR = re.compile(r"<(UIForeground|UIGlow)>[0-9A-Fa-f]+</\1>")
TOKEN = re.compile(r"\d+(?:\.\d+)?|.", re.S)


def patch_key(patch):
    major, minor, suffix = re.fullmatch(r"(\d+)\.(\d+)([a-z]*)", patch).groups()
    return int(major), minor.rstrip("0"), suffix


def changes(before, after):
    left, right = TOKEN.findall(before), TOKEN.findall(after)
    matcher = difflib.SequenceMatcher(None, left, right, autojunk=False)
    parts = []
    for op, i, j, k, l in matcher.get_opcodes():
        old, new = "".join(left[i:j]), "".join(right[k:l])
        parts.append(old if op == "equal" else [old, new])
    return parts


def generate(versions, read_csv):
    spells = json.loads((DATA / "spells.json").read_text(encoding="utf-8"))
    actions = {str(s["action"]): s for s in spells}
    history, previous = {}, {}
    for patch, sha in versions:
        rows = csv.reader(io.StringIO(read_csv(patch, sha)))
        current = {}
        for row in rows:
            if len(row) < 2 or row[0] not in actions or not row[1].strip():
                continue
            action = row[0]
            if patch_key(patch) < patch_key(actions[action]["patch"]):
                continue
            value = COLOR.sub("", row[1]).replace("\r\n", "\n").strip()
            current[action] = (patch, value)
            if action in previous:
                old_patch, old = previous[action]
                if old != value:
                    history.setdefault(action, []).append({
                        "from": old_patch, "to": patch, "parts": changes(old, value)
                    })
        if not current:
            raise ValueError(f"No matching spells in {patch}")
        previous.update(current)
    return {"versions": dict(versions), "spells": history}


def remote_versions():
    output = subprocess.check_output(
        ["git", "ls-remote", "--tags", UPSTREAM, "refs/tags/patch-*"], text=True
    )
    # Annotated tags have a second, peeled ref pointing at the actual commit.
    refs = dict(line.split()[::-1] for line in output.splitlines())
    versions = {}
    for ref, sha in refs.items():
        if ref.endswith("^{}"):
            continue
        patch = ref.split("patch-", 1)[1]
        if patch_key(patch) >= patch_key("4.5"):
            versions[patch] = refs.get(ref + "^{}", sha)
    return sorted(versions.items(), key=lambda item: patch_key(item[0]))


def remote_csv(patch, sha):
    url = f"{RAW}/{sha}/ActionTransient.csv"
    for attempt in range(3):
        try:
            with urlopen(url, timeout=30) as response:
                return response.read().decode("utf-8-sig")
        except (URLError, OSError) as error:
            if attempt == 2:
                raise RuntimeError(f"读取国服 {patch} 失败：{url}") from error
            time.sleep(2 ** attempt)


def main(repo):
    if repo is None:
        versions = remote_versions()
        read_csv = remote_csv
    else:
        def git(*args):
            return subprocess.check_output(["git", "-C", repo, *args]).decode("utf-8-sig")

        tags = sorted(git("tag", "-l", "patch-*").splitlines(), key=lambda tag: patch_key(tag[6:]))
        versions = [(tag[6:], git("rev-parse", tag + "^{}").strip())
                    for tag in tags if patch_key(tag[6:]) >= patch_key("4.5")]
        def read_csv(patch, sha):
            return git("show", sha + ":ActionTransient.csv")

    if not versions:
        raise ValueError("找不到国服 4.5 起的版本标签")
    result = generate(versions, read_csv)
    target = DATA / "spell-history.json"
    with tempfile.NamedTemporaryFile(dir=DATA, delete=False) as temp:
        pending = Path(temp.name)
    try:
        pending.write_bytes((json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
        pending.replace(target)
    finally:
        pending.unlink(missing_ok=True)
    print(f"已处理 {len(versions)} 个国服快照，写入 {target.name}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="在线按版本读取技能描述，也可使用本地解包仓库")
    parser.add_argument("repo", nargs="?", help="已有国服解包仓库的本地路径（可选）")
    main(parser.parse_args().repo)
