import AppointmentModel from "../models/appointmentModel";
import ServiceModel, { IService } from "../models/servicesModel";

class ServicesService {
  getAll = async (): Promise<IService[]> => {
    return await ServiceModel.find();
  };

  getAllWithAvailableTimes = async (date: string): Promise<IService[]> => {
    try {
      const services: IService[] = await ServiceModel.find();

      const updatedServices = await Promise.all(
        services.map(async (service) => {
          const bookedAppointments = await AppointmentModel.find({
            serviceId: service._id,
            date: date.trim(),
          });

          const bookedTimes = bookedAppointments.map((appt) => appt.time.trim()); // Normaliza horários

          const availableTimes = service.availableTimes.filter(
            (time) => !bookedTimes.includes(time.trim())
          );

          if (availableTimes.length === 0) return null;

          return {
            ...service.toObject(),
            availableTimes,
          };
        })
      );

      return updatedServices.filter((service) => service !== null) as IService[];
    } catch (error) {
      throw new Error("Failed to get services with available times");
    }
  }

  getById = async (id: string): Promise<IService | null> => {
    return await ServiceModel.findById(id);
  };

  create = async (data: IService): Promise<IService> => {
    return await ServiceModel.create(data);
  };

  update = async (id: string, data: Partial<IService>): Promise<IService | null> => {
    return await ServiceModel.findByIdAndUpdate(id, data, { new: true });
  };

  delete = async (id: string): Promise<IService | null> => {
    return await ServiceModel.findByIdAndDelete(id);
  };
}

export default new ServicesService();
