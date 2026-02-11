from cli.data_store import bibliotheque, next_livre_id, save_data
from .utils import input_non_vide, input_int
from .categories import categorie_existe
from .auteurs import auteurs_existent

def _find_livre_by_id(livre_id: int):
    for l in bibliotheque["livres"]:
        if l["id_livre"] == livre_id:
            return l
    return None

def _isbn_unique(isbn: str, ignore_id: int | None = None) -> bool:
    for l in bibliotheque["livres"]:
        if l["isbn"] == isbn and (ignore_id is None or l["id_livre"] != ignore_id):
            return False
    return True

def ajouter_livre() -> None:
    isbn = input_non_vide("ISBN : ")
    if not _isbn_unique(isbn):
        print("❌ ISBN déjà utilisé.")
        return

    titre = input_non_vide("Titre : ")
    quantite = input_int("Quantité : ", default=0)

    cat_id = input_int("ID Catégorie (ex: 1) : ")
    if not categorie_existe(cat_id):
        print("❌ Catégorie introuvable.")
        return

    raw_ids = input_non_vide("IDs Auteurs (ex: 1,2) : ")
    auteur_ids = [int(x.strip()) for x in raw_ids.split(",") if x.strip().isdigit()]

    if not auteur_ids:
        print("❌ Aucun auteur valide.")
        return
    if not auteurs_existent(auteur_ids):
        print("❌ Un ou plusieurs auteurs n'existent pas.")
        return

    livre = {
        "id_livre": next_livre_id(),
        "isbn": isbn,
        "titre": titre,
        "quantite": quantite,
        "cat_id": cat_id,
        "auteur_ids": auteur_ids
    }
    bibliotheque["livres"].append(livre)
    save_data()
    print(f"✅ Livre ajouté: #{livre['id_livre']} — {livre['titre']}")

def lister_livres() -> None:
    livres = bibliotheque["livres"]
    if not livres:
        print("📭 Aucun livre.")
        return
    print("\n--- Livres ---")
    for l in livres:
        print(f"#{l['id_livre']} — {l['titre']} | ISBN: {l['isbn']} | Qté: {l['quantite']} | Cat: {l['cat_id']} | Auteurs: {l['auteur_ids']}")

def rechercher_livre() -> None:
    terme = input_non_vide("Terme (titre ou ISBN) : ").lower()
    results = [l for l in bibliotheque["livres"] if terme in l["titre"].lower() or terme in l["isbn"].lower()]
    if not results:
        print("❌ Aucun résultat.")
        return
    print("\n--- Résultats ---")
    for l in results:
        print(f"#{l['id_livre']} — {l['titre']} (ISBN: {l['isbn']})")

def supprimer_livre() -> None:
    livre_id = input_int("ID du livre à supprimer : ")
    livre = _find_livre_by_id(livre_id)
    if not livre:
        print("❌ Livre introuvable.")
        return
    bibliotheque["livres"].remove(livre)
    save_data()
    print(f"🗑️ Livre supprimé: #{livre_id}")

def modifier_livre() -> None:
    livre_id = input_int("ID du livre à modifier : ")
    livre = _find_livre_by_id(livre_id)
    if not livre:
        print("❌ Livre introuvable.")
        return

    print("Laisse vide pour garder la valeur actuelle.")
    new_isbn = input(f"ISBN [{livre['isbn']}] : ").strip() or livre["isbn"]
    if not _isbn_unique(new_isbn, ignore_id=livre_id):
        print("❌ ISBN déjà utilisé.")
        return

    new_titre = input(f"Titre [{livre['titre']}] : ").strip() or livre["titre"]
    new_qte_raw = input(f"Quantité [{livre['quantite']}] : ").strip()
    new_qte = livre["quantite"] if new_qte_raw == "" else int(new_qte_raw)

    new_cat_raw = input(f"ID Catégorie [{livre['cat_id']}] : ").strip()
    new_cat_id = livre["cat_id"] if new_cat_raw == "" else int(new_cat_raw)
    if not categorie_existe(new_cat_id):
        print("❌ Catégorie introuvable.")
        return

    new_auteurs_raw = input(f"IDs Auteurs [{','.join(map(str, livre['auteur_ids']))}] : ").strip()
    if new_auteurs_raw == "":
        new_auteur_ids = livre["auteur_ids"]
    else:
        new_auteur_ids = [int(x.strip()) for x in new_auteurs_raw.split(",") if x.strip().isdigit()]
        if not new_auteur_ids or not auteurs_existent(new_auteur_ids):
            print("❌ IDs auteurs invalides.")
            return

    livre.update({
        "isbn": new_isbn,
        "titre": new_titre,
        "quantite": new_qte,
        "cat_id": new_cat_id,
        "auteur_ids": new_auteur_ids
    })
    save_data()
    print(f"✅ Livre mis à jour: #{livre_id}")
