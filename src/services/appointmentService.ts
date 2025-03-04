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
  
    // 2. Verificar se o profissional já está agendado para este horário, mas ignorar os agendamentos com status 'FINISHED' ou 'CANCELED'
    const existingAppointment = await AppointmentModel.findOne({
      professionalId: new Types.ObjectId(professionalId),
      date,
      time,
      status: "CONFIRMED"
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
  
  

  updateStatus = async (id: string, status: string): Promise<IAppointment | null> => {
    const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("serviceId professionalId");
  
    if (!updatedAppointment) {
      return null;
    }
  
    const service = await ServiceModel.findById(updatedAppointment.serviceId);
    if (!service) {
      throw new Error("Service not found.");
    }
  
    // Se o status for "CANCELED" ou "FINISHED", liberar o horário novamente
    if (status === "CANCELED" || status === "FINISHED") {
      // Remover o horário da lista de availableTimes quando ele for confirmado
      const timeIndex = service.availableTimes.indexOf(updatedAppointment.time);
      
      if (timeIndex === -1) {
        // Se o horário não está na lista, significa que ainda não foi liberado, então podemos adicioná-lo
        service.availableTimes.push(updatedAppointment.time);
      } else {
        // Se o horário já está na lista, ele já foi liberado, portanto não precisa fazer nada
      }
      
      await service.save();
    }
  
    // Se o status for "CANCELED", enviar email de cancelamento
    if (status === "CANCELED") {
      const appointmentDetails = {
        date: updatedAppointment.date,
        time: updatedAppointment.time,
        serviceName: (updatedAppointment.serviceId as any).name,
        professionalName: (updatedAppointment.professionalId as any).name,
      };
  
      await sendCancellationEmail(updatedAppointment.customerEmail, appointmentDetails);
    }
  
    return updatedAppointment;
  };
  
  
}

export default new AppointmentService();
