import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendConfirmationEmail = async (
  to: string,
  appointmentDetails: {
    date: string;
    time: string;
    serviceName: string;
    professionalName: string;
  }
): Promise<void> => {
  const { date, time, serviceName, professionalName } = appointmentDetails;
  const subject = "Confirmação de Agendamento - Sattis Studio";
  const text = `Olá,
Seu agendamento foi confirmado para o dia ${date} às ${time}.
Serviço: ${serviceName}
Profissional: ${professionalName}`;

  await resend.emails.send({
    from: "Sattis Studio <onboarding@resend.dev>",
    to,
    subject,
    text,
  });
};

// Função para enviar email de cancelamento de agendamento para o cliente
export const sendCancellationEmail = async (
  to: string,
  appointmentDetails: {
    date: string;
    time: string;
    serviceName: string;
    professionalName: string;
  }
): Promise<void> => {
  const { date, time, serviceName, professionalName } = appointmentDetails;
  const subject = "Agendamento Cancelado";
  const text = `Olá,
Seu agendamento para o dia ${date} às ${time} foi cancelado.
Serviço: ${serviceName}
Profissional: ${professionalName}`;

  await resend.emails.send({
    from: "Sattis Studio <onboarding@resend.dev>",
    to,
    subject,
    text,
  });
};

// Função para enviar notificação de novo agendamento para o admin
export const sendAdminNotificationEmail = async (
  appointmentDetails: {
    customerName: string;
    date: string;
    time: string;
    serviceName: string;
    professionalName: string;
  }
): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const { customerName, date, time, serviceName, professionalName } = appointmentDetails;
  const subject = "Novo Agendamento Criado";
  const text = `Um novo agendamento foi criado:
Cliente: ${customerName}
Data: ${date}
Hora: ${time}
Serviço: ${serviceName}
Profissional: ${professionalName}`;

  await resend.emails.send({
    from: "Sattis Studio <onboarding@resend.dev>",
    to: adminEmail,
    subject,
    text,
  });
};
