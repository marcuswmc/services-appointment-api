import AppointmentModel, { IAppointment } from "../models/appointmentModel";
import ServiceModel from "../models/servicesModel";
import { Types } from "mongoose";

class AppointmentService {
  getAll = async (): Promise<IAppointment[]> => {
    return await AppointmentModel.find().populate("serviceId professionalId");
  };

  getById = async (id: string): Promise<IAppointment | null> => {
    return await AppointmentModel.findById(id).populate(
      "serviceId professionalId"
    );
  };

  create = async (appointmentData: IAppointment): Promise<IAppointment> => {
    const { serviceId, professionalId, date, time } = appointmentData;

    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      throw new Error("Service not found.");
    }

    if (!service.availableTimes.includes(time)) {
      throw new Error("Selected time is not available for this service.");
    }

    const existingAppointment = await AppointmentModel.findOne({
      professionalId: new Types.ObjectId(professionalId),
      date,
      time,
    });

    if (existingAppointment) {
      throw new Error("Professional is already booked for this time.");
    }

    
    const newAppointment = await AppointmentModel.create(appointmentData);
    return newAppointment;
  }

  cancel = async (id: string): Promise<IAppointment | null> => {
    return await AppointmentModel.findByIdAndUpdate(
      id,
      { status: "CANCELED" },
      { new: true }
    );
  };
}

export default new AppointmentService();
