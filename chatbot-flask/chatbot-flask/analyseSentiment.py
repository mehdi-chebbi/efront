from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# Charger le modèle de sentiment
sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

@app.route('/analyse_sentiment', methods=['POST'])
def analyse_sentiment():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({"error": "Texte manquant"}), 400

    text = data['text'].strip()
    if not text:
        return jsonify({"error": "Le texte ne peut pas être vide"}), 400

    try:
        result = sentiment_analyzer(text)
        sentiment_label = result[0]['label']  # e.g., "3 stars"
        score = result[0]['score']
        stars = int(sentiment_label[0])

        # Déterminer le type de sentiment
        if stars <= 2:
            sentiment_type = "Négatif"
        elif stars == 3:
            sentiment_type = "Neutre"
        else:
            sentiment_type = "Positif"

        # Construire une réponse textuelle lisible
        response_text = f"Sentiment: {sentiment_label} (Score: {score:.2f}) - {sentiment_type}"

        return jsonify({"result": response_text})

    except Exception as e:
        return jsonify({"error": "Erreur lors de l'analyse", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
