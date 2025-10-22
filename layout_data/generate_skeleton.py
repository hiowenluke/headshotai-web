"""Generate static skeleton HTML files from captured layout data.

Drop any layout JSON exported via the capture utility into the `layout_data`
folder and run this script. For each `*.json` file, a same-named `*.html`
skeletal representation will be created next to it.

Usage:
  python generate_skeleton.py

Each output HTML mirrors the structure of our handcrafted skeleton, while the
content (labels, counts, spacing) is derived directly from the captured layout
data. This keeps future design tweaks in sync without manual updates.
"""

from __future__ import annotations

import json
from pathlib import Path
from statistics import mean
from typing import Any, Dict, Iterable, List


SCRIPT_DIR = Path(__file__).resolve().parent
INPUT_DIR = SCRIPT_DIR  # folder containing layout JSON files


def _load_layout(path: Path) -> dict:
  with path.open("r", encoding="utf-8") as stream:
    return json.load(stream)


def _resolve_title(header: dict) -> str:
    title = (
        header.get("title", {})
        .get("text", "")
        .strip()
    )
    return title or "Headshot AI"


def _camel_to_kebab(name: str) -> str:
  result: List[str] = []
  for char in name:
    if char == "_":
      result.append("-")
      continue
    if char.isupper():
      result.append("-")
      result.append(char.lower())
    else:
      result.append(char)
  return "".join(result)


def _style_fragment(styles: Dict[str, Any], keys: Iterable[str]) -> str:
  fragments: List[str] = []
  for key in keys:
    value = styles.get(key)
    if value in (None, "", "auto"):
      continue
    fragments.append(f"{_camel_to_kebab(key)}: {value};")
  return " ".join(fragments)


def _extract_nav_metadata(nav_items: Iterable[dict]) -> List[dict]:
  items: List[dict] = []
  for idx, raw in enumerate(nav_items):
    text = (raw.get("text") or "").strip()
    if not text:
      continue
    styles = raw.get("styles") or {}
    rect = raw.get("rect") or {}
    base = _style_fragment(
      styles,
      (
        "padding",
        "paddingTop",
        "paddingBottom",
        "paddingLeft",
        "paddingRight",
        "fontSize",
        "fontWeight",
        "color",
        "background",
        "backgroundColor",
        "border",
        "borderRadius",
        "boxShadow",
      ),
    )

    width = rect.get("width")
    height = rect.get("height")
    extra = []
    if width:
      extra.append(f"min-width: {width}px;")
    if height:
      extra.append(f"min-height: {height}px;")

    items.append(
      {
        "index": idx,
        "text": text,
        "active": "active" in (raw.get("classes") or []),
        "style": " ".join([base, *extra]).strip(),
      }
    )
  if not items:
    return [
      {
        "index": 0,
        "text": "Primary",
        "active": True,
        "style": "",
      }
    ]
  return items


def _avg_card_ratio(cards: Iterable[dict]) -> float:
    ratios = []
    for raw in cards:
        rect = raw.get("rect") or {}
        width = rect.get("width")
        height = rect.get("height")
        if not width or not height:
            continue
        try:
            ratios.append(float(width) / float(height))
        except (TypeError, ZeroDivisionError):
            continue
    return mean(ratios) if ratios else 0.8


def _render_nav(items: Iterable[dict]) -> str:
  parts = []
  for item in items:
    classes = ["app-shell-chip"]
    if not item.get("active"):
      classes.append("inactive")
    style = item.get("style")
    style_attr = f' style="{style}"' if style else ""
    parts.append(
      f'          <div class="{" ".join(classes)}" data-index="{item.get("index")}"{style_attr}>{item.get("text")}</div>'
    )
  return "\n".join(parts)


def _render_icons(icons: Iterable[dict]) -> str:
    parts: List[str] = []
    for idx, icon in enumerate(icons):
        styles = icon.get("styles") or {}
        rect = icon.get("rect") or {}
        base = _style_fragment(
            styles,
            (
                "margin",
                "marginLeft",
                "marginRight",
                "background",
                "backgroundColor",
                "border",
                "borderRadius",
                "boxShadow",
            ),
        )
        width = rect.get("width")
        height = rect.get("height")
        extra = []
        if width:
            extra.append(f"width: {width}px;")
        if height:
            extra.append(f"height: {height}px;")
        style = " ".join([base, *extra]).strip()
        style_attr = f' style="{style}"' if style else ""
        parts.append(
            f'            <div class="app-shell-icon" data-icon-index="{idx}"{style_attr}></div>'
        )
    if not parts:
        parts = [
            '            <div class="app-shell-icon" data-icon-index="0"></div>',
            '            <div class="app-shell-icon" data-icon-index="1"></div>',
        ]
    return "\n".join(parts)


def _render_cards(card_count: int) -> str:
    return "\n".join(
        f"          <div class=\"app-shell-card\" data-card-index=\"{i}\"></div>"
        for i in range(card_count)
    )


