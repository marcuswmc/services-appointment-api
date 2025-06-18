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
    return AppointmentModel.find().populate("serviceId professionalId");
  };

  getById = async (id: string): Promise<IAppointment | null> => {
    return AppointmentModel.findById(id).populate("serviceId professionalId");
  };

  create = async (data: IAppointment): Promise<IAppointment> => {
    const { serviceId, professionalId, date, time, customerEmail, customerName } = data;

    const service = await ServiceModel.findById(serviceId);
    if (!service) throw new Error("Service not found.");
    const duration = service.duration;

    // Verifica se o horário cabe no funcionamento
    if (!this.isWithinSalonHours(time, duration)) {
      throw new Error("Selected time is outside of salon working hours.");
    }

    // Busca agendamentos confirmados do profissional nesse dia
    const existing = await AppointmentModel.find({
      professionalId: new Types.ObjectId(professionalId),
      date,
      status: "CONFIRMED",
    }).populate("serviceId");

    // Verifica conflito de horários
    if (this.hasTimeConflict(existing, time, duration)) {
      throw new Error("Professional is already booked for this time.");
    }

    // Verifica existência do profissional
    const professional = await ProfessionalModel.findById(professionalId);
    if (!professional) throw new Error("Professional not found.");

    // Cria e salva o agendamento
    const appointment = await AppointmentModel.create(data);
    appointment.cancelToken = new Types.ObjectId();
    await appointment.save();

    // Prepara envio de emails
    const cancelLink = `https://sattis.me/cancel/${appointment.cancelToken}`;
    const details = {
      date,
      time,
      serviceName: service.name,
      professionalName: professional.name,
      cancelLink,
    };
    await sendConfirmationEmail(customerEmail, details);
    await sendAdminNotificationEmail({ customerName, ...details });

    return appointment;
  };

  // Atualiza status (CANCELED ou FINISHED)
  updateStatus = async (id: string, status: string): Promise<IAppointment | null> => {
    const updated = await AppointmentModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("serviceId professionalId");
    if (!updated) return null;

    if (status === "CANCELED") {
      const details = {
        date: updated.date,
        time: updated.time,
        serviceName: (updated.serviceId as any).name,
        professionalName: (updated.professionalId as any).name,
      };
      await sendCancellationEmail(updated.customerEmail, details);
    }
    return updated;
  };

  // Retorna agendamento por token de cancelamento
  getByCancelToken = async (token: string): Promise<IAppointment | null> => {
    return AppointmentModel.findOne({ cancelToken: token }).populate(
      "serviceId professionalId"
    );
  };

  // Cancela agendamento por token
  cancelByToken = async (token: string): Promise<IAppointment | null> => {
    const appt = await AppointmentModel.findOneAndUpdate(
      { cancelToken: token, status: "CONFIRMED" },
      { status: "CANCELED" },
      { new: true }
    ).populate("serviceId professionalId");
    if (!appt) return null;

    const details = {
      date: appt.date,
      time: appt.time,
      serviceName: (appt.serviceId as any).name,
      professionalName: (appt.professionalId as any).name,
    };
    await sendCancellationEmail(appt.customerEmail, details);
    return appt;
  };

  /**
   * Computa slots disponíveis para um profissional e serviço em um dia,
   * respeitando duração dos serviços agendados e horários do salão.
   * Os slots são gerados com intervalo igual à duração do serviço solicitado.
   * Permite agendamento até o horário final de funcionamento, independente da duração.
   */
  computeAvailableSlots = async (
    professionalId: string,
    serviceId: string,
    date: string
  ): Promise<string[]> => {
    // Duração do serviço a agendar
    const service = await ServiceModel.findById(serviceId);
    if (!service) throw new Error("Service not found");
    const duration = service.duration;

    // Agendamentos confirmados do profissional nesse dia
    const apps = await AppointmentModel.find({
      professionalId: new Types.ObjectId(professionalId),
      date,
      status: "CONFIRMED",
    }).populate("serviceId");

    // Constrói intervalos ocupados
    const busy = apps
      .map((appt) => {
        const d = (appt.serviceId as any).duration as number;
        const start = this.toMinutes(appt.time);
        return { start, end: start + d };
      })
      .sort((a, b) => a.start - b.start);

    const slots: string[] = [];

    // Para cada período de funcionamento
    for (const period of SALON_HOURS) {
      const blockStart = this.toMinutes(period.start);
      const blockEnd = this.toMinutes(period.end);
      let cursor = blockStart;

      // Filtra ocupações neste bloco
      const blockBusy = busy
        .filter((i) => i.end > blockStart && i.start < blockEnd)
        .map((i) => ({
          start: Math.max(i.start, blockStart),
          end: Math.min(i.end, blockEnd),
        }));

      // Gera slots antes, entre e depois dos intervalos
      for (const iv of blockBusy) {
        this.pushSlots(cursor, iv.start, duration, slots);
        cursor = iv.end; // Removido o STEP_MINUTES, agora vai direto para o final
      }
      this.pushSlots(cursor, blockEnd, duration, slots);
    }

    // Remove duplicatas e ordena
    return Array.from(new Set(slots)).sort((a, b) =>
      this.toMinutes(a) - this.toMinutes(b)
    );
  };

  // Gera slots entre gapStart e gapEnd, avançando pela duração do serviço
  // Permite agendamento até o horário final de funcionamento
  private pushSlots(
    gapStart: number,
    gapEnd: number,
    duration: number,
    slots: string[]
  ) {
    let cursor = gapStart;
    while (cursor <= gapEnd) {
      slots.push(this.toTimeString(cursor));
      cursor += duration;
    }
  }

  private isWithinSalonHours(startTime: string, duration: number): boolean {
    const start = this.toMinutes(startTime);
    const end = start + duration;
    return SALON_HOURS.some(({ start: s, end: e }) => {
      const sMin = this.toMinutes(s);
      const eMin = this.toMinutes(e);
      return start >= sMin && end <= eMin;
    });
  }

  private hasTimeConflict(
    appts: IAppointment[],
    newTime: string,
    newDur: number
  ): boolean {
    const start = this.toMinutes(newTime);
    const end = start + newDur;
    return appts.some((appt) => {
      const d = (appt.serviceId as any).duration as number;
      const s = this.toMinutes(appt.time);
      const e = s + d;
      return !(end <= s || start >= e);
    });
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  private toTimeString(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}`;
  }
}

export default new AppointmentService();