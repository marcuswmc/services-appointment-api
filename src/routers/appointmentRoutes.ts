import { Router } from "express";
import AppointmentController from "../controllers/appointmentController";


const router = Router();

router.get("/appointments", AppointmentController.getAll);
router.get("/appointments/:id", AppointmentController.getById);
router.post("/appointments/create", AppointmentController.create);
router.put("/appointments/:id", AppointmentController.cancel);

export default router;
