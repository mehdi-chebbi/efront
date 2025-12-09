from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from joblib import load
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import string
import re
import os

# Téléchargement des ressources NLTK
nltk.download('stopwords')
nltk.download('wordnet')

app = Flask(__name__)

# Configuration CORS pour Angular
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:4200"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configuration
MODEL_PATH = 'classifier.pkl'

# Vérification de l'existence du modèle
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Le fichier modèle {MODEL_PATH} n'existe pas. "
        "Veuillez d'abord exécuter train_model.py pour créer le modèle."
    )

# Chargement du modèle
try:
    model = load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Erreur lors du chargement du modèle: {str(e)}")

# Prétraitement du texte
def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    
    # Convertir en minuscules
    text = text.lower()
    # Supprimer la ponctuation
    text = re.sub(f'[{re.escape(string.punctuation)}]', '', text)
    # Supprimer les nombres
    text = re.sub(r'\d+', '', text)
    # Tokenization
    tokens = text.split()
    # Supprimer les stopwords
    stop_words = set(stopwords.words('french'))
    tokens = [word for word in tokens if word not in stop_words]
    # Lemmatisation
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    # Reconstruire le texte
    return ' '.join(tokens)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        comment = request.form.get('comment', '').strip()
        if comment:
            try:
                # Prétraitement
                processed_comment = preprocess_text(comment)
                # Prédiction
                prediction = model.predict([processed_comment])[0]
                # Probabilité
                proba = model.predict_proba([processed_comment])[0]
                
                # Interprétation
                sentiment = "Positif" if prediction == 1 else "Négatif"
                confidence = max(proba) * 100
                
                return render_template('index1.html', 
                                    comment=comment,
                                    sentiment=sentiment,
                                    confidence=f"{confidence:.2f}%")
            except Exception as e:
                return render_template('index1.html', 
                                    comment=comment,
                                    error="Une erreur est survenue lors de l'analyse.")
    
    return render_template('index1.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_api():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
        
    data = request.get_json()
    comment = data.get('comment', '').strip()
    
    if not comment:
        return jsonify({'error': 'No comment provided'}), 400
    
    try:
        processed_comment = preprocess_text(comment)
        prediction = model.predict([processed_comment])[0]
        proba = model.predict_proba([processed_comment])[0]
        
        return jsonify({
            'comment': comment,
            'sentiment': "positive" if prediction == 1 else "negative",
            'confidence': round(max(proba) * 100, 2),
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)