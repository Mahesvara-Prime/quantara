# PDF → cours Quantara

1. **Droits** : place ici uniquement des documents dont tu détiens les droits de réutilisation / reformulation (ouvrages dont tu es l’auteur, supports libres de droits, etc.).
2. Copie tes fichiers **`.pdf`** dans ce dossier (`source_pdfs/`), ou dans les dossiers à la racine du dépôt : **`Trading/`**, **`Cryptomonnaies/`**, **`Blockchain/`**, **`Investissement/`** — le script d’import les parcourt tous.
3. Depuis le dossier `backend` :

```bash
pip install -r requirements.txt
python -m scripts.education_corpus.import_pdfs
python -m scripts.seed_education
```

Le script découpe chaque PDF en **leçons d’au moins 10 000 mots** (flux de tokens). Un fichier `markdown/imported__<nom>.md` et une entrée dans `markdown/imported_manifest.json` sont créés par PDF.

**Éditorialisation** : le texte extrait est brut (mise en page, colonnes, notes de bas de page peuvent être imparfaites). Prévois une relecture et une **reformulation** dans le Markdown généré ; le champ `allow_padding` est à `false` pour ces cours afin d’éviter le remplissage automatique — si une partie reste sous le seuil, le seed échouera avec un message explicite.
