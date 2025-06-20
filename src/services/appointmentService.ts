// Atualizado: appointmentService.ts

import AppointmentModel, { IAppointment } from "../models/appointmentModel";
import ServiceModel from "../models/servicesModel";
import ProfessionalModel from "../models/professionalModel";
import { Types } from "mongoose";
import {
  sendConfirmationEmail,
  sendAdminNotificationEmail,
  sendCancellationEmail,
  sendFailedBookingEmail,
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

    if (!this.isWithinSalonHours(time, duration)) {
      throw new Error("Selected time is outside of salon working hours.");
    }

    const existing = await AppointmentModel.find({
      professionalId: new Types.ObjectId(professionalId),
      date,
      status: "CONFIRMED",
    }).populate("serviceId");

    if (this.hasTimeConflict(existing, time, duration)) {
      throw new Error("Professional is already booked for this time.");
    }

    const professional = await ProfessionalModel.findById(professionalId);
    if (!professional) throw new Error("Professional not found.");

    // Verificação final antes de salvar
    const updatedExisting = await AppointmentModel.find({
      professionalId: new Types.ObjectId(professionalId),
      date,
      status: "CONFIRMED",
    }).populate("serviceId");

    if (this.hasTimeConflict(updatedExisting, time, duration)) {
      await sendFailedBookingEmail(customerEmail, {
        date,
        time,
        professionalName: professional.name,
      });
      throw new Error("Time slot has been taken while processing. User notified via email.");
    }

    const appointment = await AppointmentModel.create(data);
    appointment.cancelToken = new Types.ObjectId();
    await appointment.save();

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

  getByCancelToken = async (token: string): Promise<IAppointment | null> => {
    return AppointmentModel.findOne({ cancelToken: token }).populate(
      "serviceId professionalId"
    );
  };

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

  computeAvailableSlots = async (
    professionalId: string,
    serviceId: string,
    date: string
  ): Promise<string[]> => {
    const service = await ServiceModel.findById(serviceId);
    if (!service) throw new Error("Service not found");
    const duration = service.duration;

    const apps = await AppointmentModel.find({
      professionalId: new Types.ObjectId(professionalId),
      date,
      status: "CONFIRMED",
    }).populate("serviceId");

    const busy = apps
      .map((appt) => {
        const d = (appt.serviceId as any).duration as number;
        const start = this.toMinutes(appt.time);
        return { start, end: start + d };
      })
      .sort((a, b) => a.start - b.start);

    const slots: string[] = [];

    for (const period of SALON_HOURS) {
      const blockStart = this.toMinutes(period.start);
      const blockEnd = this.toMinutes(period.end);
      let cursor = blockStart;

      const blockBusy = busy
        .filter((i) => i.start < blockEnd && i.end > blockStart)
        .map((i) => ({
          start: Math.max(i.start, blockStart),
          end: Math.min(i.end, blockEnd),
        }));

      for (const iv of blockBusy) {
        this.pushSlots(cursor, iv.start, duration, slots);
        cursor = iv.end;
      }
      this.pushSlotsIncludingEnd(cursor, blockEnd, duration, slots);
    }

    const finalSlots = Array.from(new Set(slots)).sort((a, b) =>
      this.toMinutes(a) - this.toMinutes(b)
    );
    return finalSlots;
  };

  private pushSlots(gapStart: number, gapEnd: number, duration: number, slots: string[]) {
    let cursor = gapStart;
    while (cursor < gapEnd) {
      if (cursor + duration <= gapEnd) {
        slots.push(this.toTimeString(cursor));
      }
      cursor += duration;
    }
  }

  private pushSlotsIncludingEnd(
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
    return SALON_HOURS.some(({ start: s, end: e }) => {
      const sMin = this.toMinutes(s);
      const eMin = this.toMinutes(e);
      return start >= sMin && start <= eMin;
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
    const [h, m] = time.split(":" ).map(Number);
    return h * 60 + m;
  }

  private toTimeString(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }
}

export default new AppointmentService();
