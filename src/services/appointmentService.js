"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appointmentModel_1 = __importDefault(require("../models/appointmentModel"));
const servicesModel_1 = __importDefault(require("../models/servicesModel"));
const professionalModel_1 = __importDefault(require("../models/professionalModel"));
const mongoose_1 = require("mongoose");
const emailService_1 = require("../services/emailService");
class AppointmentService {
    constructor() {
        this.getAll = () => __awaiter(this, void 0, void 0, function* () {
            return yield appointmentModel_1.default.find().populate("serviceId professionalId");
        });
        this.getById = (id) => __awaiter(this, void 0, void 0, function* () {
            return yield appointmentModel_1.default.findById(id).populate("serviceId professionalId");
        });
        this.create = (appointmentData) => __awaiter(this, void 0, void 0, function* () {
            const { serviceId, professionalId, date, time } = appointmentData;
            // 1. Buscar o serviço para validar os horários disponíveis
            const service = yield servicesModel_1.default.findById(serviceId);
            if (!service) {
                throw new Error("Service not found.");
            }
            if (!service.availableTimes.includes(time)) {
                throw new Error("Selected time is not available for this service.");
            }
            // 2. Verificar se o profissional já está agendado para este horário, mas ignorar os agendamentos com status 'FINISHED' ou 'CANCELED'
            const existingAppointment = yield appointmentModel_1.default.findOne({
                professionalId: new mongoose_1.Types.ObjectId(professionalId),
                date,
                time,
                status: "CONFIRMED"
            });
            if (existingAppointment) {
                throw new Error("Professional is already booked for this time.");
            }
            // 3. Buscar o profissional para obter os detalhes (ex.: nome)
            const professional = yield professionalModel_1.default.findById(professionalId);
            if (!professional) {
                throw new Error("Professional not found.");
            }
            // 4. Criar o agendamento
            const newAppointment = yield appointmentModel_1.default.create(appointmentData);
            // Preparar os detalhes do agendamento para o email
            const appointmentDetails = {
                date,
                time,
                serviceName: service.name,
                professionalName: professional.name,
            };
            // 5. Enviar email de confirmação para o cliente
            yield (0, emailService_1.sendConfirmationEmail)(appointmentData.customerEmail, appointmentDetails);
            // 6. Enviar notificação para o admin
            yield (0, emailService_1.sendAdminNotificationEmail)(Object.assign({ customerName: appointmentData.customerName }, appointmentDetails));
            return newAppointment;
        });
        this.updateStatus = (id, status) => __awaiter(this, void 0, void 0, function* () {
            const updatedAppointment = yield appointmentModel_1.default.findByIdAndUpdate(id, { status }, { new: true }).populate("serviceId professionalId");
            if (!updatedAppointment) {
                return null;
            }
            const service = yield servicesModel_1.default.findById(updatedAppointment.serviceId);
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
                }
                else {
                    // Se o horário já está na lista, ele já foi liberado, portanto não precisa fazer nada
                }
                yield service.save();
            }
            // Se o status for "CANCELED", enviar email de cancelamento
            if (status === "CANCELED") {
                const appointmentDetails = {
                    date: updatedAppointment.date,
                    time: updatedAppointment.time,
                    serviceName: updatedAppointment.serviceId.name,
                    professionalName: updatedAppointment.professionalId.name,
                };
                yield (0, emailService_1.sendCancellationEmail)(updatedAppointment.customerEmail, appointmentDetails);
            }
            return updatedAppointment;
        });
    }
}
exports.default = new AppointmentService();
