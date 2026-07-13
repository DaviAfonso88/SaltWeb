import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import {
  deleteParticipant,
  getParticipantById,
  updateParticipant,
} from "@/lib/participant/storage";
import { Participant } from "@/lib/participant/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const target = await getParticipantById(id);

    if (!target) {
      return NextResponse.json(
        { error: "Participante de destino não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { sourceId } = body;

    if (!sourceId) {
      return NextResponse.json(
        { error: "ID do participante fonte é obrigatório" },
        { status: 400 }
      );
    }

    const source = await getParticipantById(sourceId);
    if (!source) {
      return NextResponse.json(
        { error: "Participante fonte não encontrado" },
        { status: 404 }
      );
    }

    const merged: Participant = {
      ...target,
      nome: target.nome || source.nome,
      sexo: target.sexo || source.sexo,
      dataNascimento: target.dataNascimento || source.dataNascimento,
      idade: target.idade ?? source.idade ?? null,
      cpf: target.cpf || source.cpf,
      rg: target.rg || source.rg,
      igreja: target.igreja || source.igreja,
      cidade: target.cidade || source.cidade,
      endereco: target.endereco || source.endereco,
      celular: target.celular || source.celular,
      whatsapp: target.whatsapp || source.whatsapp,
      email: target.email || source.email,
      foto: target.foto || source.foto,

      responsaveis: [
        ...target.responsaveis,
        ...source.responsaveis.filter(
          (sr) =>
            !target.responsaveis.some(
              (tr) => tr.nome.toLowerCase() === sr.nome.toLowerCase()
            )
        ),
      ],

      saude: {
        alergias: [
          ...new Set([...target.saude.alergias, ...source.saude.alergias]),
        ],
        medicamentos: [
          ...new Set([...target.saude.medicamentos, ...source.saude.medicamentos]),
        ],
        condicoes: [
          ...new Set([...target.saude.condicoes, ...source.saude.condicoes]),
        ],
        restricoesAlimentares: [
          ...new Set([
            ...target.saude.restricoesAlimentares,
            ...source.saude.restricoesAlimentares,
          ]),
        ],
        observacoesMedicas: [
          ...new Set([
            ...target.saude.observacoesMedicas,
            ...source.saude.observacoesMedicas,
          ]),
        ],
        necessidadesEspeciais:
          target.saude.necessidadesEspeciais || source.saude.necessidadesEspeciais,
      },

      observacoes: [
        ...target.observacoes,
        ...source.observacoes,
      ],

      historico: [
        ...target.historico,
        {
          id: crypto.randomUUID(),
          campo: "fusão",
          valorAnterior: `Participante ${source.numero} (${source.nome})`,
          valorNovo: `Mesclado com ${target.numero} (${target.nome})`,
          autor: session.displayName,
          createdAt: new Date().toISOString(),
        },
      ],

      fontes: [...new Set([...target.fontes, ...source.fontes])],

      anexos: [...target.anexos, ...source.anexos],

      updatedAt: new Date().toISOString(),
    };

    await updateParticipant(merged);
    await deleteParticipant(sourceId);

    return NextResponse.json(merged);
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
