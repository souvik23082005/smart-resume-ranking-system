import json
import urllib.request
import os

with open(r'C:\Users\souvi\.gemini\antigravity-ide\brain\9d3e5838-1082-40f9-9426-7b1e7d8fe3c6\.system_generated\steps\269\output.txt', 'r', encoding='utf-8') as f:
    data = json.load(f)

os.makedirs('stitch_screens', exist_ok=True)

for screen in data.get('screens', []):
    title = screen.get('title', 'Untitled').replace(' | ', '_').replace(' ', '_').replace('&', 'and')
    url = screen.get('htmlCode', {}).get('downloadUrl')
    if url:
        print(f"Downloading {title}...")
        try:
            urllib.request.urlretrieve(url, f"stitch_screens/{title}.html")
            print(f"Saved stitch_screens/{title}.html")
        except Exception as e:
            print(f"Failed to download {title}: {e}")
