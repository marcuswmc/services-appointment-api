import { Request, Response } from "express";
import AppointmentService from "../services/appointmentService";
import { IAppointment } from "../models/appointmentModel";

class AppointmentController {
  getAll = async (req: Request, res: Response) => {
    try {
      const appointments: IAppointment[] | undefined =
        await AppointmentService.getAll();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get appointments" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const appointment: IAppointment | null = await AppointmentService.getById(
        req.params.id
      );
      if (!appointment) {
        res.status(404).json({ message: "Appointment not found" });
      }

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to get appointment" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const newAppointment = await AppointmentService.create(req.body);
      res.status(201).json(newAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create appointment" });
    }
  };

  cancel = async (req: Request, res: Response) => {
    try {
      const canceledAppointment = await AppointmentService.cancel(
        req.params.id
      );
      if (!canceledAppointment){
        res.status(404).json({ message: "Appointment not found" });
      }
        
      res.json(canceledAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  };
}

export default new AppointmentController();
