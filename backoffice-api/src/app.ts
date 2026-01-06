import express from "express";
import cors from "cors";
import { proprietairesRouter } from "./routes/proprietaires";

export const app = express();

app.use(cors({ origin: ["http://localhost:5173"] })); // ok avec Vite
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/v1/proprietaires", proprietairesRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ data: null, error: { code: "INTERNAL", message: "Erreur serveur" } });
});
