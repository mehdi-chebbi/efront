from flask import Flask, request, jsonify
from flask_cors import CORS
import cohere
import logging
import re
import os
import json
from typing import List, Dict, Optional

# --- Initialisation Flask & CORS ---
app = Flask(__name__)
CORS(app)

# --- Configuration du logger ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# --- Connexion à l'API Cohere ---
try:
    COHERE_API_KEY = os.getenv("COHERE_API_KEY", "2EOXEMW2uXH1UelILUxrQE0i2s6TzCLbt64wvfzc")
    co = cohere.Client(COHERE_API_KEY)
    logger.info("Connexion à l'API Cohere réussie.")
except Exception as e:
    logger.error(f"Erreur de connexion à Cohere : {e}")
    raise

# --- Chargement des données OSS ---
def load_oss_data(file_path: str = 'oss_clean_data.json') -> List[Dict]:
    if not os.path.exists(file_path):
        logger.error(f"Fichier introuvable : {file_path}")
        raise FileNotFoundError(f"Le fichier {file_path} est manquant.")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("Le fichier doit contenir une liste d'objets JSON.")
    for item in data:
        if not all(k in item for k in ['page', 'url', 'content']):
            raise ValueError("Chaque élément doit contenir 'page', 'url' et 'content'.")
    logger.info(f"{len(data)} pages OSS chargées depuis {file_path}")
    return data

# --- Initialisation des données OSS ---
try:
    OSS_DATA = load_oss_data()
    for page in OSS_DATA:
        num = page.get('page')
        if isinstance(num, int):
            if num == 1:
                page['keywords'] = ["présentation", "mission", "expertise", "pays membres", "observatoire"]
            elif num == 2:
                page['keywords'] = ["biodiversité", "copernicea", "écosystème", "nature"]
            elif num == 3:
                page['keywords'] = ["climat", "dressea", "adaptwap", "sécheresse", "météo"]
            elif num == 4:
                page['keywords'] = ["eau", "restore naw", "ittas", "smas", "ressources hydriques", "hydrique"]
        else:
            logger.warning(f"Page invalide détectée : {page}")
except Exception as e:
    logger.error(f"Erreur de chargement des données OSS : {e}")
    OSS_DATA = []

# --- Formatage de la réponse depuis les données OSS ---
def format_oss_response(page: Dict) -> str:
    content_data = page.get('content', '')
    if isinstance(content_data, str):
        content = content_data
    elif isinstance(content_data, list):
        all_texts = []
        for item in content_data:
            if isinstance(item, dict):
                c = item.get('content', '')
                if isinstance(c, list):
                    all_texts.extend(c)
                elif isinstance(c, str):
                    all_texts.append(c)
        content = ' '.join(all_texts)
    else:
        content = ''

    # Nettoyage des motifs indésirables
    unwanted_patterns = [
        r'(Détail du projet\s*)+',
        r'(Voir tous les projets\s*)+',
        r'(Lire la suite\s*)+',
        r"(Plus d'informations\s*)+"
    ]
    for pattern in unwanted_patterns:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE)

    # Découpage en phrases
    sentences = re.split(r'(?<=[.!?])\s+', content)
    if len(sentences) > 2:
        response_text = ' '.join(sentences[:3])
    else:
        response_text = content[:500]
        if len(content) > 500:
            last_space = response_text.rfind(' ')
            response_text = response_text[:last_space] + '...'
    response_text = re.sub(r'\s+', ' ', response_text).strip().replace(' .', '.')
    source_url = page.get('url', '')
    source = f"\n\n🔗 Source : {source_url}" if source_url else ""
    return f"{response_text}{source}"

# --- Recherche de la meilleure correspondance utilisateur ---
def find_best_match(user_input: str) -> Optional[str]:
    if not OSS_DATA:
        return None
    input_lower = user_input.lower()
    # Par mots-clés
    for page in OSS_DATA:
        keywords = page.get('keywords', [])
        if any(k.lower() in input_lower for k in keywords):
            return format_oss_response(page)
    # Par titre de page
    for page in OSS_DATA:
        url = page.get('url', '')
        page_title = url.split('/')[-1].replace('-', ' ').lower() if url else ''
        if page_title in input_lower:
            return format_oss_response(page)
    # Par correspondance de contenu
    best_match, highest_score = None, 0
    input_words = re.findall(r'\w+', input_lower)
    for page in OSS_DATA:
        content_lower = page.get('content', '').lower()
        score = sum(1 for word in input_words if word in content_lower)
        if score > highest_score:
            highest_score = score
            best_match = page
    if highest_score >= 2 and best_match:
        return format_oss_response(best_match)
    return None

# --- Génération d'une réponse avec Cohere ---
def generate_gpt_response(user_msg, context=None):
    try:
        response = co.chat(
            model="command-a-03-2025",  # latest valid model
            message=user_msg,
            max_tokens=200
        )
        return response.text
    except Exception as e:
        logger.error(f"[ERROR] Cohere: {e}")
        return "Erreur lors de la génération avec Cohere."

# --- Reformulation question ---
def reformulate_question(question: str) -> str:
    question = question.strip().rstrip('.').capitalize()
    if not question.endswith('.'):
        question += '.'
    return f"Si je comprends bien, vous souhaitez savoir : {question} "

# --- Choix de réponse OSS ou Cohere ---
def generate_response(user_input: str, context: List[str]) -> str:
    oss_response = find_best_match(user_input)
    reformulated = reformulate_question(user_input)
    if oss_response:
        logger.info("Réponse extraite depuis les données OSS.")
        return f"{reformulated}\n{oss_response}"
    logger.info("Aucune correspondance, utilisation de Cohere.")
    gpt_response = generate_gpt_response(user_input, context)
    return f"{reformulated}\n\n{gpt_response}"

# --- Endpoint de chat ---
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_input = data.get('message', '').strip()
        context = data.get('context', [])
        if not user_input:
            return jsonify({"response": "Votre message est vide. Pouvez-vous reformuler ?"}), 400
        logger.info(f"Message utilisateur reçu : {user_input}")
        if any(greet in user_input.lower() for greet in ["bonjour", "salut", "hello"]):
            response = "Bonjour ! Je suis l’assistant virtuel de l’OSS. Comment puis-je vous aider concernant nos activités ?"
        else:
            response = generate_response(user_input, context)
        new_context = (context + [user_input, response])[-6:]
        return jsonify({
            "response": response,
            "context": new_context
        })
    except Exception as e:
        logger.error(f"Erreur dans l'API /chat : {e}", exc_info=True)
        return jsonify({
            "response": "Une erreur technique est survenue. Veuillez réessayer plus tard.",
            "context": []
        }), 500

# --- Lancement du serveur ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
