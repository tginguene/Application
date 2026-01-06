import React from "react";
import { apiGet } from "../../services/api";

type Proprietaire = {
  id: number;
  nom_complet: string;
  email: string;
  telephone?: string | null;
  created_at: string;
};

export default function ProprietairesList() {
  const [items, setItems] = React.useState<Proprietaire[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiGet<Proprietaire[]>("/proprietaires");
        setItems(data);
      } catch (e: any) {
        setErr(e?.message ?? "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Chargement…</div>;
  if (err) return <div style={{ color: "crimson" }}>{err}</div>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Nom</th>
            <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Email</th>
            <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Téléphone</th>
            <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Créé le</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9" }}>{p.nom_complet}</td>
              <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9" }}>{p.email}</td>
              <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9" }}>{p.telephone ?? "—"}</td>
              <td style={{ padding: 10, borderBottom: "1px solid #f1f5f9" }}>
                {new Date(p.created_at).toLocaleString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
