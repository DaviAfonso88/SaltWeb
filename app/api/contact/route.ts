import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Email validation regex (basic)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    // 1. Basic Validation
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Nome é obrigatório." },
        { status: 400 }
      );
    }
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { message: "E-mail é obrigatório e deve ser válido." },
        { status: 400 }
      );
    }
    if (!message || message.trim() === "") {
      return NextResponse.json(
        { message: "Mensagem é obrigatória." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: process.env.EMAIL_PORT === "465",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Email Content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "juventudesalt@pibls.com",
      subject: `Novo Contato do Site - ${name}`,
      html: `
        <p>Você recebeu uma nova mensagem do formulário de contato do site:</p>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensagem:</strong> ${message}</p>
        <br/>
        <p>Responder para: ${email}</p>
      `,
    };

    // 4. Send Email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Mensagem enviada com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return NextResponse.json(
      { message: "Falha ao enviar mensagem." },
      { status: 500 }
    );
  }
}
