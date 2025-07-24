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

const AVAILABLE_APPOINTMENT_SLOTS = [
  { start: "09:30", end: "12:30" },
  { start: "14:30", end: "19:45" },
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

    if (!this.isWithinAppointmentHours(time, duration)) {
      throw new Error("Selected time is outside of available appointment hours.");
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

  updateStatus = async (
    id: string,
    status: string
  ): Promise<IAppointment | null> => {
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

  countMissedAppointmentsByEmail = async (customerEmail: string): Promise<number> => {
    return AppointmentModel.countDocuments({
      customerEmail: customerEmail,
      status: "MISSED",
    });
  };

  getByCancelToken = async (token: string): Promise<IAppointment | null> => {
    return AppointmentModel.findOne({ cancelToken: token }).populate("serviceId professionalId");
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

    for (const period of AVAILABLE_APPOINTMENT_SLOTS) {
      const blockStart = this.toMinutes(period.start);
      const blockEnd = this.toMinutes(period.end);
      const lastPossibleStart = this.getLastPossibleStartTime(blockEnd, duration);
      const effectiveBlockEnd = Math.min(blockEnd, lastPossibleStart);

      let cursor = blockStart;

      const blockBusy = busy.filter(i => i.start < blockEnd && i.end > blockStart);

      for (const iv of blockBusy) {
        this.pushSlots(cursor, iv.start, duration, slots, blockBusy, effectiveBlockEnd, apps);
        cursor = iv.end;
      }

      this.pushSlotsIncludingEnd(cursor, effectiveBlockEnd, duration, slots, blockBusy, apps);
    }

    return Array.from(new Set(slots)).sort(
      (a, b) => this.toMinutes(a) - this.toMinutes(b)
    );
  };



  private getLastPossibleStartTime(blockEnd: number, duration: number): number {
    if (duration === 45) return this.toMinutes("19:45");
    if (duration === 60) return this.toMinutes("19:30");
    if (duration < 45) return this.toMinutes("19:30");
    return this.toMinutes("19:30");
  }

  private pushSlots(
    gapStart: number,
    gapEnd: number,
    duration: number,
    slots: string[],
    busy: { start: number; end: number }[],
    maxEnd: number,
    existingAppointments: IAppointment[]
  ) {
    let cursor = gapStart;
    const effectiveEnd = Math.min(gapEnd, maxEnd);

    while (cursor <= effectiveEnd) {
      const timeStr = this.toTimeString(cursor);
      if (
        this.isSlotAvailable(cursor, duration, busy) &&
        !this.hasTimeConflict(existingAppointments, timeStr, duration)
      ) {
        slots.push(timeStr);
      }
      cursor += duration;
    }
  }

  private pushSlotsIncludingEnd(
    gapStart: number,
    gapEnd: number,
    duration: number,
    slots: string[],
    busy: { start: number; end: number }[],
    existingAppointments: IAppointment[]
  ) {
    let cursor = gapStart;
    while (cursor <= gapEnd) {
      const timeStr = this.toTimeString(cursor);
      if (
        this.isSlotAvailable(cursor, duration, busy) &&
        !this.hasTimeConflict(existingAppointments, timeStr, duration)
      ) {
        slots.push(timeStr);
      }
      cursor += duration;
    }
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

  private isSlotAvailable(
    start: number,
    duration: number,
    busy: { start: number; end: number }[]
  ): boolean {
    const end = start + duration;
    return !busy.some(({ start: bStart, end: bEnd }) => !(end <= bStart || start >= bEnd));
  }

  private isWithinAppointmentHours(startTime: string, duration: number): boolean {
    const start = this.toMinutes(startTime);
    return AVAILABLE_APPOINTMENT_SLOTS.some(({ start: s, end: e }) => {
      const sMin = this.toMinutes(s);
      const eMin = this.toMinutes(e);

      if (start < sMin) return false;

      if (sMin === this.toMinutes("14:30")) {
        if (duration === 45 && start > this.toMinutes("19:45")) return false;
        if (duration === 60 && start > this.toMinutes("19:30")) return false;
        if (duration < 45 && start > this.toMinutes("19:30")) return false;
        if (duration > 60 && start > this.toMinutes("19:30")) return false;
      }

      if (sMin === this.toMinutes("09:30") && start > this.toMinutes("12:30")) {
        return false;
      }

      return true;
    });
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  private toTimeString(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }
}

export default new AppointmentService();
