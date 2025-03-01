import { Router } from "express";
import ProfessionalController from "../controllers/professionalController";


const router = Router();

router.get("/professionals", ProfessionalController.getAll);
router.get("/professional/:id", ProfessionalController.getById);
router.post("/professional/create", ProfessionalController.create);
router.put("/professional/:id", ProfessionalController.update);
router.delete("/professional/:id", ProfessionalController.delete);

export default router;
