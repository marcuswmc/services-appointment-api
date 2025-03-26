import moment from "moment";
import AppointmentModel from "../models/appointmentModel";
import ServiceModel, { IService } from "../models/servicesModel";


class ServicesService {
  getAll = async (): Promise<IService[]> => {
    return await ServiceModel.find();
  };

  getByCategory = async (categoryId: string): Promise<IService[]> => {
    return await ServiceModel.find({ category: categoryId }).populate("category");
  };
  getAllWithAvailableTimes = async (date: string): Promise<IService[]> => {
    try {
      const services: IService[] = await ServiceModel.find();
      const salonHours = [
        { start: "09:30", end: "12:30" },
        { start: "14:30", end: "19:00" },
      ];

      const updatedServices = await Promise.all(
        services.map(async (service) => {
          const bookedAppointments = await AppointmentModel.find({
            serviceId: service._id,
            date: date.trim(),
          });

          const bookedTimes = bookedAppointments.map((appt) =>
            appt.time.trim()
          );

          const availableTimes: string[] = [];

          salonHours.forEach(({ start, end }) => {
            let currentTime = moment(start, "HH:mm");

            while (currentTime.isBefore(moment(end, "HH:mm"))) {
              const timeStr = currentTime.format("HH:mm");

              const isOverlapping = bookedTimes.some((bookedTime) => {
                const bookedMoment = moment(bookedTime, "HH:mm");
                return (
                  currentTime.isBetween(
                    bookedMoment,
                    bookedMoment.clone().add(service.duration, "minutes"),
                    null,
                    "[)"
                  ) ||
                  bookedMoment.isBetween(
                    currentTime,
                    currentTime.clone().add(service.duration, "minutes"),
                    null,
                    "[)"
                  )
                );
              });

              if (!isOverlapping) {
                availableTimes.push(timeStr);
              }

              currentTime.add(service.duration, "minutes");
            }
          });

          if (availableTimes.length === 0) return null;

          return {
            ...service.toObject(),
            availableTimes,
          };
        })
      );

      return updatedServices.filter(
        (service) => service !== null
      ) as IService[];
    } catch (error) {
      throw new Error("Failed to get services with available times");
    }
  };

  getById = async (id: string): Promise<IService | null> => {
    return await ServiceModel.findById(id);
  };

  create = async (data: IService): Promise<IService> => {
    return await ServiceModel.create(data);
  };

  update = async (
    id: string,
    data: Partial<IService>
  ): Promise<IService | null> => {
    return await ServiceModel.findByIdAndUpdate(id, data, { new: true });
  };

  delete = async (id: string): Promise<IService | null> => {
    return await ServiceModel.findByIdAndDelete(id);
  };
}

export default new ServicesService();
