import { Router } from "express";
import ServiceController from "../controllers/servicesController";
import { checkRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/services", ServiceController.getAll);
router.get("/services/category/:categoryId", ServiceController.getAllByCategory);
router.get("/services/available", ServiceController.getAvailableServices);
router.get("/service/:id", ServiceController.getById);
router.post("/service/create", checkRole(['ADMIN']), ServiceController.create);
router.put("/service/:id", checkRole(['ADMIN']), ServiceController.update);
router.delete("/service/:id", checkRole(['ADMIN']), ServiceController.delete);


export default router;
