import json
from pathlib import Path

DATA_FILE = Path(__file__).parent / "bibliotheque.json"

# Données en mémoire (conteneurs)
bibliotheque = {
    "categories": [],  # {id_cat, nom_cat, champ}
    "auteurs": [],     # {id_auteur, nom_auteur, prenom_auteur}
    "livres": []       # {id_livre, isbn, titre, quantite, cat_id, auteur_ids:[...]}
}

def _next_id(items: list[dict], key: str) -> int:
    if not items:
        return 1
    return max(item.get(key, 0) for item in items) + 1

def load_data() -> None:
    if DATA_FILE.exists():
        bibliotheque.update(json.loads(DATA_FILE.read_text(encoding="utf-8")))

def save_data() -> None:
    DATA_FILE.write_text(json.dumps(bibliotheque, ensure_ascii=False, indent=2), encoding="utf-8")

def next_cat_id() -> int:
    return _next_id(bibliotheque["categories"], "id_cat")

def next_auteur_id() -> int:
    return _next_id(bibliotheque["auteurs"], "id_auteur")

def next_livre_id() -> int:
    return _next_id(bibliotheque["livres"], "id_livre")
