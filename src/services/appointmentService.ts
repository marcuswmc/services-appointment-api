import AppointmentModel, { IAppointment } from "../models/appointmentModel";

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
    return await AppointmentModel.create(appointmentData);
  };

  cancel = async (id: string): Promise<IAppointment | null> => {
    return await AppointmentModel.findByIdAndUpdate(
      id,
      { status: "CANCELED" },
      { new: true }
    );
  };
}

export default new AppointmentService();
