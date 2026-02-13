import { useEffect, useState } from "react";
import "./App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function App() {
  const [emprunts, setEmprunts] = useState([]);
  const [livres, setLivres] = useState([]);
  const [membres, setMembres] = useState([]);

  const [livreId, setLivreId] = useState("");
  const [membreId, setMembreId] = useState("");
  const [dateE, setDateE] = useState(null);
  const [dateR, setDateR] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmprunt, setSelectedEmprunt] = useState(null);
  const [editLivreId, setEditLivreId] = useState("");
  const [editMembreId, setEditMembreId] = useState("");
  const [editDateE, setEditDateE] = useState(null);
  const [editDateR, setEditDateR] = useState(null);

  useEffect(() => {
    loadEmprunts();
    loadLivres();
    loadMembres();
  }, []);

  const loadEmprunts = () => {
    fetch("http://localhost:5000/emprunts")
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then(setEmprunts)
      .catch((err) => alert("Erreur chargement emprunts"));
  };

  const loadLivres = () => {
    fetch("http://localhost:5000/livres")
      .then((res) => res.json())
      .then(setLivres)
      .catch(console.error);
  };

  const loadMembres = () => {
    fetch("http://localhost:5000/membres")
      .then((res) => res.json())
      .then(setMembres)
      .catch(console.error);
  };

  const addEmprunt = () => {
    if (!livreId || !membreId || !dateE) {
      alert("Champs obligatoires manquants !");
      return;
    }

    const dateEmpruntStr = dateE.toISOString().split("T")[0];
    const dateRetourStr = dateR ? dateR.toISOString().split("T")[0] : null;

    if (dateR && dateEmpruntStr > dateRetourStr) {
      alert("Date d'emprunt doit être ≤ date de retour prévue !");
      return;
    }

    const data = {
      livre_id: parseInt(livreId, 10),
      membre_id: parseInt(membreId, 10),
      date_emprunt: dateEmpruntStr,
      date_retour: dateRetourStr,
    };

    fetch("http://localhost:5000/emprunts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur ajout");
        return res.json();
      })
      .then(() => {
        loadEmprunts();
        setLivreId("");
        setMembreId("");
        setDateE(null);
        setDateR(null);
      })
      .catch((err) => alert("Erreur : " + err.message));
  };

  const editEmprunt = (emprunt) => {
    setSelectedEmprunt(emprunt);
    setEditLivreId(emprunt.livre_id.toString());
    setEditMembreId(emprunt.membre_id.toString());
    setEditDateE(emprunt.date_emprunt ? new Date(emprunt.date_emprunt) : null);
    setEditDateR(emprunt.date_retour ? new Date(emprunt.date_retour) : null);
    setIsEditOpen(true);
  };

  const updateEmprunt = () => {
    if (!editLivreId || !editMembreId || !editDateE) {
      alert("Champs obligatoires manquants !");
      return;
    }

    const dateEmpruntStr = editDateE.toISOString().split("T")[0];
    const dateRetourStr = editDateR ? editDateR.toISOString().split("T")[0] : null;

    if (editDateR && dateEmpruntStr > dateRetourStr) {
      alert("Date d'emprunt doit être ≤ date de retour prévue !");
      return;
    }

    const data = {
      livre_id: parseInt(editLivreId, 10),
      membre_id: parseInt(editMembreId, 10),
      date_emprunt: dateEmpruntStr,
      date_retour: dateRetourStr,
    };

    fetch(`http://localhost:5000/emprunts/${selectedEmprunt.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur modification");
        return res.json();
      })
      .then(() => {
        loadEmprunts();
        setIsEditOpen(false);
      })
      .catch((err) => alert("Erreur : " + err.message));
  };

  const deleteEmprunt = (id) => {
    if (!window.confirm("Supprimer cet emprunt ?")) return;

    fetch(`http://localhost:5000/emprunts/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur suppression");
        loadEmprunts();
      })
      .catch((err) => alert("Erreur suppression"));
  };

  return (
    <div className="container">
      <h2>Gestion des Emprunts</h2>

      <div className="form-row">
        <div className="form-group">
          <label>Livre</label>
          <select value={livreId} onChange={(e) => setLivreId(e.target.value)}>
            <option value="">-- Choisir --</option>
            {livres.map((l) => (
              <option key={l.id} value={l.id}>
                {l.titre} (ID {l.id})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Membre</label>
          <select value={membreId} onChange={(e) => setMembreId(e.target.value)}>
            <option value="">-- Choisir --</option>
            {membres.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom} {m.prenom} (ID {m.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date d'emprunt</label>
          <DatePicker
            selected={dateE}
            onChange={(date) => setDateE(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Choisir une date"
            className="datepicker-input"
            calendarClassName="custom-violet-calendar"
            maxDate={dateR || new Date()}
          />
        </div>

        <div className="form-group">
          <label>Date de retour</label>
          <DatePicker
            selected={dateR}
            onChange={(date) => setDateR(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Optionnel"
            className="datepicker-input"
            calendarClassName="custom-violet-calendar"
            minDate={dateE}
          />
        </div>
      </div>

      <button className="btn-add" onClick={addEmprunt}>
        Ajouter
      </button>

      <ul className="emprunts-list">
        {emprunts.map((e) => (
          <li key={e.id}>
            <span className="item-text">
              Livre <strong>{e.livre_id}</strong> • Membre <strong>{e.membre_id}</strong>
              {e.date_emprunt && <> • Emprunt : <strong>{e.date_emprunt}</strong></>}
              {e.date_retour && <> • Retour : <strong>{e.date_retour}</strong></>}
            </span>
            <div className="actions">
              <button className="btn-edit" onClick={() => editEmprunt(e)}>
                ✏️
              </button>
              <button className="btn-delete" onClick={() => deleteEmprunt(e.id)}>
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      {isEditOpen && selectedEmprunt && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Modifier #{selectedEmprunt.id}</h3>

            <div className="form-group">
              <label>Livre</label>
              <select value={editLivreId} onChange={(e) => setEditLivreId(e.target.value)}>
                <option value="">-- Choisir --</option>
                {livres.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titre} (ID {l.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Membre</label>
              <select value={editMembreId} onChange={(e) => setEditMembreId(e.target.value)}>
                <option value="">-- Choisir --</option>
                {membres.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom} {m.prenom} (ID {m.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date emprunt</label>
              <DatePicker
                selected={editDateE}
                onChange={(date) => setEditDateE(date)}
                dateFormat="yyyy-MM-dd"
                className="datepicker-input"
                calendarClassName="custom-violet-calendar"
              />
            </div>

            <div className="form-group">
              <label>Date retour</label>
              <DatePicker
                selected={editDateR}
                onChange={(date) => setEditDateR(date)}
                dateFormat="yyyy-MM-dd"
                className="datepicker-input"
                calendarClassName="custom-violet-calendar"
                minDate={editDateE}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-modal-save" onClick={updateEmprunt}>
                Enregistrer
              </button>
              <button className="btn-modal-cancel" onClick={() => setIsEditOpen(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;