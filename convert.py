import json
import re

input_file = 'your_word_list.txt'
output_file = 'words.json'

class_map = {
    'n': 'noun',
    'adj': 'adjective',
    'v': 'verb',
    'adv': 'adverb',
    'n/adj': 'noun/adjective',
    'v/adj': 'verb/adjective'
}

entries = []

with open(input_file, 'r', encoding='utf-8') as file:
    for line in file:
        if not line.strip():
            continue
        try:
            left, definition = line.strip().split('\t', 1)
            word_match = re.match(r'(.+?)\s*\(([^)]+)\)', left)
            if word_match:
                word = word_match.group(1).strip()
                pos_short = word_match.group(2).strip().lower()
                word_class = class_map.get(pos_short, pos_short)
                entries.append({
                    "word": word,
                    "class": word_class,
                    "definition": definition.strip()
                })
        except Exception as e:
            print(f"Error processing line: {line}\n{e}")

with open(output_file, 'w', encoding='utf-8') as out:
    json.dump(entries, out, indent=2, ensure_ascii=False)

print(f"✅ Converted {len(entries)} entries to JSON. Saved to {output_file}.")
