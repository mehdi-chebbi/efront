import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from joblib import dump
import os

# Création d'un dataset plus complet en français
data = {
    'texte': [
        "j'adore ce produit, il est fantastique", 
        "c'est vraiment génial, je le recommande", 
        "je déteste ça, c'est horrible", 
        "très mauvais produit, à éviter",
        "super qualité, je suis très satisfait",
        "pas bon du tout, déçu",
        "excellent service client, rapide et efficace",
        "livraison rapide et soignée",
        "je ne recommande pas ce produit",
        "trop cher pour la qualité offerte",
        "incroyable, j'en suis ravi",
        "je suis très content de mon achat",
        "déception totale, ne correspond pas à mes attentes",
        "je regrette cet achat",
        "prix raisonnable pour une bonne qualité",
        "fonctionne parfaitement, rien à redire",
        "je suis agréablement surpris",
        "mauvaise expérience avec ce vendeur",
        "produit conforme à la description",
        "la qualité laisse à désirer"
    ],
    'sentiment': [1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0]  # 1=positif, 0=négatif
}

df = pd.DataFrame(data)

# Séparation en données d'entraînement et de test
X_train, X_test, y_train, y_test = train_test_split(
    df['texte'], df['sentiment'], test_size=0.2, random_state=42
)

# Création et entraînement du modèle
model = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', MultinomialNB()),
])

model.fit(X_train, y_train)

# Évaluation du modèle
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Sauvegarde du modèle
try:
    dump(model, 'classifier.pkl')
    print("\nModèle entraîné et sauvegardé avec succès dans classifier.pkl!")
except Exception as e:
    print(f"\nErreur lors de la sauvegarde du modèle: {str(e)}")