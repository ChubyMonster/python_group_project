from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:biblio123@localhost:5432/my_biblio'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Emprunt(db.Model):
    __tablename__ = 'emprunt'
    id_emprunt = db.Column(db.Integer, primary_key=True)
    livre_id = db.Column(db.Integer, nullable=False)
    membre_id = db.Column(db.Integer, nullable=False)
    date_emprunt = db.Column(db.Date, nullable=False)
    date_retour = db.Column(db.Date, nullable=True)

    def to_dict(self):
        return {
            'id': self.id_emprunt,
            'livre_id': self.livre_id,
            'membre_id': self.membre_id,
            'date_emprunt': self.date_emprunt.isoformat() if self.date_emprunt else None,
            'date_retour': self.date_retour.isoformat() if self.date_retour else None
        }

class Livre(db.Model):
    __tablename__ = 'livre'
    id_livre = db.Column(db.Integer, primary_key=True)
    isbn = db.Column(db.String(20))
    titre = db.Column(db.String(255), nullable=False)
    quantite = db.Column(db.Integer, default=0)
    cat_id = db.Column(db.Integer)

    def to_dict(self):
        return {
            'id': self.id_livre,
            'titre': self.titre,
            'isbn': self.isbn,
            'quantite': self.quantite
        }

class Membre(db.Model):
    __tablename__ = 'membre'
    id_mbre = db.Column(db.Integer, primary_key=True)
    nom_mbre = db.Column(db.String(100), nullable=False)
    prenom_mbre = db.Column(db.String(100), nullable=False)
    email_mbre = db.Column(db.String(150))
    date_adhesion = db.Column(db.Date, default=datetime.utcnow().date)

    def to_dict(self):
        return {
            'id': self.id_mbre,
            'nom': self.nom_mbre,
            'prenom': self.prenom_mbre,
            'email': self.email_mbre,
            'date_adhesion': self.date_adhesion.isoformat() if self.date_adhesion else None
        }

@app.route("/emprunts", methods=["GET"])
def get_emprunts():
    emprunts = Emprunt.query.order_by(Emprunt.id_emprunt.asc()).all()
    return jsonify([e.to_dict() for e in emprunts])

@app.route("/livres", methods=["GET"])
def get_livres():
    livres = Livre.query.all()
    return jsonify([l.to_dict() for l in livres])

@app.route("/membres", methods=["GET"])
def get_membres():
    membres = Membre.query.all()
    return jsonify([m.to_dict() for m in membres])

@app.route("/emprunts", methods=["POST"])
def add_emprunt():
    data = request.json

    required_keys = ['livre_id', 'membre_id', 'date_emprunt']
    if not all(key in data for key in required_keys):
        return jsonify({"error": "Champs obligatoires manquants"}), 400

    try:
        livre_id = int(data['livre_id'])
        membre_id = int(data['membre_id'])
        date_emprunt = datetime.strptime(data['date_emprunt'], '%Y-%m-%d').date()
        date_retour = datetime.strptime(data.get('date_retour'), '%Y-%m-%d').date() if data.get('date_retour') else None

        new_emprunt = Emprunt(
            livre_id=livre_id,
            membre_id=membre_id,
            date_emprunt=date_emprunt,
            date_retour=date_retour
        )
        db.session.add(new_emprunt)
        db.session.commit()
        return jsonify(new_emprunt.to_dict()), 201

    except ValueError:
        return jsonify({"error": "Format invalide (ID entier, date YYYY-MM-DD)"}), 400
    except Exception as e:
        db.session.rollback()
        error_str = str(e).lower()
        if "foreign key" in error_str or "clé étrangère" in error_str:
            return jsonify({"error": "ID livre ou membre inexistant"}), 400
        return jsonify({"error": str(e)}), 500

@app.route("/emprunts/<int:id>", methods=["PUT"])
def update_emprunt(id):
    data = request.json
    emprunt = Emprunt.query.get_or_404(id)

    try:
        if 'livre_id' in data:
            emprunt.livre_id = int(data['livre_id'])
        if 'membre_id' in data:
            emprunt.membre_id = int(data['membre_id'])
        if 'date_emprunt' in data:
            emprunt.date_emprunt = datetime.strptime(data['date_emprunt'], '%Y-%m-%d').date()
        if 'date_retour' in data:
            emprunt.date_retour = datetime.strptime(data['date_retour'], '%Y-%m-%d').date() if data['date_retour'] else None

        db.session.commit()
        return jsonify(emprunt.to_dict())

    except ValueError:
        return jsonify({"error": "ID ou date invalide"}), 400
    except Exception as e:
        db.session.rollback()
        error_str = str(e).lower()
        if "foreign key" in error_str or "clé étrangère" in error_str:
            return jsonify({"error": "ID livre ou membre invalide"}), 400
        return jsonify({"error": str(e)}), 500

@app.route("/emprunts/<int:id>", methods=["DELETE"])
def delete_emprunt(id):
    emprunt = Emprunt.query.get_or_404(id)
    db.session.delete(emprunt)
    db.session.commit()
    return jsonify({"message": "Emprunt supprimé"})

if __name__ == "__main__":
    app.run(debug=True)