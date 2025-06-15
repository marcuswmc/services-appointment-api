import { Router } from "express";
import ProfessionalController from "../controllers/professionalController";
import { checkRole } from "../middlewares/authMiddleware";
import upload from "../middlewares/cloudinary";


const router = Router();

router.get("/professionals", ProfessionalController.getAll);
router.get("/professional/:id", ProfessionalController.getById);
router.post("/professional/create",  upload.single("image"), ProfessionalController.create);
router.put("/professional/:id", checkRole(['ADMIN']),  upload.single("image"), ProfessionalController.update);
router.delete("/professional/:id",checkRole(['ADMIN']), ProfessionalController.delete);

export default router;
