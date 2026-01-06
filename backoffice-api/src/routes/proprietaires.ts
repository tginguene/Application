import { Router } from "express";
import * as c from "../controllers/proprietaires.controller";

export const proprietairesRouter = Router();

proprietairesRouter.get("/", c.list);
proprietairesRouter.get("/:id", c.getOne);
proprietairesRouter.post("/", c.create);
proprietairesRouter.put("/:id", c.update);
proprietairesRouter.delete("/:id", c.remove);
