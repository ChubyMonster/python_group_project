import React, { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost, apiDelete, apiPut } from './api.js'

export default function App() {
  const [activeTab, setActiveTab] = useState('livres') // 'livres' | 'auteurs' | 'categories'

  const [categories, setCategories] = useState([])
  const [auteurs, setAuteurs] = useState([])
  const [livres, setLivres] = useState([])

  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const [catForm, setCatForm] = useState({ nom_cat: '', champ: '' })
  const [auteurForm, setAuteurForm] = useState({ nom_auteur: '', prenom_auteur: '' })
  const [livreForm, setLivreForm] = useState({ isbn: '', titre: '', quantite: 0, cat_id: '', auteur_ids: '' })
  const [search, setSearch] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ isbn: '', titre: '', quantite: 0, cat_id: '', auteur_ids: '' })

  const auteurIdsParsed = useMemo(() => {
    const raw = (livreForm.auteur_ids || '').trim()
    if (!raw) return []
    return raw.split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isInteger)
  }, [livreForm.auteur_ids])

  async function loadAll() {
    setErr(''); setMsg('')
    const [c, a, l] = await Promise.all([
      apiGet('/api/categories'),
      apiGet('/api/auteurs'),
      apiGet('/api/livres')
    ])
    setCategories(c.categories || [])
    setAuteurs(a.auteurs || [])
    setLivres(l.livres || [])
  }

  useEffect(() => { loadAll().catch(e => setErr(e.message)) }, [])

  // ---------- CATEGORIES ----------
  async function createCategory(e) {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      await apiPost('/api/categories', catForm)
      setCatForm({ nom_cat: '', champ: '' })
      await loadAll()
      setMsg('✅ Catégorie ajoutée.')
    } catch (e) { setErr(e.message) }
  }

  // ---------- AUTEURS ----------
  async function createAuteur(e) {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      await apiPost('/api/auteurs', auteurForm)
      setAuteurForm({ nom_auteur: '', prenom_auteur: '' })
      await loadAll()
      setMsg('✅ Auteur ajouté.')
    } catch (e) { setErr(e.message) }
  }

  // ---------- LIVRES ----------
  async function createLivre(e) {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      const body = {
        isbn: livreForm.isbn,
        titre: livreForm.titre,
        quantite: parseInt(livreForm.quantite, 10) || 0,
        cat_id: parseInt(livreForm.cat_id, 10),
        auteur_ids: auteurIdsParsed
      }
      await apiPost('/api/livres', body)
      setLivreForm({ isbn: '', titre: '', quantite: 0, cat_id: '', auteur_ids: '' })
      await loadAll()
      setMsg('✅ Livre ajouté.')
    } catch (e) { setErr(e.message) }
  }

  async function doSearch(e) {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      if (!search.trim()) return loadAll()
      const data = await apiGet(`/api/livres/search?q=${encodeURIComponent(search)}`)
      setLivres(data.livres || [])
      setMsg(`🔎 Résultats : ${data.count}`)
    } catch (e) { setErr(e.message) }
  }

  async function removeLivre(id) {
    const ok = confirm('Supprimer ce livre ?')
    if (!ok) return
    setErr(''); setMsg('')
    try {
      await apiDelete(`/api/livres/${id}`)
      await loadAll()
      setMsg('🗑️ Livre supprimé.')
    } catch (e) { setErr(e.message) }
  }

  function startEdit(book) {
    setEditingId(book.id_livre)
    setEditForm({
      isbn: book.isbn || '',
      titre: book.titre || '',
      quantite: book.quantite ?? 0,
      cat_id: String(book.cat_id ?? ''),
      auteur_ids: (book.auteurs || []).map(a => a.id_auteur).join(',')
    })
    setActiveTab('livres')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ isbn: '', titre: '', quantite: 0, cat_id: '', auteur_ids: '' })
  }

  async function updateLivre(e) {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      const auteur_ids = (editForm.auteur_ids || '')
        .split(',')
        .map(x => parseInt(x.trim(), 10))
        .filter(Number.isInteger)

      const body = {
        isbn: editForm.isbn,
        titre: editForm.titre,
        quantite: parseInt(editForm.quantite, 10) || 0,
        cat_id: parseInt(editForm.cat_id, 10),
        auteur_ids
      }

      await apiPut(`/api/livres/${editingId}`, body)
      await loadAll()
      cancelEdit()
      setMsg('✅ Livre mis à jour.')
    } catch (e) { setErr(e.message) }
  }

  // ---------- UI helpers ----------
  const stats = {
    categories: categories.length,
    auteurs: auteurs.length,
    livres: livres.length
  }

  return (
    <div className="page">
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <div className="brandDot" />
            <div>
              <div className="brandTitle">Gestion de Bibliothèque</div>
              <div className="brandSub">Application de gestion — Livres • Auteurs • Catégories</div>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="statNum">{stats.livres}</div>
              <div className="statLbl">Livres</div>
            </div>
            <div className="stat">
              <div className="statNum">{stats.auteurs}</div>
              <div className="statLbl">Auteurs</div>
            </div>
            <div className="stat">
              <div className="statNum">{stats.categories}</div>
              <div className="statLbl">Catégories</div>
            </div>
          </div>
        </header>

        <nav className="tabs">
          <button className={`tab ${activeTab === 'livres' ? 'active' : ''}`} onClick={() => setActiveTab('livres')}>Livres</button>
          <button className={`tab ${activeTab === 'auteurs' ? 'active' : ''}`} onClick={() => setActiveTab('auteurs')}>Auteurs</button>
          <button className={`tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Catégories</button>
        </nav>

        {(err || msg) && (
          <div className={`alert ${err ? 'alertErr' : 'alertOk'}`}>
            <b>{err ? 'Erreur' : 'Info'} :</b> {err || msg}
          </div>
        )}

        {/* ---------------------- LIVRES ---------------------- */}
        {activeTab === 'livres' && (
          <div className="grid">
            <section className="card">
              <h2 className="cardTitle">Ajouter un livre</h2>

              <form onSubmit={createLivre} className="formGrid">
                <div className="field">
                  <label>ISBN</label>
                  <input placeholder="Ex: 9780132350884" value={livreForm.isbn}
                    onChange={e => setLivreForm({ ...livreForm, isbn: e.target.value })} />
                </div>

                <div className="field">
                  <label>Titre</label>
                  <input placeholder="Ex: Clean Code" value={livreForm.titre}
                    onChange={e => setLivreForm({ ...livreForm, titre: e.target.value })} />
                </div>

                <div className="field">
                  <label>Quantité</label>
                  <input type="number" placeholder="0" value={livreForm.quantite}
                    onChange={e => setLivreForm({ ...livreForm, quantite: e.target.value })} />
                </div>

                <div className="field">
                  <label>Catégorie</label>
                  <select value={livreForm.cat_id} onChange={e => setLivreForm({ ...livreForm, cat_id: e.target.value })}>
                    <option value="">— Choisir —</option>
                    {categories.map(c => (
                      <option key={c.id_cat} value={c.id_cat}>#{c.id_cat} — {c.nom_cat}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Auteurs (IDs)</label>
                  <input placeholder="Ex: 1,2" value={livreForm.auteur_ids}
                    onChange={e => setLivreForm({ ...livreForm, auteur_ids: e.target.value })} />
                  <div className="hint">Sépare les IDs par des virgules.</div>
                </div>

                <button className="btnPrimary" type="submit">Ajouter</button>
              </form>
            </section>

            {editingId && (
              <section className="card">
                <h2 className="cardTitle">Modifier le livre (ID: {editingId})</h2>

                <form onSubmit={updateLivre} className="formGrid">
                  <div className="field">
                    <label>ISBN</label>
                    <input value={editForm.isbn}
                      onChange={e => setEditForm({ ...editForm, isbn: e.target.value })} />
                  </div>

                  <div className="field">
                    <label>Titre</label>
                    <input value={editForm.titre}
                      onChange={e => setEditForm({ ...editForm, titre: e.target.value })} />
                  </div>

                  <div className="field">
                    <label>Quantité</label>
                    <input type="number" value={editForm.quantite}
                      onChange={e => setEditForm({ ...editForm, quantite: e.target.value })} />
                  </div>

                  <div className="field">
                    <label>Catégorie</label>
                    <select value={editForm.cat_id} onChange={e => setEditForm({ ...editForm, cat_id: e.target.value })}>
                      <option value="">— Choisir —</option>
                      {categories.map(c => (
                        <option key={c.id_cat} value={c.id_cat}>#{c.id_cat} — {c.nom_cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label>Auteurs (IDs)</label>
                    <input value={editForm.auteur_ids}
                      onChange={e => setEditForm({ ...editForm, auteur_ids: e.target.value })} />
                  </div>

                  <div className="actionsRow">
                    <button className="btnPrimary" type="submit">Enregistrer</button>
                    <button className="btnDanger" type="button" onClick={cancelEdit}>Annuler</button>
                  </div>
                </form>
              </section>
            )}

            <section className="card cardWide">
              <div className="cardHeader">
                <h2 className="cardTitle">Liste des livres</h2>

                <form onSubmit={doSearch} className="searchRow">
                  <input
                    placeholder="Rechercher par titre..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <button className="btnGhost" type="submit">Rechercher</button>
                  <button className="btnGhost" type="button" onClick={() => { setSearch(''); loadAll() }}>
                    Réinitialiser
                  </button>
                </form>
              </div>

              <div className="tableWrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>ISBN</th>
                      <th>Titre</th>
                      <th>Qté</th>
                      <th>Catégorie</th>
                      <th>Auteurs</th>
                      <th className="thRight">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livres.map(l => (
                      <tr key={l.id_livre}>
                        <td>{l.id_livre}</td>
                        <td>{l.isbn}</td>
                        <td>{l.titre}</td>
                        <td>{l.quantite}</td>
                        <td>{l.categorie?.nom_cat || l.cat_id}</td>
                        <td>{(l.auteurs || []).map(a => `${a.nom_auteur}${a.prenom_auteur ? ' ' + a.prenom_auteur : ''}`).join(', ')}</td>
                        <td className="tdRight">
                          <button className="iconBtn" title="Modifier" onClick={() => startEdit(l)}>✏️</button>
                          <button className="iconBtn danger" title="Supprimer" onClick={() => removeLivre(l.id_livre)}>✖</button>
                        </td>
                      </tr>
                    ))}
                    {livres.length === 0 && (
                      <tr><td colSpan="7" className="empty">Aucun livre pour le moment.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ---------------------- AUTEURS ---------------------- */}
        {activeTab === 'auteurs' && (
          <div className="grid">
            <section className="card">
              <h2 className="cardTitle">Ajouter un auteur</h2>

              <form onSubmit={createAuteur} className="formGrid">
                <div className="field">
                  <label>Nom</label>
                  <input placeholder="Ex: Martin" value={auteurForm.nom_auteur}
                    onChange={e => setAuteurForm({ ...auteurForm, nom_auteur: e.target.value })} />
                </div>
                <div className="field">
                  <label>Prénom (optionnel)</label>
                  <input placeholder="Ex: Robert" value={auteurForm.prenom_auteur}
                    onChange={e => setAuteurForm({ ...auteurForm, prenom_auteur: e.target.value })} />
                </div>

                <button className="btnPrimary" type="submit">Ajouter</button>
              </form>
            </section>

            <section className="card cardWide">
              <h2 className="cardTitle">Liste des auteurs</h2>

              <div className="list">
                {auteurs.map(a => (
                  <div key={a.id_auteur} className="listItem">
                    <div>
                      <div className="listMain">{a.nom_auteur} {a.prenom_auteur || ''}</div>
                      <div className="listSub">ID Auteur : {a.id_auteur}</div>
                    </div>
                    <div className="pill">Auteur</div>
                  </div>
                ))}
                {auteurs.length === 0 && <div className="empty">Aucun auteur.</div>}
              </div>
            </section>
          </div>
        )}

        {/* ---------------------- CATEGORIES ---------------------- */}
        {activeTab === 'categories' && (
          <div className="grid">
            <section className="card">
              <h2 className="cardTitle">Ajouter une catégorie</h2>

              <form onSubmit={createCategory} className="formGrid">
                <div className="field">
                  <label>Nom de catégorie</label>
                  <input placeholder="Ex: Informatique" value={catForm.nom_cat}
                    onChange={e => setCatForm({ ...catForm, nom_cat: e.target.value })} />
                </div>
                <div className="field">
                  <label>Champ (optionnel)</label>
                  <input placeholder="Ex: Programmation" value={catForm.champ}
                    onChange={e => setCatForm({ ...catForm, champ: e.target.value })} />
                </div>

                <button className="btnPrimary" type="submit">Ajouter</button>
              </form>
            </section>

            <section className="card cardWide">
              <h2 className="cardTitle">Liste des catégories</h2>

              <div className="list">
                {categories.map(c => (
                  <div key={c.id_cat} className="listItem">
                    <div>
                      <div className="listMain">{c.nom_cat}</div>
                      <div className="listSub">ID Catégorie : {c.id_cat} {c.champ ? `• ${c.champ}` : ''}</div>
                    </div>
                    <div className="pill">Catégorie</div>
                  </div>
                ))}
                {categories.length === 0 && <div className="empty">Aucune catégorie.</div>}
              </div>
            </section>
          </div>
        )}

        <footer className="footer">
          <span>Proxy API : <b>/api</b> → Flask (127.0.0.1:5000)</span>
        </footer>
      </div>
    </div>
  )
}
