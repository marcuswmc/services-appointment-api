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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminNotificationEmail = exports.sendCancellationEmail = exports.sendConfirmationEmail = void 0;
const resend_1 = require("resend");
require("dotenv/config");
const resend = new resend_1.Resend("re_qqaKXqKn_DWDCrmkYcyiv3StYe1iXA1HX");
const sendConfirmationEmail = (to, appointmentDetails) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, time, serviceName, professionalName } = appointmentDetails;
    const subject = "Confirmação de Agendamento - Sattis Studio";
    const text = `Olá,
Seu agendamento foi confirmado para o dia ${date} às ${time}.
Serviço: ${serviceName}
Profissional: ${professionalName}`;
    yield resend.emails.send({
        from: "Sattis Studio <onboarding@resend.dev>",
        to,
        subject,
        text,
    });
});
exports.sendConfirmationEmail = sendConfirmationEmail;
// Função para enviar email de cancelamento de agendamento para o cliente
const sendCancellationEmail = (to, appointmentDetails) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, time, serviceName, professionalName } = appointmentDetails;
    const subject = "Agendamento Cancelado";
    const text = `Olá,
Seu agendamento para o dia ${date} às ${time} foi cancelado.
Serviço: ${serviceName}
Profissional: ${professionalName}`;
    yield resend.emails.send({
        from: "Sattis Studio <onboarding@resend.dev>",
        to,
        subject,
        text,
    });
});
exports.sendCancellationEmail = sendCancellationEmail;
// Função para enviar notificação de novo agendamento para o admin
const sendAdminNotificationEmail = (appointmentDetails) => __awaiter(void 0, void 0, void 0, function* () {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail)
        return;
    const { customerName, date, time, serviceName, professionalName } = appointmentDetails;
    const subject = "Novo Agendamento Criado";
    const text = `Um novo agendamento foi criado:
Cliente: ${customerName}
Data: ${date}
Hora: ${time}
Serviço: ${serviceName}
Profissional: ${professionalName}`;
    yield resend.emails.send({
        from: "Sattis Studio <onboarding@resend.dev>",
        to: adminEmail,
        subject,
        text,
    });
});
exports.sendAdminNotificationEmail = sendAdminNotificationEmail;
