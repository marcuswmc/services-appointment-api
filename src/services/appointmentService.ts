import AppointmentModel, { IAppointment } from "../models/appointmentModel";
import ServiceModel from "../models/servicesModel";
import ProfessionalModel from "../models/professionalModel";
import { Types } from "mongoose";
import {
  sendConfirmationEmail,
  sendAdminNotificationEmail,
  sendCancellationEmail,
} from "../services/emailService";

class AppointmentService {
  getAll = async (): Promise<IAppointment[]> => {
    return await AppointmentModel.find().populate("serviceId professionalId");
  };

  getById = async (id: string): Promise<IAppointment | null> => {
    return await AppointmentModel.findById(id).populate("serviceId professionalId");
  };

  create = async (appointmentData: IAppointment): Promise<IAppointment> => {
    const { serviceId, professionalId, date, time } = appointmentData;

    // 1. Buscar o serviço para validar os horários disponíveis
    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      throw new Error("Service not found.");
    }

    if (!service.availableTimes.includes(time)) {
      throw new Error("Selected time is not available for this service.");
    }

    // 2. Verificar se o profissional já possui agendamento para esse horário
    const existingAppointment = await AppointmentModel.findOne({
      professionalId: new Types.ObjectId(professionalId),
      date,
      time,
    });
    if (existingAppointment) {
      throw new Error("Professional is already booked for this time.");
    }

    // 3. Buscar o profissional para obter os detalhes (ex.: nome)
    const professional = await ProfessionalModel.findById(professionalId);
    if (!professional) {
      throw new Error("Professional not found.");
    }

    // 4. Criar o agendamento
    const newAppointment = await AppointmentModel.create(appointmentData);

    // Preparar os detalhes do agendamento para o email
    const appointmentDetails = {
      date,
      time,
      serviceName: service.name,
      professionalName: professional.name,
    };

    // 5. Enviar email de confirmação para o cliente
    await sendConfirmationEmail(appointmentData.customerEmail, appointmentDetails);

    // 6. Enviar notificação para o admin
    await sendAdminNotificationEmail({
      customerName: appointmentData.customerName,
      ...appointmentDetails,
    });

    return newAppointment;
  };

  cancel = async (id: string): Promise<IAppointment | null> => {
    // Atualizar o status para "CANCELED" e popular campos do serviço e do profissional
    const canceledAppointment = await AppointmentModel.findByIdAndUpdate(
      id,
      { status: "CANCELED" },
      { new: true }
    ).populate("serviceId professionalId");

    if (canceledAppointment) {
      // Preparar os detalhes do agendamento para o email de cancelamento
      const appointmentDetails = {
        date: canceledAppointment.date,
        time: canceledAppointment.time,
        serviceName: (canceledAppointment.serviceId as any).name,
        professionalName: (canceledAppointment.professionalId as any).name,
      };

      // Enviar email de cancelamento para o cliente
      await sendCancellationEmail(canceledAppointment.customerEmail, appointmentDetails);
    }

    return canceledAppointment;
  };
}

export default new AppointmentService();
