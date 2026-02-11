from cli.data_store import load_data
from cli.modules.categories import ajouter_categorie, lister_categories
from cli.modules.auteurs import ajouter_auteur, lister_auteurs
from cli.modules.livres import ajouter_livre, lister_livres, rechercher_livre, supprimer_livre, modifier_livre

def menu():
    print("\n" + "="*46)
    print("   📚 Gestion de Bibliothèque (CLI modulaire)")
    print("="*46)
    print("1. Ajouter une catégorie")
    print("2. Lister les catégories")
    print("3. Ajouter un auteur")
    print("4. Lister les auteurs")
    print("5. Ajouter un livre")
    print("6. Lister les livres")
    print("7. Rechercher un livre")
    print("8. Modifier un livre")
    print("9. Supprimer un livre")
    print("0. Quitter")

def main():
    load_data()
    while True:
        menu()
        choix = input("Votre choix : ").strip()

        if choix == "1": ajouter_categorie()
        elif choix == "2": lister_categories()
        elif choix == "3": ajouter_auteur()
        elif choix == "4": lister_auteurs()
        elif choix == "5": ajouter_livre()
        elif choix == "6": lister_livres()
        elif choix == "7": rechercher_livre()
        elif choix == "8": modifier_livre()
        elif choix == "9": supprimer_livre()
        elif choix == "0":
            print("👋 Au revoir !")
            break
        else:
            print("⚠️ Choix invalide.")

if __name__ == "__main__":
    main()
