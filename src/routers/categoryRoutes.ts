import { Router } from "express";
import CategoryController from "../controllers/categoryController";
import { checkRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/categories", CategoryController.getAll);
router.post("/category/create", checkRole(["ADMIN"]), CategoryController.create);

export default router;
