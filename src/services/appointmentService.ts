import AppointmentModel, { IAppointment } from "../models/appointmentModel";
import ServiceModel from "../models/servicesModel";
import ProfessionalModel from "../models/professionalModel";
import { Types } from "mongoose";
import {
  sendConfirmationEmail,
  sendAdminNotificationEmail,
  sendCancellationEmail,
} from "../services/emailService";

const SALON_HOURS = [
  { start: "09:30", end: "12:30" },
  { start: "14:30", end: "19:00" },
];

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

    const duration = service.duration;

    if (!this.isWithinSalonHours(time, duration)) {
      throw new Error("Selected time is outside of salon working hours.");
    }

    const existingAppointments = await AppointmentModel.find({
      professionalId: new Types.ObjectId(professionalId),
      date,
      status: "CONFIRMED",
    });

    if (this.hasTimeConflict(existingAppointments, time, duration)) {
      throw new Error("Professional is already booked for this time.");
    }

    const professional = await ProfessionalModel.findById(professionalId);
    if (!professional) {
      throw new Error("Professional not found.");
    }

    const newAppointment = await AppointmentModel.create(appointmentData);

    const cancelToken = new Types.ObjectId();
    newAppointment.cancelToken = cancelToken;
    await newAppointment.save();

    const cancelLink = `https://sattis.me/cancel/${cancelToken}`;

    const appointmentDetails = {
      date,
      time,
      serviceName: service.name,
      professionalName: professional.name,
      cancelLink, 
    };

    await sendConfirmationEmail(
      appointmentData.customerEmail,
      appointmentDetails
    );

    await sendAdminNotificationEmail({
      customerName: appointmentData.customerName,
      ...appointmentDetails,
    });

    return newAppointment;
  };

  getByCancelToken = async (token: string): Promise<IAppointment | null> => {
    return await AppointmentModel.findOne({ cancelToken: token }).populate("serviceId professionalId");
  };
  
  cancelByToken = async (token: string): Promise<IAppointment | null> => {
    const appointment = await AppointmentModel.findOneAndUpdate(
      { cancelToken: token, status: "CONFIRMED" },
      { status: "CANCELED" },
      { new: true }
    ).populate("serviceId professionalId");
  
    if (!appointment) return null;
  
    const appointmentDetails = {
      date: appointment.date,
      time: appointment.time,
      serviceName: (appointment.serviceId as any).name,
      professionalName: (appointment.professionalId as any).name,
    };
  
    await sendCancellationEmail(appointment.customerEmail, appointmentDetails);
  
    return appointment;
  };
  

  updateStatus = async (
    id: string,
    status: string
  ): Promise<IAppointment | null> => {
    const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("serviceId professionalId");

    if (!updatedAppointment) {
      return null;
    }

    if (status === "CANCELED") {
      const appointmentDetails = {
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        serviceName: (updatedAppointment.serviceId as any).name,
        professionalName: (updatedAppointment.professionalId as any).name,
      };

      await sendCancellationEmail(
        updatedAppointment.customerEmail,
        appointmentDetails
      );
    }

    return updatedAppointment;
  };

  private isWithinSalonHours(startTime: string, duration: number): boolean {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const endTime = this.addMinutesToTime(startTime, duration);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    return SALON_HOURS.some(({ start, end }) => {
      const [salonStartHour, salonStartMinute] = start.split(":").map(Number);
      const [salonEndHour, salonEndMinute] = end.split(":").map(Number);

      return (
        (startHour > salonStartHour ||
          (startHour === salonStartHour && startMinute >= salonStartMinute)) &&
        (endHour < salonEndHour ||
          (endHour === salonEndHour && endMinute <= salonEndMinute))
      );
    });
  }

  private hasTimeConflict(
    appointments: IAppointment[],
    newStartTime: string,
    duration: number
  ): boolean {
    const newEndTime = this.addMinutesToTime(newStartTime, duration);

    return appointments.some((appointment) => {
      const appointmentStartTime = appointment.time;
      const appointmentEndTime = this.addMinutesToTime(
        appointmentStartTime,
        duration
      );

      return !(
        newEndTime <= appointmentStartTime || newStartTime >= appointmentEndTime
      );
    });
  }

  private addMinutesToTime(time: string, minutesToAdd: number): string {
    const [hour, minute] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute + minutesToAdd);
    return date.toTimeString().slice(0, 5);
  }
}

export default new AppointmentService();
