import { Router } from "express";
import AppointmentController from "../controllers/appointmentController";


const router = Router();

router.get("/appointments", AppointmentController.getAll);
router.get("/appointment/:id", AppointmentController.getById);
router.post("/appointment/create", AppointmentController.create);
router.patch("/appointment/:id", AppointmentController.updateStatus);
router.get("/appointment/cancel/:token", AppointmentController.cancelByToken);
router.post("/appointment/cancel/confirm/:token", AppointmentController.confirmCancelByToken);
router.get("/appointments/missed/:email", AppointmentController.getMissedByEmail);



export default router;