from cli.data_store import bibliotheque, next_auteur_id, save_data
from .utils import input_non_vide

def ajouter_auteur() -> None:
    nom = input_non_vide("Nom auteur : ")
    prenom = input("Prénom (optionnel) : ").strip()

    auteur = {"id_auteur": next_auteur_id(), "nom_auteur": nom, "prenom_auteur": prenom}
    bibliotheque["auteurs"].append(auteur)
    save_data()
    full = f"{nom} {prenom}".strip()
    print(f"✅ Auteur ajouté: #{auteur['id_auteur']} — {full}")

def lister_auteurs() -> None:
    auteurs = bibliotheque["auteurs"]
    if not auteurs:
        print("📭 Aucun auteur.")
        return
    print("\n--- Auteurs ---")
    for a in auteurs:
        full = f"{a['nom_auteur']} {a.get('prenom_auteur','')}".strip()
        print(f"#{a['id_auteur']} — {full}")

def auteurs_existent(ids: list[int]) -> bool:
    exist = {a["id_auteur"] for a in bibliotheque["auteurs"]}
    return all(i in exist for i in ids)
