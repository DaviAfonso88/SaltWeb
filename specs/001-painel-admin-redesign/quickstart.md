# Quickstart: Painel administrativo, segurança e redesign do site

Roteiro de preparação e de **validação manual** (o projeto não tem testes automatizados — ver
constituição). Cada bloco valida uma história da spec.

## 1. Preparação

1. Criar um projeto no Neon (região próxima da Vercel, ex.: `aws-us-east-1` ou `sa-east-1`).
   Usar uma **branch de desenvolvimento** do Neon para testes locais.
2. Variáveis de ambiente (`.env.local`, nunca commitado; na Vercel em *Settings → Environment
   Variables*):

   | Variável | Uso |
   |---|---|
   | `DATABASE_URL` | string de conexão do Neon (com `sslmode=require`) |
   | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | rate limit (já existentes) |
   | `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | avisos por e-mail (já existentes) |
   | `SETUP_TOKEN` | código exigido na configuração inicial (FR-007); pode ser removido depois |

3. Instalar e preparar o banco:

   ```bash
   npm install
   npm run db:migrate     # aplica drizzle/*.sql
   npm run db:seed        # papéis padrão, evento Acampa SALT 2026, 24 devocionais (idempotente)
   npm run dev
   ```

4. Abrir `http://localhost:3000/painel/setup`, informar o `SETUP_TOKEN` e criar o primeiro
   administrador.

## 2. Validação por história

### US1 — Áreas fechadas (P1)

- Em janela anônima, abrir `/painel`, `/painel/inscricoes`, `/painel/participantes`: deve ir para
  `/painel/login`.
- `curl -i http://localhost:3000/api/painel/inscricoes/export?format=csv` → `401`.
- Confirmar que `/admin-camp`, `/admin-acampa-salt`, `/admin-festa-na-roca`,
  `/admin-projeto-missionario`, `/api/acampa-salt/list`, `/api/festa-na-roca/list`,
  `/api/projeto-missionario/list`, `/api/camp-admin/*` respondem `404`.
- Com um usuário "Editor de conteúdo", abrir `/painel/inscricoes` → acesso negado e registro em
  `/painel/auditoria` (ver com o administrador).

### US2 — Usuários e permissões (P1)

- `/painel/setup` depois do primeiro admin → indisponível.
- Criar usuário "Editor de conteúdo" com senha provisória; entrar com ele → obrigado a trocar a
  senha; o menu mostra só Eventos e Devocionais.
- Criar papel "Coordenação" com `inscricoes.ver` + `inscricoes.exportar`; usuário com ele vê e
  exporta, mas não tem botões de status/exclusão (e a action responde erro se chamada).
- Tentar desativar o único administrador → bloqueado com explicação.
- Errar a senha 5 vezes → conta bloqueada por 15 min; auditoria registra.
- Desativar um usuário logado em outra janela → a próxima ação dele vai para o login.

### US3 — Inscrições (P2)

- Com o evento Acampa SALT 2026 publicado e inscrições abertas, inscrever-se em
  `/eventos/acampa-salt-2026` pelo celular (DevTools 360 px) em < 3 min; ver número e valor.
- Repetir com o mesmo nome e telefone → aviso de duplicada.
- No painel (Equipe de inscrições): buscar por parte do nome; confirmar; marcar parcela paga;
  conferir histórico; exportar CSV (abre no Excel com acentos) e PDF.
- Fechar inscrições → página pública mostra encerramento e o envio retorna `409`.

### US4 — Eventos (P2)

- Criar evento em rascunho com imagem (JPG ≤ 5 MB, texto alternativo) → não aparece em
  `/eventos`. Publicar → aparece em até 1 min, ordenado por data. Marcar destaque → aparece na
  página inicial.
- Enviar imagem de 6 MB ou `.gif` → erro claro.
- Modelo Festa: configurar 2 itens com quantidade 1; inscrever-se pegando um item; o item some da
  lista; tentar de novo em outra aba com a lista antiga → `409 sem_vagas`.
- Tentar trocar o modelo após a 1ª inscrição → bloqueado. Tentar excluir evento com inscrições →
  só arquivar.
- Alterar valor de um lote → novas inscrições usam o novo valor; antigas mantêm.

### US5 — Redesign (P2)

- Comparar cada página com o canvas "SALT — Redesign do site" em 360 px e 1440 px.
- Sem rolagem horizontal em 360 px; botões ≥ 44 px; navegação por teclado com foco visível.
- Contribua: "Copiar" chave Pix mostra confirmação. Início: mapa e "copiar endereço" funcionam.
- Devocional: busca por título e filtro por mês; sem resultados → "Limpar filtros".

### US6 — Devocionais (P3)

- `/painel/devocionais` já lista os 24 importados.
- Criar e publicar um novo → aparece primeiro em `/devocional`. Despublicar → some.
- Link inválido → erro de validação.

### US7 — Mensagens (P3)

- Enviar Contato e "Quero servir" → aparecem como novas; contador na barra lateral.
- Com e-mail desconfigurado (`EMAIL_HOST` inválido no `.env.local`), enviar contato → visitante vê
  sucesso; mensagem está no painel com indicação de e-mail não enviado.
- Filtrar por tipo/status; arquivar; excluir (auditado).

### US8 — Participantes (P3)

- Em um evento Acampamento com inscrições confirmadas: "Gerar participantes a partir das
  inscrições" → cria um por inscrição; repetir → não duplica.
- Importar planilha de exemplo (10 linhas, 2 da mesma pessoa): colunas reconhecidas, prévia com
  1 caso em revisão; confirmar → 9 participantes.
- Mesclar dois cadastros → um só, com histórico e auditoria.
- Equipe de saúde: editar alergias → histórico com antes/depois. Recepção: abrir o mesmo
  participante, lista e exportação → nenhum dado de saúde.
- Painel do acampamento: indicadores; nomes de saúde só para quem tem permissão.
- Excluir todos do evento exige digitar o título exato.
- Ajustar a data de fim do evento para > 60 dias atrás → aviso de retenção aparece para o admin.

## 3. Virada (produção)

Executar **somente com confirmação explícita do responsável no momento** (FR-033):

```bash
# 1. Ver o que existe (não apaga nada)
npx tsx scripts/cutover-redis.ts --dry-run

# 2. (opcional) Guardar cópia local antes de excluir — arquivo sensível, fora do repositório
npx tsx scripts/cutover-redis.ts --export C:/caminho/seguro/salt-redis-backup.json

# 3. Excluir (pede para digitar EXCLUIR)
npx tsx scripts/cutover-redis.ts --confirm
```

Depois: conferir `--dry-run` com 0 chaves antigas (SC-011) e registrar o resultado.

## 4. Gates antes do merge

```bash
npm run lint
npm run build
```
