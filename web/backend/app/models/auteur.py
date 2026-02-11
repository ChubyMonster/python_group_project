from __future__ import annotations
from app import db

class Auteur(db.Model):
    __tablename__ = "auteur"

    id_auteur = db.Column(db.Integer, primary_key=True)
    nom_auteur = db.Column(db.String(120), nullable=False)
    prenom_auteur = db.Column(db.String(120), nullable=True)

    livres = db.relationship("Livre", secondary="livre_auteur", back_populates="auteurs")

    def to_dict(self):
        return {"id_auteur": self.id_auteur, "nom_auteur": self.nom_auteur, "prenom_auteur": self.prenom_auteur}
