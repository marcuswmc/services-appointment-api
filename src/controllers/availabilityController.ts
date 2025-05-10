import { Request, Response } from "express";
import AppointmentService from "../services/appointmentService";

class AvailabilityController {
  getSlots = async (req: Request, res: Response) => {
    const { professionalId, serviceId, date } = req.query as {
      professionalId: string;
      serviceId: string;
      date: string;
    };

    try {
      const slots = await AppointmentService.computeAvailableSlots(
        professionalId,
        serviceId,
        date
      );
      res.json(slots);   // ex: ["09:30", "10:15", ...]
    } catch (err: any) {
      res.status(500).json({ message: "Erro ao calcular disponibilidade", error: err.message });
    }
  };
}

export default new AvailabilityController();
