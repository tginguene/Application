import { Request, Response, NextFunction } from "express";
import { query } from "../db";

type ProprietaireRow = {
  proprietaire_id: number;
  nom_complet: string;
  email: string;
  telephone: string | null;
  adresse_facturation: string | null;
  iban_paiement: string | null;
  created_at: string;
};

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await query<Pick<ProprietaireRow,
      "proprietaire_id" | "nom_complet" | "email" | "telephone" | "created_at"
    >>(
      `SELECT proprietaire_id, nom_complet, email, telephone, created_at
       FROM proprietaire
       ORDER BY created_at DESC
       LIMIT 200`
    );
    res.json({ data: rows, error: null });
  } catch (e) { next(e); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const rows = await query<ProprietaireRow>(
      `SELECT proprietaire_id, nom_complet, email, telephone, adresse_facturation, iban_paiement, created_at
       FROM proprietaire
       WHERE proprietaire_id = $1`,
      [id]
    );
    const item = rows[0];
    if (!item) return res.status(404).json({ data: null, error: { code: "NOT_FOUND", message: "Introuvable" } });
    res.json({ data: item, error: null });
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { nom_complet, email, telephone, adresse_facturation, iban_paiement } = req.body ?? {};
    if (!nom_complet || !email) {
      return res.status(400).json({ data: null, error: { code: "VALIDATION", message: "nom_complet et email obligatoires" } });
    }

    const rows = await query<ProprietaireRow>(
      `INSERT INTO proprietaire (nom_complet, email, telephone, adresse_facturation, iban_paiement)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING proprietaire_id, nom_complet, email, telephone, adresse_facturation, iban_paiement, created_at`,
      [nom_complet, email, telephone ?? null, adresse_facturation ?? null, iban_paiement ?? null]
    );

    res.status(201).json({ data: rows[0], error: null });
  } catch (e: any) {
    // email unique (CITEXT UNIQUE) :contentReference[oaicite:1]{index=1}
    if (e?.code === "23505") {
      return res.status(409).json({ data: null, error: { code: "EMAIL_EXISTS", message: "Cet email existe déjà" } });
    }
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { nom_complet, email, telephone, adresse_facturation, iban_paiement } = req.body ?? {};

    if (!nom_complet || !email) {
      return res.status(400).json({ data: null, error: { code: "VALIDATION", message: "nom_complet et email obligatoires" } });
    }

    const rows = await query<ProprietaireRow>(
      `UPDATE proprietaire
       SET nom_complet = $1,
           email = $2,
           telephone = $3,
           adresse_facturation = $4,
           iban_paiement = $5
       WHERE proprietaire_id = $6
       RETURNING proprietaire_id, nom_complet, email, telephone, adresse_facturation, iban_paiement, created_at`,
      [nom_complet, email, telephone ?? null, adresse_facturation ?? null, iban_paiement ?? null, id]
    );

    if (!rows[0]) return res.status(404).json({ data: null, error: { code: "NOT_FOUND", message: "Introuvable" } });
    res.json({ data: rows[0], error: null });
  } catch (e: any) {
    if (e?.code === "23505") {
      return res.status(409).json({ data: null, error: { code: "EMAIL_EXISTS", message: "Cet email existe déjà" } });
    }
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);

    const rows = await query<{ proprietaire_id: number }>(
      `DELETE FROM proprietaire WHERE proprietaire_id = $1 RETURNING proprietaire_id`,
      [id]
    );

    if (!rows[0]) return res.status(404).json({ data: null, error: { code: "NOT_FOUND", message: "Introuvable" } });

    res.json({ data: { proprietaire_id: id }, error: null });
  } catch (e: any) {
    // FK RESTRICT (logement.proprietaire_id → proprietaire.proprietaire_id) :contentReference[oaicite:2]{index=2}
    if (e?.code === "23503") {
      return res.status(409).json({ data: null, error: { code: "HAS_LOGEMENTS", message: "Suppression impossible : logements liés." } });
    }
    next(e);
  }
}
