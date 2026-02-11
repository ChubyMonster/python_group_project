from __future__ import annotations
from app import db

class Categorie(db.Model):
    __tablename__ = "categorie"

    id_cat = db.Column(db.Integer, primary_key=True)
    nom_cat = db.Column(db.String(120), nullable=False, unique=True)
    champ = db.Column(db.String(120), nullable=True)

    livres = db.relationship("Livre", back_populates="categorie", cascade="all, delete-orphan")

    def to_dict(self):
        return {"id_cat": self.id_cat, "nom_cat": self.nom_cat, "champ": self.champ}
