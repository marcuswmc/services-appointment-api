import { Router } from "express";
import ProfessionalController from "../controllers/professionalController";
import { checkRole } from "../middlewares/authMiddleware";


const router = Router();

router.get("/professionals", ProfessionalController.getAll);
router.get("/professional/:id", ProfessionalController.getById);
router.post("/professional/create", checkRole(['ADMIN']), ProfessionalController.create);
router.put("/professional/:id", checkRole(['ADMIN']), ProfessionalController.update);
router.delete("/professional/:id",checkRole(['ADMIN']), ProfessionalController.delete);

export default router;
