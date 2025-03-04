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
    } catch (error: any) {
      console.error("Failed to create appointment:", error);
      res.status(500).json({ message: "Failed to create appointment", error: error.message });
    }
  };
  

  updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const { id } = req.params;
  
      if (!["CANCELED", "FINISHED"].includes(status)) {
         res.status(400).json({ message: "Invalid status" });
      }
  
      const updatedAppointment = await AppointmentService.updateStatus(id, status);
  
      if (!updatedAppointment) {
         res.status(404).json({ message: "Appointment not found" });
      }
  
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  };
 
  
}

export default new AppointmentController();
