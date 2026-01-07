import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = "http://192.168.2.158:3001";

const emptyForm = {
  proprietaire_id: null,
  nom_complet: "",
  email: "",
  telephone: "",
  adresse_facturation: "",
  iban_paiement: "",
};

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [form, setForm] = useState(emptyForm);
  const isEdit = useMemo(() => Boolean(form.proprietaire_id), [form.proprietaire_id]);

  async function load() {
    setLoading(true);
    setErrMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/proprietaires`);
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error?.message || `HTTP ${res.status}`);
      setItems(json.data || []);
    } catch (e) {
      setErrMsg(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setForm(emptyForm);
  }

  function startEdit(p) {
    setForm({
      proprietaire_id: p.proprietaire_id,
      nom_complet: p.nom_complet ?? "",
      email: p.email ?? "",
      telephone: p.telephone ?? "",
      adresse_facturation: p.adresse_facturation ?? "",
      iban_paiement: p.iban_paiement ?? "",
    });
  }

  function onChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setErrMsg("");

    const payload = {
      nom_complet: form.nom_complet.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim() || null,
      adresse_facturation: form.adresse_facturation.trim() || null,
      iban_paiement: form.iban_paiement.trim() || null,
    };

    try {
      const url = isEdit
        ? `${API_BASE}/api/v1/proprietaires/${form.proprietaire_id}`
        : `${API_BASE}/api/v1/proprietaires`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.error) {
        throw new Error(json?.error?.message || `HTTP ${res.status}`);
      }

      // Recharge la liste pour être sûr d’être synchro
      await load();
      setForm(emptyForm);
    } catch (e2) {
      setErrMsg(e2.message || "Erreur inconnue");
    }
  }

  async function remove(p) {
    const ok = window.confirm(`Supprimer le propriétaire "${p.nom_complet}" ?`);
    if (!ok) return;

    setErrMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/proprietaires/${p.proprietaire_id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.error) throw new Error(json?.error?.message || `HTTP ${res.status}`);
      await load();
      if (form.proprietaire_id === p.proprietaire_id) setForm(emptyForm);
    } catch (e) {
      setErrMsg(e.message || "Erreur inconnue");
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1>Propriétaires</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={load}>Rafraîchir</button>
        <button onClick={startCreate}>+ Ajouter</button>
      </div>

      {errMsg && (
        <div style={{ padding: 12, border: "1px solid #f99", background: "#fee", marginBottom: 12 }}>
          <strong>Erreur :</strong> {errMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Liste */}
        <div>
          {loading && <p>Chargement…</p>}

          {!loading && items.length === 0 && <p>Aucun propriétaire.</p>}

          {!loading && items.length > 0 && (
            <table cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th align="left" style={{ borderBottom: "1px solid #ddd" }}>Nom</th>
                  <th align="left" style={{ borderBottom: "1px solid #ddd" }}>Email</th>
                  <th align="left" style={{ borderBottom: "1px solid #ddd" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.proprietaire_id}>
                    <td style={{ borderBottom: "1px solid #eee" }}>{p.nom_complet}</td>
                    <td style={{ borderBottom: "1px solid #eee" }}>{p.email}</td>
                    <td style={{ borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>
                      <button onClick={() => startEdit(p)} style={{ marginRight: 8 }}>Modifier</button>
                      <button onClick={() => remove(p)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Formulaire */}
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>{isEdit ? "Modifier un propriétaire" : "Ajouter un propriétaire"}</h2>

          <form onSubmit={save}>
            <div style={{ display: "grid", gap: 10 }}>
              <label>
                Nom complet *
                <input
                  value={form.nom_complet}
                  onChange={(e) => onChange("nom_complet", e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                  required
                />
              </label>

              <label>
                Email *
                <input
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                  required
                />
              </label>

              <label>
                Téléphone
                <input
                  value={form.telephone}
                  onChange={(e) => onChange("telephone", e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                />
              </label>

              <label>
                Adresse de facturation
                <textarea
                  value={form.adresse_facturation}
                  onChange={(e) => onChange("adresse_facturation", e.target.value)}
                  style={{ width: "100%", padding: 8, minHeight: 70 }}
                />
              </label>

              <label>
                IBAN
                <input
                  value={form.iban_paiement}
                  onChange={(e) => onChange("iban_paiement", e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                />
              </label>

              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit">{isEdit ? "Enregistrer" : "Créer"}</button>
                <button type="button" onClick={() => setForm(emptyForm)}>Annuler</button>
              </div>

              <div style={{ fontSize: 12, opacity: 0.7 }}>
                * Champs obligatoires. Contrainte: email unique (409 si déjà utilisé).
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
