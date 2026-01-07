const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/db-check", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (err) {
    console.error("🔥 DB-CHECK ERROR:", err); // <- IMPORTANT
    res.status(500).json({
      data: null,
      error: { code: "INTERNAL", message: err.message } // temporaire pour debug
    });
  }
});

// 🔌 Connexion PostgreSQL
require("dotenv").config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
console.log("DATABASE_URL présente ?", Boolean(process.env.DATABASE_URL));

// ===============================
// 🔹 API V1
// ===============================
const apiV1 = express.Router();

// 👉 ICI tu définis /proprietaires
apiV1.get("/proprietaires", async (req, res, next) => {
  try {
    const r = await pool.query(
      "SELECT proprietaire_id, nom_complet, email, telephone, adresse_facturation, iban_paiement, created_at FROM proprietaire ORDER BY proprietaire_id DESC"
    );
    res.json({ data: r.rows, error: null });
  } catch (err) {
    next(err);
  }
});

app.use("/api/v1", apiV1);

// ===============================
// ROUTE : POST /proprietaires
// ===============================
apiV1.post("/proprietaires", async (req, res, next) => {
  try {
    console.log("📩 BODY REÇU :", req.body); // 👈 pour debug

    const {
      nom_complet,
      email,
      telephone = null,
      adresse_facturation = null,
      iban_paiement = null
    } = req.body || {};

    // Validation minimale
    if (!nom_complet || !email) {
      return res.status(400).json({
        data: null,
        error: { code: "VALIDATION", message: "nom_complet et email sont obligatoires" }
      });
    }

    const result = await pool.query(
      `INSERT INTO proprietaire
       (nom_complet, email, telephone, adresse_facturation, iban_paiement)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING proprietaire_id, nom_complet, email, created_at`,
      [nom_complet, email, telephone, adresse_facturation, iban_paiement]
    );

    res.status(201).json({
      data: result.rows[0],
      error: null
    });
  } catch (err) {
    console.error("🔥 ERREUR DANS LA ROUTE /proprietaires:", err);
    next(err);
  }
});

// PUT /api/v1/proprietaires/:id
apiV1.put("/proprietaires/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({
        data: null,
        error: { code: "VALIDATION", message: "id invalide" },
      });
    }

    const {
      nom_complet,
      email,
      telephone = null,
      adresse_facturation = null,
      iban_paiement = null,
    } = req.body || {};

    if (!nom_complet || !email) {
      return res.status(400).json({
        data: null,
        error: { code: "VALIDATION", message: "nom_complet et email requis" },
      });
    }

    const r = await pool.query(
      `UPDATE proprietaire
       SET nom_complet = $1,
           email = $2,
           telephone = $3,
           adresse_facturation = $4,
           iban_paiement = $5
       WHERE proprietaire_id = $6
       RETURNING proprietaire_id, nom_complet, email, telephone, adresse_facturation, iban_paiement, created_at`,
      [nom_complet, email, telephone, adresse_facturation, iban_paiement, id]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({
        data: null,
        error: { code: "NOT_FOUND", message: "Propriétaire introuvable" },
      });
    }

    res.json({ data: r.rows[0], error: null });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/proprietaires/:id
apiV1.delete("/proprietaires/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({
        data: null,
        error: { code: "VALIDATION", message: "id invalide" },
      });
    }

    const r = await pool.query(
      `DELETE FROM proprietaire WHERE proprietaire_id = $1`,
      [id]
    );

    if (r.rowCount === 0) {
      return res.status(404).json({
        data: null,
        error: { code: "NOT_FOUND", message: "Propriétaire introuvable" },
      });
    }

    res.json({ data: { deleted: true }, error: null });
  } catch (err) {
    next(err);
  }
});

// ===============================
// MIDDLEWARE GLOBAL D’ERREURS
// ⚠️ TOUJOURS À LA FIN
// ===============================


app.use((err, req, res, next) => {
  console.error("🔥 ERREUR SERVEUR :", err); // 👈 ICI S’AFFICHE L’ERREUR

  // Email déjà existant
  if (err.code === "23505") {
    return res.status(409).json({
      data: null,
      error: { code: "CONFLICT", message: "Email déjà utilisé" }
    });
  }

  // Champ obligatoire manquant
  if (err.code === "23502") {
    return res.status(400).json({
      data: null,
      error: { code: "VALIDATION", message: "Champ obligatoire manquant" }
    });
  }

  // Erreur inconnue
  res.status(500).json({
    data: null,
    error: { code: "INTERNAL", message: "Erreur serveur" }
  });
});

// ===============================
// LANCEMENT DU SERVEUR
// ===============================
app.listen(3001, "0.0.0.0", () => {
  console.log("API sur http://0.0.0.0:3001");
});

