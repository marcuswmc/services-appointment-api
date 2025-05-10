import { Router } from "express";
import AvailabilityController from "../controllers/availabilityController";

const router = Router();
router.get("/availability", AvailabilityController.getSlots);
export default router;
