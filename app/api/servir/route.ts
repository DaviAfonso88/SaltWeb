import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/; 

export async function POST(req: NextRequest) {
  try {
    const { name, phone, ministry } = await req.json();

    // Validation
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Nome é obrigatório." },
        { status: 400 }
      );
    }
    if (!phone || !phoneRegex.test(phone)) {
      return NextResponse.json(
        { message: "Telefone é obrigatório e deve ser válido." },
        { status: 400 }
      );
    }
    if (!ministry || ministry.trim() === "") {
      return NextResponse.json(
        { message: "Ministério é obrigatório." },
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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "juventudesalt@pibls.com", // Or a specific email for ministry sign-ups
      subject: `Novo Voluntário para Ministério - ${name}`,
      html: `
        <p>Um novo voluntário se inscreveu para servir em um ministério:</p>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Telefone:</strong> ${phone}</p>
        <p><strong>Ministério de Interesse:</strong> ${ministry}</p>
        <br/>
        <p>Entre em contato com o líder do ministério sobre o novo voluntário: ${name}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Inscrição enviada com sucesso! Em breve entraremos em contato." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao enviar e-mail de voluntariado:", error);
    return NextResponse.json(
      { message: "Falha ao enviar inscrição." },
      { status: 500 }
    );
  }
}
