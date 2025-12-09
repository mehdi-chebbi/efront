import requests
from bs4 import BeautifulSoup
import json
import re
from unicodedata import normalize

urls = [
    'https://www.oss-online.org/fr/a-propos-oss',
    'https://www.oss-online.org/fr/axe-biodiversite',
    'https://www.oss-online.org/fr/axe-climat',
    'https://www.oss-online.org/fr/axe-eau',
    'https://www.oss-online.org/fr/axe-terre',
    'https://www.oss-online.org/index.php/fr/activit%C3%A9s',
    'https://www.oss-online.org/index.php/fr/actualites',
    'https://www.oss-online.org/fr/comite-de-direction',
    'https://www.oss-online.org/fr/membres-et-partenaires',
    'https://www.oss-online.org/index.php/fr/gouvernance',
    'https://www.oss-online.org/index.php/fr/Politiques-Procedures',
]

def clean_text(text):
    text = normalize("NFKC", text)
    text = re.sub(r'[^\w\s.,;:!?\'"-]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\s([.,;:!?])', r'\1', text)
    return text.strip()

def grouper_par_tiers(liste, n=3):
    """Regroupe les éléments de la liste par groupes de n concaténés en une seule chaîne."""
    return [' '.join(liste[i:i+n]) for i in range(0, len(liste), n)]

def scrape_page(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"❌ Échec pour {url}")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')

    for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'iframe', 'img']):
        tag.decompose()

    main_content = soup.find('main') or soup.body
    if not main_content:
        return []

    sections = []
    current_section = {"title": "Introduction", "content": []}

    for elem in main_content.descendants:
        if elem.name in ['h1', 'h2', 'h3']:
            if current_section["content"]:
                # Regrouper contenu par tiers avant d'ajouter la section
                current_section["content"] = grouper_par_tiers(current_section["content"], 3)
                sections.append(current_section)
            current_section = {"title": clean_text(elem.get_text()), "content": []}

        elif elem.name == 'p':
            text = clean_text(elem.get_text())
            if text:
                current_section["content"].append(f"- {text}")

        elif elem.name in ['ul', 'ol']:
            for li in elem.find_all('li'):
                li_text = clean_text(li.get_text())
                if li_text:
                    current_section["content"].append(f"- {li_text}")

    if current_section["content"]:
        current_section["content"] = grouper_par_tiers(current_section["content"], 3)
        sections.append(current_section)

    return sections

oss_data = []

for i, url in enumerate(urls, start=1):
    print(f"\n📄 Scraping de la page {i}: {url}")
    page_sections = scrape_page(url)
    oss_data.append({
        "page": i,
        "url": url,
        "content": page_sections
    })

with open("oss_structured_data.json", "w", encoding="utf-8") as f:
    json.dump(oss_data, f, ensure_ascii=False, indent=2)

print("\n✅ Les données structurées ont été enregistrées dans 'oss_structured_data.json'.")