def build_skeleton(layout: dict) -> str:
    header = layout.get("header") or {}
    cards = layout.get("cards") or {}

    nav_items = _extract_nav_metadata(header.get("navItems") or [])
    card_items = cards.get("items") or []
    card_ratio = _avg_card_ratio(card_items)

    title = _resolve_title(header)
    padding_top = header.get("container", {}).get("rect", {}).get("height", 108)
    padding_top = float(padding_top) + 14  # little breathing room

    nav_html = _render_nav(nav_items)
    cards_html = _render_cards(len(card_items) or 8)

    header_styles = header.get("container", {}).get("styles") or {}
    header_style = _style_fragment(
        header_styles,
        (
            "background",
            "backgroundColor",
            "boxShadow",
            "border",
            "margin",
            "marginTop",
            "marginBottom",
        ),
    )
    header_style_attr = f' style="{header_style}"' if header_style else ""

    title_styles = header.get("title", {}).get("styles") or {}
    title_style = _style_fragment(title_styles, ("fontSize", "fontWeight", "color"))
    title_style_attr = f' style="{title_style}"' if title_style else ""

    icon_html = _render_icons(header.get("icons") or [])

    # The CSS mirrors the handcrafted skeleton in the root `index.html`, but is
    # derived from the JSON so that future captures automatically pick up
    # spacing and label tweaks.
    html = f"""<!DOCTYPE html>
<html lang=\"en\">
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>{title} · Skeleton</title>
    <style>
      :root {{
        color-scheme: dark;
        --shell-bg: #0b0c0f;
        --shell-fg: #e6eef8;
        --shell-highlight: rgba(53, 61, 70, 0.65);
        --shell-border: rgba(126, 139, 153, 0.85);
      }}
      * {{
        box-sizing: border-box;
      }}
      html, body {{
        margin: 0;
        min-height: 100%;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: var(--shell-bg);
        color: var(--shell-fg);
      }}
      .app-shell {{
        min-height: 100vh;
        background: var(--shell-bg);
        color: var(--shell-fg);
      }}
      .app-shell-header {{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        padding: 8px 12px 12px;
        backdrop-filter: blur(18px) saturate(140%);
        -webkit-backdrop-filter: blur(18px) saturate(140%);
        background: rgba(37, 38, 43, 0.55);
        box-shadow: 0 2px 12px -2px rgba(0, 0, 0, 0.55);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        z-index: 10;
      }}
      .app-shell-topbar {{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 6px;
      }}
      .app-shell-title {{
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }}
      .app-shell-icons {{
        display: flex;
        gap: 10px;
        margin-right: -6px;
      }}
      .app-shell-icon {{
        width: 34px;
        height: 34px;
        border-radius: 16px;
        background: rgba(103, 117, 132, 0.28);
        border: 1px solid rgba(146, 162, 179, 0.38);
        position: relative;
        overflow: hidden;
      }}
      .app-shell-icon::after {{
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0));
        opacity: 0.55;
      }}
      .app-shell-nav {{
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 6px 0 2px;
        scrollbar-width: none;
      }}
      .app-shell-nav::-webkit-scrollbar {{
        display: none;
      }}
      .app-shell-chip {{
        flex: 0 0 auto;
        padding: 6px 21px;
        border-radius: 50px;
        border: 1px solid var(--shell-border);
        background: var(--shell-highlight);
        font-size: 15px;
        font-weight: 600;
      }}
      .app-shell-chip.inactive {{
        background: rgba(49, 59, 70, 0.18);
        border-color: rgba(95, 105, 118, 0.36);
        font-weight: 500;
        color: rgba(255, 255, 255, 0.58);
      }}
      .app-shell-content {{
        padding: {padding_top:.0f}px 0 48px;
      }}
      .app-shell-grid {{
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        padding: 0 12px 60px;
      }}
      .app-shell-card {{
        position: relative;
        width: 100%;
        aspect-ratio: {card_ratio:.3f};
        border-radius: 16px;
        background: linear-gradient(135deg, rgba(77, 84, 94, 0.28), rgba(43, 48, 56, 0.48));
        border: 1px solid rgba(132, 144, 160, 0.32);
        overflow: hidden;
        box-shadow: 0 8px 22px -12px rgba(0, 0, 0, 0.65);
      }}
      .app-shell-card::after {{
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(100deg, rgba(255, 255, 255, 0.08) 20%, rgba(255, 255, 255, 0.35) 40%, rgba(255, 255, 255, 0.05) 60%);
        transform: translateX(-100%);
        animation: shell-shimmer 1.25s ease-in-out infinite;
      }}
      @keyframes shell-shimmer {{
        0% {{ transform: translateX(-100%); }}
        100% {{ transform: translateX(100%); }}
      }}
      @media (min-width: 540px) {{
        .app-shell-header {{
          margin: 0 auto;
          max-width: 500px;
          border-radius: 0 0 18px 18px;
        }}
        .app-shell-grid {{
          max-width: 500px;
          margin: 0 auto;
        }}
      }}
    </style>
  </head>
  <body>
    <div class="app-shell">
      <div class="app-shell-header"{header_style_attr}>
        <div class="app-shell-topbar">
          <div class="app-shell-title"{title_style_attr}>{title}</div>
          <div class="app-shell-icons">
{icon_html}
          </div>
        </div>
        <div class="app-shell-nav">
{nav_html}
        </div>
      </div>
      <div class="app-shell-content">
        <div class="app-shell-grid">
{cards_html}
        </div>
      </div>
    </div>
  </body>
</html>
"""

    return html.strip() + "\n"


def main() -> None:
  if not INPUT_DIR.exists():
    raise FileNotFoundError(f"Input directory not found: {INPUT_DIR}")

  json_files = sorted(INPUT_DIR.glob("*.json"))
  if not json_files:
    print(f"No JSON layout files found in {INPUT_DIR}")
    return

  for json_path in json_files:
    try:
      layout = _load_layout(json_path)
      skeleton = build_skeleton(layout)
      output_path = json_path.with_suffix(".html")
      output_path.write_text(skeleton, encoding="utf-8")
      rel = output_path.relative_to(SCRIPT_DIR)
      print(f"Skeleton written to: {rel}")
    except Exception as err:
      print(f"Failed to process {json_path.name}: {err}")


if __name__ == "__main__":
    main()
