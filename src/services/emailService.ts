import { Resend } from "resend";

import "dotenv/config";

const resend = new Resend("re_qqaKXqKn_DWDCrmkYcyiv3StYe1iXA1HX");

const emailTemplate = (title: string, content: string, footerLinks: string) => `
<!DOCTYPE html>
<html>
<head> 
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #121212;
      color: #f5f5f5;
      font-family: 'Bricolage Grotesque', sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      border: 1px solid #333;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    }
    .header {
      background-color: #000;
      padding: 24px 0;
      text-align: center;
      border-bottom: 1px solid #333;
    }
    .content {
      background-color: #1a1a1a;
      padding: 32px;
      text-align: left;
      font-size: 16px;
      line-height: 1.6;
    }
    .title {
      font-size: 24px;
      margin-bottom: 24px;
      font-weight: 600;
      text-align: center;
      color: #fff;
    }
    .details {
      background-color: #222;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
      border-left: 4px solid #555;
    }
    .footer {
      background-color: #000;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #888;
      border-top: 1px solid #333;
    }
    .social-links {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 16px;
    }
    p {
      color: #d4d4d4;
      text-decoration: none;
    }  
    a {
      color: #d4d4d4;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    a:hover {
      color: #fff;
      text-decoration: underline;
    }
    .btn {
      display: inline-block;
      background-color: #333;
      color: #fff;
      padding: 10px 20px;
      border-radius: 6px;
      margin-top: 16px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 0.5px;
      transition: background-color 0.3s ease;
    }
    .btn:hover {
      background-color: #444;
      text-decoration: none;
    }
    strong {
      color: #fff;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.sattis.me/sattis-logo.png" alt="Sattis Studio" width="90" />
    </div>
    <div class="content">
      <h2 class="title">${title}</h2>
      <div>${content}</div>
    </div>
    <div class="footer">
      <div>Sattis Studio © ${new Date().getFullYear()}</div>
      <div class="social-links">
        ${footerLinks}
      </div>
    </div>
  </div>
</body>
</html>
`;

export const sendConfirmationEmail = async (
  to: string,
  appointmentDetails: {
    date: string;
    time: string;
    serviceName: string;
    professionalName: string;
    cancelLink: string;
  }
): Promise<void> => {
  const { date, time, serviceName, professionalName, cancelLink } =
    appointmentDetails;
  const subject = "Confirmação de Marcação - Sattis Studio";
  const html = emailTemplate(
    "A marcação foi efetuada!",
    `<p>Olá,</p>
    <p>Sua marcação foi confirmada com sucesso.</p>
    
    <div class="details">
      <p><strong>Data:</strong> ${date}</p>
      <p><strong>Horário:</strong> ${time}</p>
      <p><strong>Serviço:</strong> ${serviceName}</p>
      <p><strong>Profissional:</strong> ${professionalName}</p>
    </div>
    
    <p>Contamos com a sua presença!</p>
    <p>Em caso de imprevistos, pedimos que cancele com até 24h de antecedência.</p>
    <div style="background-color: #222; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #555;">
      <p style="font-size:12px; color: #fff;">
        **Não comparecimento sem aviso prévio de 24 horas ou atrasos superiores a 15 minutos será cobrado 30% do valor do procedimento que faltou para conseguir remarcar novamente.
        </p>
    </div>
    <p>
      Para mais informações ou dúvidas, estamos à disposição!
    </p>
    <br>
    <p>Esperamos por si, <br> Equipa Sattis.</p>

    <div style="text-align: center;">
      <a href="${cancelLink}" class="btn" target="_blank" style="color:#fff; text-decoration:none;">Cancelar Agendamento</a>
    </div>`,
    '<div style="text-align: center;"><a href="https://www.instagram.com/s4ttis" target="_blank" style="color:#888; text-decoration:none; text-align: center;">Instagram </a> | <a href="https://sattis.me" target="_blank" style="color:#888; text-decoration:none; text-align: center;"> Visite nosso site</a></div>'
  );

  await resend.emails.send({
    from: "Sattis Studio <update@sattis.me>",
    to,
    subject,
    html,
  });
};

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
  const subject = "Agendamento Cancelado - Sattis Studio";
  const html = emailTemplate(
    "Seu agendamento foi cancelado",
    `<p>Olá, tudo bem?</p>
    <p>Confirmamos o cancelamento do seu agendamento conforme solicitado.</p>
    
    <div class="details">
      <p><strong>Data:</strong> ${date}</p>
      <p><strong>Horário:</strong> ${time}</p>
      <p><strong>Serviço:</strong> ${serviceName}</p>
      <p><strong>Profissional:</strong> ${professionalName}</p>
    </div>
    
    <p>Esperamos atendê-lo em uma próxima oportunidade.</p>
    <p>Caso deseje agendar novamente, visite nosso site.</p>`,
    '<a href="https://www.instagram.com/s4ttis" target="_blank">Instagram</a> | <a href="https://sattis.me" target="_blank">Site</a>'
  );

  await resend.emails.send({
    from: "Sattis Studio <update@sattis.me>",
    to,
    subject,
    html,
  });
};

export const sendAdminNotificationEmail = async (appointmentDetails: {
  customerName: string;
  date: string;
  time: string;
  serviceName: string;
  professionalName: string;
}): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const { customerName, date, time, serviceName, professionalName } =
    appointmentDetails;
  const subject = "Novo Agendamento - Sattis Studio";
  const html = emailTemplate(
    "Novo agendamento registrado",
    `<p>Um novo agendamento foi registrado no sistema.</p>
    
    <div class="details">
      <p><strong>Cliente:</strong> ${customerName}</p>
      <p><strong>Data:</strong> ${date}</p>
      <p><strong>Horário:</strong> ${time}</p>
      <p><strong>Serviço:</strong> ${serviceName}</p>
      <p><strong>Profissional:</strong> ${professionalName}</p>
    </div>
    
    <p>O cliente já recebeu um email de confirmação automaticamente.</p>`,
    '<a href="https://www.instagram.com/s4ttis" target="_blank">Instagram</a> | <a href="https://sattis.me" target="_blank">Site</a>'
  );

  await resend.emails.send({
    from: "Sattis Studio <update@sattis.me>",
    to: adminEmail,
    subject,
    html,
  });
};
