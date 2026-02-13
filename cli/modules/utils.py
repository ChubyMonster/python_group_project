def input_non_vide(message: str) -> str:
    while True:
        val = input(message).strip()
        if val:
            return val
        print("⚠️ Champ obligatoire. Réessaie.")


def input_int(message: str, default: int | None = None) -> int:
    while True:
        raw = input(message).strip()
        if raw == "" and default is not None:
            return default
        try:
            return int(raw)
        except ValueError:
            print("⚠️ Entre un nombre entier valide.")
