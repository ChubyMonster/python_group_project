from __future__ import annotations

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from app import db
from app.models import Livre, Categorie, Auteur

bp = Blueprint("rabia_api", __name__)

def error(message: str, status: int = 400):
    return jsonify({"error": message}), status

def get_json():
    payload = request.get_json(silent=True)
    return payload if isinstance(payload, dict) else None

@bp.get("/categories")
def list_categories():
    cats = Categorie.query.order_by(Categorie.nom_cat.asc()).all()
    return jsonify({"count": len(cats), "categories": [c.to_dict() for c in cats]})

@bp.post("/categories")
def create_category():
    payload = get_json()
    if not payload:
        return error("JSON body required.")
    nom_cat = (payload.get("nom_cat") or "").strip()
    champ = (payload.get("champ") or "").strip() or None
    if not nom_cat:
        return error("Field 'nom_cat' is required.")
    cat = Categorie(nom_cat=nom_cat, champ=champ)
    db.session.add(cat)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error("Category name already exists.", 409)
    return jsonify(cat.to_dict()), 201

@bp.get("/auteurs")
def list_authors():
    auteurs = Auteur.query.order_by(Auteur.nom_auteur.asc()).all()
    return jsonify({"count": len(auteurs), "auteurs": [a.to_dict() for a in auteurs]})

@bp.post("/auteurs")
def create_author():
    payload = get_json()
    if not payload:
        return error("JSON body required.")
    nom = (payload.get("nom_auteur") or "").strip()
    prenom = (payload.get("prenom_auteur") or "").strip() or None
    if not nom:
        return error("Field 'nom_auteur' is required.")
    a = Auteur(nom_auteur=nom, prenom_auteur=prenom)
    db.session.add(a)
    db.session.commit()
    return jsonify(a.to_dict()), 201

@bp.get("/livres")
def list_books():
    livres = Livre.query.order_by(Livre.id_livre.desc()).all()
    return jsonify({"count": len(livres), "livres": [l.to_dict() for l in livres]})

@bp.get("/livres/search")
def search_books():
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"count": 0, "livres": []})
    livres = Livre.query.filter(Livre.titre.ilike(f"%{q}%")).all()
    return jsonify({"count": len(livres), "livres": [l.to_dict() for l in livres]})

@bp.post("/livres")
def create_book():
    payload = get_json()
    if not payload:
        return error("JSON body required.")

    isbn = (payload.get("isbn") or "").strip()
    titre = (payload.get("titre") or "").strip()
    quantite = payload.get("quantite", 0)
    cat_id = payload.get("cat_id")
    auteur_ids = payload.get("auteur_ids", [])

    if not isbn or not titre or cat_id is None:
        return error("Fields required: 'isbn', 'titre', 'cat_id'.")

    if not isinstance(quantite, int) or quantite < 0:
        return error("'quantite' must be a non-negative integer.")

    categorie = Categorie.query.get(cat_id)
    if not categorie:
        return error("Category not found (cat_id).", 404)

    if auteur_ids and not isinstance(auteur_ids, list):
        return error("'auteur_ids' must be a list of integers.")

    auteurs = []
    if auteur_ids:
        auteurs = Auteur.query.filter(Auteur.id_auteur.in_(auteur_ids)).all()
        if len(auteurs) != len(set(auteur_ids)):
            return error("One or more authors not found.", 404)

    livre = Livre(isbn=isbn, titre=titre, quantite=quantite, categorie=categorie)
    livre.auteurs = auteurs

    db.session.add(livre)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error("ISBN already exists.", 409)

    return jsonify(livre.to_dict()), 201

@bp.delete("/livres/<int:id_livre>")
def delete_book(id_livre: int):
    livre = Livre.query.get(id_livre)
    if not livre:
        return error("Livre not found.", 404)
    db.session.delete(livre)
    db.session.commit()
    return jsonify({"deleted": True, "id_livre": id_livre})

@bp.put("/livres/<int:id_livre>")
def update_book(id_livre: int):
    livre = Livre.query.get(id_livre)
    if not livre:
        return error("Livre not found.", 404)

    payload = get_json()
    if not payload:
        return error("JSON body required.")


    if "isbn" in payload:
        isbn = (payload.get("isbn") or "").strip()
        if not isbn:
            return error("'isbn' cannot be empty.")
        livre.isbn = isbn

    if "titre" in payload:
        titre = (payload.get("titre") or "").strip()
        if not titre:
            return error("'titre' cannot be empty.")
        livre.titre = titre

    if "quantite" in payload:
        qte = payload.get("quantite")
        if not isinstance(qte, int) or qte < 0:
            return error("'quantite' must be a non-negative integer.")
        livre.quantite = qte

    if "cat_id" in payload:
        cat_id = payload.get("cat_id")
        categorie = Categorie.query.get(cat_id)
        if not categorie:
            return error("Category not found (cat_id).", 404)
        livre.categorie = categorie

    if "auteur_ids" in payload:
        auteur_ids = payload.get("auteur_ids") or []
        if not isinstance(auteur_ids, list):
            return error("'auteur_ids' must be a list of integers.")
        auteurs = Auteur.query.filter(Auteur.id_auteur.in_(auteur_ids)).all() if auteur_ids else []
        if auteur_ids and len(auteurs) != len(set(auteur_ids)):
            return error("One or more authors not found.", 404)
        livre.auteurs = auteurs

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error("ISBN already exists.", 409)

    return jsonify(livre.to_dict())
