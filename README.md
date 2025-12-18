# Projet Web 2 : Covid-19

## 👥 Auteurs
* **Mathieu Le Du**
* **Luca Fiadino** 
* **Raphaël Chelly**
* **Arthur Du Fontenioux**
* **Edgar Caillaud**

## 🕒 Répartition du travail
||Mardi|Mercredi|Jeudi|
|:-:|:-:|:-:|:-:|
|Mathieu|Problématique + Sous-questions|Scrapping|Scrapping|
|Luca|Template du site|CSS + JS du site|Graphes + sliders / buttons|
|Raphaël|Problématique + Sous-question|Nettoyage des données  + Graphes|Graphes + Présentation|
|Arthur|Problématique + Sous-questions|Nettoyage des données + Graphes|Graphes|
|Edgar|Problématique + Sous-questions|Graphes|Graphes|

## 💻 Languages
- JavaScript - 40.4%

- Python - 26.1%
 
- HTML - 20.6%
 
- CSS - 12.9%

## 📂 Organisation des fichiers

```text

├── js_files/                # Scripts JavaScript pour la visualisation des données
│   ├── Chart1_1.js          # Logique pour le graphique 1.1
│   ├── Chart1_2.js          # Logique pour le graphique 1.2
│   ├── Chart2_1.js
│   ├── Chart2_2.js
│   ├── Chart2_3.js
│   ├── Chart3_1.js
│   ├── Chart3_2.js
│   ├── Chart3_3.js
│   └── Popup.js             # Gestion des graphes zoomés (popups)
│
├── json_files/              # Données pour les graphes générées par get_json.py
│   ├── age.json
│   ├── age_with_sex.json
│   ├── sex.json
│   ├── chart1_1.json
│   ├── chart1_2_jour.json
│   ├── chart1_2_mois.json
│   └── [chartX_Y.json]      # Autres fichiers de données pour les graphes
│
├── .gitignore
├── get_json.py              # Récupère, nettoie les datasets et génère les json
├── load_mmc1.py             # Scrapping pour le 3ème dataset (age_with_sex)
├── mmc1.xlsx                # Fichier de secours en cas d'échec de load_mmc1.py
├── Page_1.html              # Fichier HTML du site web
├── README.md                # Documentation du projet
└── style.css                # Fichier CSS du site web
```



### ℹ️ Convention de nommage des fichiers
Les fichiers de graphiques (`js` et `json`) suivent le format **`ChartX_Y`** où :
* **X** correspond au numéro de la **page** du site.
* **Y** correspond au numéro du **graphique** sur cette page.

> *Exemple : `Chart2_3.js` est le **3ème graphique** de la **Page 2**.*

### Informations complémentaires
- Le fichier **mmc1.xlsx** sert de solution de secours au cas où la fonction de scrapping retournerait une erreur à cause de l'environnement ou du mauvais navigateur.