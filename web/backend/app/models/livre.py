from __future__ import annotations
from app import db

livre_auteur = db.Table(
    "livre_auteur",
    db.Column("livre_id", db.Integer, db.ForeignKey("livre.id_livre", ondelete="CASCADE"), primary_key=True),
    db.Column("auteur_id", db.Integer, db.ForeignKey("auteur.id_auteur", ondelete="CASCADE"), primary_key=True),
)

class Livre(db.Model):
    __tablename__ = "livre"

    id_livre = db.Column(db.Integer, primary_key=True)
    isbn = db.Column(db.String(40), nullable=False, unique=True)
    titre = db.Column(db.String(200), nullable=False)
    quantite = db.Column(db.Integer, nullable=False, default=0)

    cat_id = db.Column(db.Integer, db.ForeignKey("categorie.id_cat"), nullable=False)

    categorie = db.relationship("Categorie", back_populates="livres")
    auteurs = db.relationship("Auteur", secondary=livre_auteur, back_populates="livres")

    def to_dict(self, include_relations: bool = True):
        data = {
            "id_livre": self.id_livre,
            "isbn": self.isbn,
            "titre": self.titre,
            "quantite": self.quantite,
            "cat_id": self.cat_id,
        }
        if include_relations:
            data["categorie"] = self.categorie.to_dict() if self.categorie else None
            data["auteurs"] = [a.to_dict() for a in self.auteurs]
        return data
