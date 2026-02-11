from cli.data_store import bibliotheque, next_cat_id, save_data
from .utils import input_non_vide

def ajouter_categorie() -> None:
    nom = input_non_vide("Nom catégorie : ")
    champ = input("Champ (optionnel) : ").strip()

    cat = {"id_cat": next_cat_id(), "nom_cat": nom, "champ": champ}
    bibliotheque["categories"].append(cat)
    save_data()
    print(f"✅ Catégorie ajoutée: #{cat['id_cat']} — {cat['nom_cat']}")

def lister_categories() -> None:
    cats = bibliotheque["categories"]
    if not cats:
        print("📭 Aucune catégorie.")
        return
    print("\n--- Catégories ---")
    for c in cats:
        extra = f" • {c['champ']}" if c.get("champ") else ""
        print(f"#{c['id_cat']} — {c['nom_cat']}{extra}")

def categorie_existe(cat_id: int) -> bool:
    return any(c["id_cat"] == cat_id for c in bibliotheque["categories"])
