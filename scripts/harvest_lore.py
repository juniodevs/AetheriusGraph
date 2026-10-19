import json
import urllib.request
import urllib.parse
import re
import time

def strip_wiki_files_and_templates(text):
    if not text:
        return ""
    while True:
        m = re.search(r'\{\{[^{}]*\}\}', text)
        if m:
            text = text[:m.start()] + text[m.end():]
        else:
            break
            
    while True:
        m = re.search(r'\[\[(?:File|Image):[^\[\]]*(?:\[\[[^\[\]]*\]\][^\[\]]*)*\]\]', text, flags=re.IGNORECASE)
        if m:
            text = text[:m.start()] + text[m.end():]
        else:
            break

    text = re.sub(r'__[A-Z]+__', '', text)
    
    text = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]', r'\1', text)
    text = re.sub(r"'{2,5}", '', text)
    text = re.sub(r'<ref[^>]*>.*?</ref>', '', text, flags=re.DOTALL)
    text = re.sub(r'<ref[^>]*/>', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    cleaned = []
    for l in lines:
        if l.startswith('=') or l.startswith(';') or l.startswith('*') or l.startswith('#') or l.startswith('|'):
            continue
        if l.startswith('!') or l.endswith('|'):
            continue
        cleaned.append(l)
        if len(' '.join(cleaned)) > 350:
            break
            
    res = ' '.join(cleaned).strip()
    res = re.sub(r'\s+', ' ', res)
    return res

with open('src/data/tes_lore_graph.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

nodes = data['nodes']
node_by_id = {n['id']: n for n in nodes}

CANONICAL_OVERRIDES = {
    'miraak': 'Skyrim:Miraak (person)',
    'dawnguard_faction': 'Skyrim:Dawnguard (faction)',
    'the_blades': 'Lore:Blades',
    'the_night_mother': 'Skyrim:Night Mother',
    'volkihar_clan': 'Lore:Volkihar',
    'wylandrah': 'Skyrim:Wylandriah',
    'jarl_idgrod_ravencrone': 'Skyrim:Idgrod Ravencrone',
    'jarl_dengeir_of_stuhn': 'Skyrim:Dengeir of Stuhn',
    'jarl_siddgeir': 'Skyrim:Siddgeir',
    'jarl_skald_the_elder': 'Skyrim:Skald',
    'jarl_igmund': 'Skyrim:Igmund',
    'jarl_laila_law-giver': 'Skyrim:Laila Law-Giver',
    'sovngarde': 'Lore:Sovngarde',
    'atmora': 'Lore:Atmora',
    'companions': 'Lore:Companions',
    'thieves_guild': 'Lore:Thieves Guild',
    'dark_brotherhood': 'Lore:Dark Brotherhood',
    'college_of_winterhold': 'Lore:College of Winterhold',
    'wabbajack': 'Skyrim:Wabbajack',
    'staff_of_magnus': 'Skyrim:Staff of Magnus',
    'auriels_shield': "Skyrim:Auriel's Shield",
}

for nid, override_title in CANONICAL_OVERRIDES.items():
    if nid in node_by_id:
        node_by_id[nid]['title'] = override_title

PORTRAIT_OVERRIDES = {
    'miraak': 'https://images.uesp.net/b/b9/SR-npc-Miraak_02.jpg',
    'paarthurnax': 'https://images.uesp.net/1/1f/SR-creature-Paarthurnax.jpg',
    'durnehviir': 'https://images.uesp.net/3/37/SR-creature-Durnehviir.jpg',
    'wabbajack': 'https://images.uesp.net/e/e5/SR-item-Wabbajack.jpg',
    'staff_of_magnus': 'https://images.uesp.net/8/8a/SR-item-Staff_of_Magnus.jpg',
    'auriels_shield': 'https://images.uesp.net/d/da/SR-item-Auriel%27s_Shield.jpg',
    'mara': 'https://images.uesp.net/1/14/BL-misc-Mara.png',
    'atmora': 'https://images.uesp.net/4/4b/GEN-misc-King_of_Atmora.jpg',
    'volkihar_clan': 'https://images.uesp.net/a/ae/LG-cardart-Volkihar_Lord.png',
    'the_blades': 'https://images.uesp.net/f/f3/SR-place-Sky_Haven_Temple_Exterior.jpg',
    'the_night_mother': 'https://images.uesp.net/6/65/SR-npc-Night_Mother.jpg',
    'companions': 'https://images.uesp.net/f/f5/SR-place-Jorrvaskr.jpg',
    'thieves_guild': 'https://images.uesp.net/6/63/SR-quest-Darkness_Returns.jpg',
    'dark_brotherhood': 'https://images.uesp.net/e/ea/OB-banner-Dark_Brotherhood.jpg',
    'college_of_winterhold': 'https://images.uesp.net/7/78/SR-place-College_of_Winterhold_02.jpg',
    'dawnguard_faction': 'https://images.uesp.net/0/00/SR-cover-Dawnguard_Box_Art.jpg',
}

for nid, img_url in PORTRAIT_OVERRIDES.items():
    if nid in node_by_id:
        node_by_id[nid]['image'] = img_url

API_URL = "https://en.uesp.net/w/api.php"
headers = {'User-Agent': 'AetheriusMasterHarvester/2.0 (pair programming task)'}

name_to_node = {}
for n in nodes:
    nid = n['id']
    name_to_node[n['name'].lower()] = nid
    clean_name = re.sub(r'\s*\([^)]*\)', '', n['name']).strip().lower()
    name_to_node[clean_name] = nid
    t_clean = n['title'].split(':')[-1].strip().lower()
    name_to_node[t_clean] = nid

existing_edges = set()
for e in data['edges']:
    pair = tuple(sorted([e['source'], e['target']]))
    existing_edges.add(pair)

batch_size = 20
total_batches = (len(nodes) + batch_size - 1) // batch_size

updated_summaries = 0
mined_edges = 0

print(f"Starting deep harvesting for {len(nodes)} nodes across {total_batches} batches...")

for b_idx in range(total_batches):
    batch = nodes[b_idx*batch_size : (b_idx+1)*batch_size]
    titles = [n['title'] for n in batch]
    params = {
        'action': 'query',
        'titles': '|'.join(titles),
        'prop': 'revisions|pageimages',
        'rvprop': 'content',
        'rvslots': 'main',
        'piprop': 'original',
        'format': 'json'
    }
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            pages = res_data.get('query', {}).get('pages', {})
            
            for pid, pdata in pages.items():
                p_title = pdata.get('title', '')
                rev = pdata.get('revisions', [{}])[0].get('slots', {}).get('main', {}).get('*', '')
                img_url = pdata.get('original', {}).get('source', '')
                
                matched_node = None
                for n in batch:
                    if n['title'].lower() == p_title.lower() or n['title'].replace('_', ' ').lower() == p_title.lower():
                        matched_node = n
                        break
                if not matched_node:
                    continue
                
                clean_summary = strip_wiki_files_and_templates(rev)
                if clean_summary and len(clean_summary) >= 80:
                    matched_node['summary'] = clean_summary
                    updated_summaries += 1
                
                if not matched_node.get('image') and img_url:
                    matched_node['image'] = img_url
                    
                links = re.findall(r'\[\[(?:Skyrim:|Lore:)?([^|\]#]+)(?:\|[^\]]+)?\]\]', rev)
                for l in links:
                    target_key = l.strip().lower()
                    if target_key in name_to_node:
                        tgt_id = name_to_node[target_key]
                        if tgt_id != matched_node['id']:
                            pair = tuple(sorted([matched_node['id'], tgt_id]))
                            if pair not in existing_edges:
                                existing_edges.add(pair)
                                data['edges'].append({
                                    'source': matched_node['id'],
                                    'target': tgt_id,
                                    'relation': 'canonical_mention',
                                    'label': 'Chronicler Lore Link',
                                    'is_cross_realm': False
                                })
                                mined_edges += 1
                                
        print(f"Batch {b_idx+1}/{total_batches} processed successfully.")
        time.sleep(0.3)
    except Exception as e:
        print(f"Error on batch {b_idx+1}: {e}")

print(f"\nHarvesting complete!")
print(f"Updated summaries: {updated_summaries}")
print(f"Mined new canonical edges from wikitext: {mined_edges}")

miraak_pillars = [
    ('miraak', 'hermaeus_mora', 'master_and_rebel', 'Master and Rebellious Servant'),
    ('miraak', 'ahzidal', 'dragon_priest_order', 'Ancient Dragon Priest Order'),
    ('miraak', 'alduin', 'merethic_rivalry', 'Rival Ruler of Dragon Cult'),
    ('miraak', 'solstheim', 'island_domain', 'Ruler of Ancient Solstheim'),
    ('miraak', 'apocrypha', 'daedric_imprisonment', 'Imprisoned in Apocrypha for Millennia'),
    ('miraak', 'paarthurnax', 'thu_um_lineage', 'First Dragonborn to Wield Thu\'um'),
    ('miraak', 'high_hrothgar', 'way_of_the_voice', 'Ancient Dragonborn Lore'),
    ('miraak', 'sovngarde', 'dragon_war_myth', 'Merethic Dragon War Era'),
    ('miraak', 'oghma_infinium', 'black_books', 'Power of the Black Books'),
    ('miraak', 'elder_scrolls', 'dragonborn_prophecy', 'Prophecy of the First & Last')
]

for src, tgt, rel, label in miraak_pillars:
    if src in node_by_id and tgt in node_by_id:
        pair = tuple(sorted([src, tgt]))
        if pair not in existing_edges:
            existing_edges.add(pair)
            data['edges'].append({
                'source': src,
                'target': tgt,
                'relation': rel,
                'label': label,
                'is_cross_realm': False
            })

data['metadata']['total_nodes'] = len(data['nodes'])
data['metadata']['total_edges'] = len(data['edges'])

with open('src/data/tes_lore_graph.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Final stats saved: {len(data['nodes'])} nodes, {len(data['edges'])} edges.")
