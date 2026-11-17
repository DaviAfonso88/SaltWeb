# Contrato: Interfaces públicas (sem login)

Regras comuns: corpo JSON validado com Zod; limite por IP (Upstash, janela deslizante); campo
honeypot `website` — se preenchido, responde `200 { ok: true }` sem gravar; respostas nunca contêm
dados de outras pessoas (FR-003). Erros: `400` validação (`{ error, fieldErrors }`), `404` evento
inexistente/não publicado, `409` conflito de regra, `429` excesso de envios, `500` erro inesperado
(mensagem genérica).

## POST `/api/inscricoes/[slug]`

Envia inscrição para o evento `slug`.

Request (campos comuns + campos do modelo, ver `data-model.md` → `answers`):

```json
{
  "nome": "Maria Souza",
  "telefone": "(31) 99999-0000",
  "email": "maria@exemplo.com",
  "respostas": { "...": "conforme o modelo do evento" },
  "website": ""
}
```

Responses:

- `201 { "numero": 42, "valorFinalCentavos": 28500, "parcelas": [...], "resumo": {...} }` — só dados
  da própria inscrição, para a tela de sucesso.
- `409 { "error": "duplicada" }` — mesmo nome e telefone já inscritos no evento.
- `409 { "error": "encerrada" }` — inscrições fechadas, data limite passada ou evento não publicado.
- `409 { "error": "sem_vagas", "itens": ["Torresmo"], "disponibilidade": { "itens": [...], "vagasContribuicao": 3 } }`
  — item de alimento ou vaga de contribuição esgotados no momento do envio; devolve a
  disponibilidade atualizada (só contagens, sem dados pessoais) para o formulário se atualizar.
- Limite: 5 envios/min por IP.

Regras: o valor é recalculado no servidor (lote vigente no envio); o modelo do evento define o
schema de `respostas`; número sequencial por evento gerado na transação.

Todo formulário exibe o aviso de privacidade (FR-021a), componente `components/forms/PrivacyNotice`.

Disponibilidade da Festa (itens e vagas restantes) é calculada pelo servidor na renderização de
`/eventos/[slug]` e passada ao formulário; não há rota pública de leitura (constituição §I).

## POST `/api/contact`

```json
{ "nome": "João", "email": "joao@exemplo.com", "mensagem": "...", "website": "" }
```

`200 { "ok": true }` sempre que a mensagem for gravada, mesmo se o e-mail falhar (FR-041).
Limite: 3/min por IP (mantido).

## POST `/api/servir`

```json
{ "nome": "Ana", "whatsapp": "(31) 98888-0000", "ministerio": "Louvor", "website": "" }
```

Mesmo comportamento de `/api/contact`.

## GET `/imagens/eventos/[id]`

Rota de **conteúdo estático público** (equivalente a um arquivo em `public/`), não de dados: só
serve imagens que o editor publicou junto com o evento. Bytes da imagem com `Content-Type` original e
`Cache-Control: public, max-age=31536000, immutable`. `404` se não existir. Só serve imagens de
eventos (dado público).

## Páginas públicas (Server Components)

| Rota | Fonte |
|---|---|
| `/` | evento em destaque + próximos eventos (cache tag `eventos`) |
| `/sobre`, `/podcast`, `/contribua` | conteúdo estático (redesign) |
| `/eventos` | eventos publicados futuros (tag `eventos`) |
| `/eventos/[slug]` | detalhe + formulário do modelo (tag `eventos`); 404 amigável se não publicado |
| `/devocional` | devocionais publicados (tag `devocionais`); filtro/busca no cliente |

Redirecionamentos permanentes (`next.config.ts`): `/acampa-salt` → `/eventos/acampa-salt-2026`;
`/festa-na-roca` e `/projeto-missionario` → `/eventos`.
