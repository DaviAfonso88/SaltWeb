# Feature Specification: Painel administrativo, segurança e redesign do site

**Feature Branch**: `001-painel-admin-redesign`
**Created**: 2026-11-16
**Status**: Draft
**Input**: User description: "Painel administrativo com usuários e permissões, inscrições, eventos, devocionais e mensagens em banco Postgres, correção de segurança das áreas administrativas e redesign do site público seguindo o artifact de design. Não migrar inscrições existentes: podem ser todas excluídas."

## Clarifications

### Session 2026-11-16

- Q: Como fica o formulário de inscrição de um evento cadastrado no painel? → A: O editor escolhe um
  modelo pronto ao criar o evento (Acampamento, Festa, Missão ou Simples) e configura os parâmetros
  no painel. Um tipo novo de formulário exige desenvolvimento.
- Q: O que acontece com o sistema atual de participantes do acampamento (fichas de saúde,
  importação de planilhas, mesclagem)? → A: Ele passa a fazer parte do novo painel, começando do
  zero na nova base. Os dados atuais são excluídos sem migração.
- Q: O que fazer com as telas e operações antigas, hoje abertas sem login, até o novo painel ficar
  pronto? → A: Nada muda até a virada; o risco é aceito pelo responsável até lá, e na virada as
  telas e operações antigas são removidas.
- Q: Como as fichas de saúde chegam ao novo painel? → A: Começa vazio. A equipe coleta as fichas
  fora do site e as traz por importação de planilha ou digita no painel; o site público não coleta
  dados de saúde.
- Q: Participantes são um cadastro por evento ou permanente? → A: Por evento; cada acampamento tem a
  própria lista e a ficha é preenchida de novo a cada ano.
- Q: O que acontece com os dados dos participantes depois do acampamento? → A: Exclusão manual em
  lote pelo administrador, com aviso no painel para acampamentos encerrados há mais de 60 dias que
  ainda guardam fichas de saúde.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Áreas administrativas fechadas para quem não tem acesso (Priority: P1)

Hoje parte das telas administrativas e das operações sobre inscrições pode ser acessada por qualquer
pessoa que conheça o endereço: é possível ver nomes, telefones e idades de inscritos (inclusive
menores), alterar status e excluir inscrições sem login. A equipe precisa que todo acesso a dados
de inscritos e a qualquer função administrativa exija login e a permissão adequada.

**Why this priority**: é um risco ativo de vazamento de dados pessoais de jovens e adolescentes
(LGPD) e de perda de dados por exclusão indevida. O responsável optou por não aplicar correção
provisória nas telas antigas: o risco fica aceito até a virada, quando elas são removidas e todo
acesso passa pelo novo painel. Por isso esta história é parte obrigatória da virada.

**Independent Test**: sem estar logado, tentar abrir cada tela administrativa e acionar cada
operação de leitura, alteração e exclusão de inscrições e participantes; todas devem ser recusadas.
Logado com um usuário sem a permissão correspondente, as mesmas tentativas também devem ser
recusadas.

**Acceptance Scenarios**:

1. **Given** um visitante sem login, **When** ele abre qualquer tela administrativa, **Then** é
   levado para a tela de login e nenhum dado de inscrito ou participante é exibido.
2. **Given** um visitante sem login, **When** ele tenta listar, alterar ou excluir inscrições
   chamando diretamente o endereço da operação, **Then** a operação é recusada e nada é retornado
   ou alterado.
3. **Given** um usuário logado sem permissão para inscrições, **When** ele tenta ver ou alterar
   inscrições, **Then** recebe aviso de acesso negado e a tentativa é registrada.
4. **Given** a virada para o novo sistema, **When** ela é concluída, **Then** todas as inscrições e
   todos os cadastros de participantes antigos foram excluídos definitivamente e as telas e
   operações antigas deixam de existir.

---

### User Story 2 - Gestão de usuários e permissões (Priority: P1)

Um administrador cadastra as pessoas da equipe no painel, define o que cada uma pode fazer por
meio de papéis (por exemplo: Administrador, Editor de conteúdo, Equipe de inscrições, Atendimento,
Equipe de saúde) e pode criar papéis novos escolhendo permissões. Ele também desativa contas,
redefine senhas e consulta o histórico de ações sensíveis.

**Why this priority**: todas as demais áreas do painel dependem de saber quem é o usuário e o que
ele pode fazer.

**Independent Test**: com o primeiro administrador, criar um usuário com o papel "Editor de
conteúdo"; entrar com esse usuário e verificar que ele só vê e usa as áreas de eventos e
devocionais.

**Acceptance Scenarios**:

1. **Given** um sistema sem nenhum usuário, **When** a configuração inicial é feita, **Then** é
   criado exatamente um administrador e a configuração inicial deixa de estar disponível.
2. **Given** um administrador logado, **When** ele cria um usuário com nome, e-mail, papel e senha
   provisória, **Then** o novo usuário consegue entrar e é obrigado a trocar a senha no primeiro
   acesso.
3. **Given** um administrador, **When** ele cria o papel "Coordenação" com as permissões "ver
   inscrições" e "exportar inscrições", **Then** usuários com esse papel veem e exportam
   inscrições, mas não alteram nem excluem.
4. **Given** um usuário logado, **When** um administrador o desativa ou muda seu papel, **Then** o
   efeito vale a partir da próxima ação desse usuário (desativado perde o acesso imediatamente).
5. **Given** que só existe um administrador ativo, **When** alguém tenta desativá-lo, excluí-lo ou
   remover seu papel de administrador, **Then** o sistema impede e explica o motivo.
6. **Given** um administrador, **When** ele abre o histórico de auditoria, **Then** vê quem fez cada
   ação sensível (exclusões, exportações, acessos a fichas de saúde, mudanças de usuário e papel),
   quando e sobre qual registro.

---

### User Story 3 - Consultar e gerenciar as respostas das inscrições (Priority: P2)

A equipe de cada evento acompanha as inscrições recebidas pelo site: lista por evento, busca por
nome ou telefone, filtra por status, abre os detalhes de cada inscrição, atualiza o status (e o
pagamento, quando o evento é pago), exclui inscrições indevidas e exporta a lista em planilha ou
PDF.

**Why this priority**: é o principal motivo do painel e substitui as telas atuais, que estão
desprotegidas e separadas por evento.

**Independent Test**: fazer uma inscrição pelo site em um evento aberto; entrar no painel com um
usuário da equipe de inscrições, encontrar a inscrição pela busca, confirmá-la e exportar a lista do
evento.

**Acceptance Scenarios**:

1. **Given** um visitante, **When** ele envia o formulário de inscrição de um evento aberto,
   **Then** vê a confirmação e a inscrição aparece no painel com status "pendente".
2. **Given** um usuário com permissão de ver inscrições, **When** ele busca parte do nome ou do
   telefone, **Then** vê só as inscrições correspondentes do evento selecionado.
3. **Given** um usuário com permissão de gerenciar, **When** ele muda o status de uma inscrição,
   **Then** a mudança é salva e registrada no histórico da inscrição com autor e data.
4. **Given** um usuário com permissão de exportar, **When** ele exporta as inscrições de um evento,
   **Then** recebe um arquivo com todas as inscrições que respeitam os filtros aplicados.
5. **Given** um evento com inscrições encerradas, **When** um visitante abre a página de inscrição,
   **Then** vê o aviso de encerramento e não consegue enviar o formulário.

---

### User Story 4 - Cadastro de eventos (Priority: P2)

Um editor de conteúdo cria e edita eventos no painel (título, descrição, data e horário, local,
imagem, categoria, destaque na página inicial), publica ou despublica, e abre ou encerra as
inscrições. Para eventos com inscrição, escolhe um dos modelos de formulário prontos e ajusta seus
parâmetros (por exemplo, valores dos lotes do acampamento ou itens de alimento da festa). O site
passa a mostrar os eventos publicados sem que ninguém precise alterar código.

**Why this priority**: hoje cada evento novo depende de um desenvolvedor; é o ganho de autonomia
mais visível para a equipe.

**Independent Test**: criar um evento como rascunho, conferir que não aparece no site, publicá-lo e
conferir que aparece na página de eventos em até 1 minuto. Criar um evento com o modelo Simples,
abrir as inscrições e fazer uma inscrição pelo site.

**Acceptance Scenarios**:

1. **Given** um editor, **When** ele salva um evento como rascunho, **Then** o evento não aparece no
   site.
2. **Given** um evento em rascunho, **When** o editor publica, **Then** o evento aparece na página de
   eventos ordenado pela data e, se marcado como destaque, na página inicial.
3. **Given** um evento cuja data já passou, **When** um visitante abre a página de eventos, **Then**
   o evento não aparece entre os próximos.
4. **Given** um evento com inscrições recebidas, **When** o editor tenta excluí-lo, **Then** o
   sistema oferece arquivar em vez de excluir e mantém as inscrições.
5. **Given** um editor enviando uma imagem acima de 5 MB ou em formato não aceito, **When** ele
   salva, **Then** vê uma mensagem clara e o evento não é salvo com imagem inválida.
6. **Given** um evento do modelo Acampamento, **When** o editor altera o valor de um lote, **Then**
   novas inscrições usam o novo valor e as inscrições já feitas mantêm o valor da época.
7. **Given** um evento que já recebeu inscrições, **When** o editor tenta trocar o modelo de
   formulário, **Then** o sistema impede e explica o motivo.

---

### User Story 5 - Redesign do site público (Priority: P2)

O visitante encontra um site com visual limpo, moderno e profissional, conforme o design aprovado:
Início, Sobre, Eventos, Devocional, Podcast, Contribua e as páginas de inscrição dos eventos,
funcionando bem no celular e no computador.

**Why this priority**: é a face pública da juventude e pode ser entregue em paralelo ao painel; as
páginas de Eventos e Devocional passam a exibir o conteúdo cadastrado no painel quando as histórias
4 e 6 estiverem prontas.

**Independent Test**: comparar cada página publicada com o design aprovado, em largura de celular
(360px) e de computador (1440px), e executar as ações principais de cada página (navegar, copiar a
chave Pix, abrir o mapa, enviar contato, fazer inscrição).

**Acceptance Scenarios**:

1. **Given** o design aprovado, **When** cada página pública é aberta, **Then** a estrutura, a
   hierarquia de títulos, as cores e a tipografia correspondem ao design.
2. **Given** um celular com 360px de largura, **When** o visitante percorre qualquer página,
   **Then** não há rolagem horizontal e todos os botões e links são fáceis de tocar.
3. **Given** a página Devocional, **When** o visitante digita parte de um título ou escolhe um mês,
   **Then** a lista é filtrada imediatamente e, sem resultados, aparece a opção de limpar os
   filtros.
4. **Given** a página Contribua, **When** o visitante toca em "Copiar", **Then** a chave Pix é
   copiada e ele recebe confirmação visível.

---

### User Story 6 - Cadastro de devocionais (Priority: P3)

Um editor de conteúdo cadastra devocionais (título, mês de referência, link do material), publica ou
despublica, e o site mostra sempre os publicados, do mais recente para o mais antigo.

**Why this priority**: hoje os devocionais dependem de editar um arquivo externo manualmente; o
volume de alterações é baixo, por isso vem depois.

**Independent Test**: cadastrar e publicar um devocional e verificar que ele aparece em primeiro
lugar na página Devocional; despublicá-lo e verificar que some.

**Acceptance Scenarios**:

1. **Given** o lançamento do painel, **When** a equipe abre a área de devocionais, **Then** os 24
   devocionais existentes já estão cadastrados e publicados.
2. **Given** um editor, **When** ele publica um devocional novo, **Then** ele aparece como "mais
   recente" na página Devocional.
3. **Given** um link de material inválido (não é um endereço web), **When** o editor salva, **Then**
   recebe mensagem de erro e o devocional não é salvo.

---

### User Story 7 - Caixa de entrada de mensagens (Priority: P3)

As mensagens do formulário de contato e do formulário "Quero servir" ficam guardadas no painel, além
do aviso por e-mail. A equipe de atendimento vê as novas, marca como lidas, arquiva e exclui.

**Why this priority**: hoje as mensagens só chegam por e-mail e se perdem se o envio falhar; é um
ganho importante, mas de menor volume.

**Independent Test**: enviar uma mensagem pelo formulário de contato e outra pelo "Quero servir";
conferir que ambas aparecem no painel como novas, com o contador de não lidas atualizado.

**Acceptance Scenarios**:

1. **Given** um visitante, **When** ele envia o formulário de contato, **Then** a mensagem é salva e
   aparece no painel como "nova", mesmo que o aviso por e-mail falhe.
2. **Given** uma mensagem "Quero servir", **When** a equipe a abre, **Then** vê nome, WhatsApp e
   ministério escolhido e a mensagem passa a "lida".
3. **Given** um usuário com permissão de mensagens, **When** ele filtra por tipo ou status, **Then**
   vê apenas as mensagens correspondentes.

---

### User Story 8 - Participantes do acampamento e fichas de saúde (Priority: P3)

Para cada acampamento, a equipe mantém a lista de participantes com dados pessoais, responsáveis,
contato de emergência e ficha de saúde. Os participantes vêm das inscrições confirmadas do evento,
de planilhas importadas (com reconhecimento automático das colunas e detecção de cadastros
repetidos) ou de cadastro manual. Durante o acampamento, a equipe de saúde consulta e atualiza as
fichas, os líderes registram observações e o painel do evento mostra indicadores como quantos
participantes têm alergias ou usam medicamentos.

**Why this priority**: substitui o sistema atual de participantes, que começa do zero na nova base.
Só é usado no período do acampamento e depende das histórias 2, 3 e 4.

**Independent Test**: importar para um evento de acampamento uma planilha de exemplo com 10 linhas,
2 delas da mesma pessoa; conferir que as colunas são reconhecidas, que a repetição vai para revisão
e que 9 participantes são criados após a confirmação. Com um usuário da equipe de saúde, atualizar
as alergias de um participante. Com um usuário de recepção, abrir o mesmo participante e conferir
que nenhum dado de saúde aparece.

**Acceptance Scenarios**:

1. **Given** um evento do modelo Acampamento com inscrições confirmadas, **When** um usuário com
   permissão gera os participantes a partir das inscrições, **Then** cada inscrição confirmada vira
   um participante do evento, sem duplicar quem já existe.
2. **Given** uma planilha Excel ou CSV, **When** o usuário a importa, **Then** o sistema sugere a
   correspondência entre colunas e campos, permite ajustá-la e mostra uma prévia com novos,
   atualizações e possíveis repetidos; nada é gravado antes da confirmação.
3. **Given** dois cadastros da mesma pessoa no evento, **When** o usuário os mescla, **Then** fica um
   único participante com os dados combinados, e a mescla fica registrada no histórico e na
   auditoria.
4. **Given** um usuário sem permissão de saúde, **When** ele abre a lista, o detalhe ou a exportação
   de participantes, **Then** vê identificação e contatos, mas nenhum dado de saúde.
5. **Given** um usuário da equipe de saúde, **When** ele altera a ficha de saúde, **Then** a mudança
   fica no histórico do participante com autor, data, valor anterior e valor novo.
6. **Given** o painel do acampamento, **When** a equipe o abre, **Then** vê o total de participantes,
   a distribuição por sexo, faixa etária, igreja e cidade e, para quem tem permissão de saúde,
   quantos e quais participantes têm alergias, medicamentos, restrições alimentares, condições de
   saúde e necessidades especiais.

---

### Edge Cases

- Dois administradores editam o mesmo evento ou participante ao mesmo tempo: quem salvar por último
  é avisado de que o registro mudou e pode revisar antes de sobrescrever.
- Muitas tentativas de login erradas para a mesma conta: após 5 erros em 15 minutos, a conta fica
  bloqueada por 15 minutos e a tentativa é registrada.
- Usuário excluído ou desativado com sessão aberta: perde o acesso na ação seguinte.
- Visitante envia a mesma inscrição duas vezes (mesmo nome e telefone no mesmo evento): o sistema
  avisa que já existe uma inscrição e não duplica.
- Inscrição enviada no momento em que o evento é encerrado: é recusada com a mensagem de
  encerramento.
- Lote do acampamento muda entre o visitante abrir a página e enviar o formulário: a inscrição usa o
  lote vigente no envio e o visitante vê o valor final antes de confirmar.
- Item de alimento da festa esgota enquanto o visitante preenche o formulário: o envio é recusado
  para aquele item e o visitante escolhe outro.
- Evento sem imagem: o site usa uma composição padrão sem quebrar o layout.
- Evento ou devocional despublicado com o link já compartilhado: o visitante vê uma página de "não
  encontrado" amigável, com caminho de volta.
- Robôs enviando formulários públicos: envios em excesso pelo mesmo visitante são limitados e campos
  ocultos de armadilha descartam o envio silenciosamente.
- Planilha com colunas desconhecidas: o sistema mostra as colunas não reconhecidas e permite
  ignorá-las ou associá-las manualmente; arquivo que não é planilha é recusado.
- Linha da planilha que pode corresponder a mais de um participante existente: vai para revisão
  manual e nunca é mesclada automaticamente.
- Datas de nascimento em formatos variados na planilha: as reconhecíveis são convertidas; as demais
  ficam em branco e a linha é sinalizada na prévia.
- Participante menor de idade sem responsável: o cadastro é aceito, mas fica sinalizado como
  pendente até ter ao menos um responsável.
- Banco de dados indisponível durante um envio público: o visitante vê uma mensagem amigável pedindo
  para tentar de novo em alguns minutos, e nada fica gravado pela metade.
- Datas e horários: exibidos sempre no fuso de Brasília, inclusive para quem acessa de outro fuso.
- Exportação sem resultados: o arquivo é gerado só com o cabeçalho e o usuário é avisado.

## Requirements *(mandatory)*

### Functional Requirements

**Acesso e segurança**

- **FR-001**: O sistema MUST exigir login para toda tela administrativa e toda operação que leia,
  altere, exporte ou exclua dados não públicos.
- **FR-002**: O sistema MUST verificar, em cada operação administrativa, se o usuário tem a
  permissão específica da ação, e não apenas se está logado.
- **FR-003**: As funções públicas do site MUST apenas receber envios (inscrição, contato, servir) e
  MUST NOT devolver dados de outras pessoas; a resposta de um envio contém só a confirmação e o
  resumo da própria inscrição (número, valor, parcelas).
- **FR-004**: O sistema MUST bloquear a conta por 15 minutos após 5 tentativas de login erradas em
  15 minutos (contadas por e-mail informado). As mensagens de erro e de bloqueio MUST ser genéricas,
  sem revelar se o e-mail existe.
- **FR-005**: Sessões MUST expirar após 7 dias, MUST terminar quando o usuário sai, e MUST ser
  encerradas imediatamente quando o usuário é desativado ou excluído. Ao trocar a própria senha, as
  demais sessões do usuário MUST ser encerradas.
- **FR-006**: O sistema MUST registrar em log de auditoria, com autor, data e registro afetado:
  login com falha e bloqueio, tentativas de acesso negado, exclusões, exportações, mudanças de
  status, acesso a fichas de saúde (detalhe, exportação com saúde e indicadores nominais),
  importações e mesclas de participantes, criação, alteração ou desativação de usuários e de papéis
  e a execução da virada.

**Usuários e permissões**

- **FR-007**: O sistema MUST oferecer uma configuração inicial que cria o primeiro administrador,
  exige um código de configuração definido pelo responsável no ambiente do servidor (para que
  ninguém de fora crie o administrador antes da equipe) e fica indisponível depois que existe ao
  menos um usuário.
- **FR-008**: Administradores MUST poder criar, editar, desativar, reativar e excluir usuários
  (nome, e-mail de acesso, papel, situação) e redefinir a senha de qualquer usuário.
- **FR-009**: Novos usuários e senhas redefinidas MUST ser provisórias, com troca obrigatória no
  primeiro acesso; a senha provisória é mostrada uma única vez ao administrador que a gerou, para
  ele repassar; senhas MUST ter no mínimo 8 caracteres.
- **FR-010**: O sistema MUST vir com os papéis Administrador, Editor de conteúdo, Equipe de
  inscrições, Atendimento, Equipe de saúde, Liderança (vê participantes e saúde, registra
  observações) e Recepção (vê participantes sem dados de saúde). Administradores MUST poder criar,
  editar e excluir papéis escolhendo permissões de uma lista.
- **FR-011**: As permissões disponíveis MUST cobrir, no mínimo: gerenciar usuários e papéis; ver,
  gerenciar e exportar inscrições; gerenciar eventos; gerenciar devocionais; ver e gerenciar
  mensagens; ver, editar, importar, mesclar, exportar e excluir participantes; ver dados de saúde;
  editar dados de saúde; registrar observações; ver auditoria.
- **FR-012**: O sistema MUST impedir que fique sem nenhum administrador ativo. Administrador é o
  usuário ativo cujo papel tem a permissão de gerenciar usuários e papéis; a regra vale para
  desativar, excluir, trocar o papel de um usuário e editar as permissões de um papel.
- **FR-013**: O painel MUST mostrar a cada usuário apenas as áreas que suas permissões permitem.

**Inscrições**

- **FR-014**: O sistema MUST receber inscrições pelos formulários públicos dos eventos e guardá-las
  vinculadas ao evento, com status inicial "pendente".
- **FR-015**: Ao habilitar inscrições em um evento, o editor MUST escolher um destes modelos de
  formulário:
  - **Acampamento**: nome, idade, WhatsApp, e-mail, igreja, cidade; inscrição individual ou em dupla
    (irmão ou cônjuge, com nome da dupla); plano à vista (Pix ou dinheiro), carnê ou crédito; valor
    calculado pelo lote vigente e pelos descontos.
  - **Festa**: nome, faixa etária, membro ou convidado (com quem convidou), contribuição em alimento
    (itens com quantidade limitada) ou em dinheiro (valor fixo com vagas limitadas), observação.
  - **Missão**: dados de contato e participação em tempo integral ou em períodos escolhidos.
  - **Simples**: nome, telefone, e-mail e observação.
- **FR-016**: Os parâmetros de cada modelo MUST ser configuráveis no painel, por evento: lotes (valor
  e data limite), percentuais de desconto e número de parcelas do Acampamento; itens de alimento,
  quantidades, valor e vagas da contribuição da Festa; períodos disponíveis da Missão. Cada
  inscrição MUST guardar o valor calculado no momento do envio. O modelo MUST NOT ser trocado
  depois que o evento recebe a primeira inscrição. Regras de cálculo:
  - lote vigente = o primeiro cuja data limite é igual ou posterior à data do envio (horário de
    Brasília); depois da data limite do último lote, vale o último lote;
  - desconto de dupla (aplicado sobre o total das pessoas) não acumula com desconto de forma de
    pagamento; carnê e crédito não têm desconto;
  - na Festa, um item de alimento ou uma vaga de contribuição é consumido por inscrição pendente ou
    confirmada e liberado quando a inscrição é cancelada ou excluída.
- **FR-017**: Usuários com permissão MUST poder listar inscrições por evento, buscar por nome ou
  telefone, filtrar por status e abrir o detalhe de cada inscrição.
- **FR-018**: Usuários com permissão MUST poder alterar o status da inscrição (pendente, confirmada,
  cancelada) e, em eventos pagos, registrar o pagamento e as parcelas pagas; cada mudança MUST
  ficar no histórico da inscrição.
- **FR-019**: Usuários com permissão MUST poder exportar as inscrições filtradas de um evento em
  planilha (CSV) e em PDF.
- **FR-020**: Exclusão de inscrição MUST pedir confirmação e ficar registrada na auditoria.
- **FR-021**: O sistema MUST impedir inscrição duplicada no mesmo evento — mesmo nome (sem
  diferenciar acentos, maiúsculas e espaços extras) e mesmo telefone (só dígitos) — inclusive quando
  a inscrição existente está cancelada (o visitante é orientado a falar com a equipe). O sistema MUST
  recusar inscrições quando o evento não estiver publicado, estiver com inscrições encerradas ou sem
  vagas.
- **FR-021a**: Todo formulário público MUST exibir um aviso de privacidade curto: para que os dados
  são usados, quem tem acesso e o contato para pedir correção ou exclusão.

**Participantes do acampamento**

- **FR-022**: Usuários com permissão MUST poder manter, para cada evento do modelo Acampamento, a
  lista de participantes com: nome, sexo, data de nascimento (idade calculada), CPF, RG, igreja,
  cidade, endereço, celular, WhatsApp, e-mail, responsáveis (nome, parentesco, telefone, WhatsApp,
  e-mail), contato de emergência e declaração de autorização.
- **FR-023**: Cada participante MUST ter uma ficha de saúde com: tipo sanguíneo; alergias, reação e
  medicação usada; medicamentos em uso; condições de saúde de uma lista (alergia, asma, autismo,
  diabetes, epilepsia, problema cardíaco, TDAH, TDA, ansiedade, depressão, deficiência auditiva,
  visual ou motora, síndromes, outro) com especificação; deficiência; restrições alimentares e
  físicas; necessidades especiais; observações médicas.
- **FR-024**: Participantes MUST poder ser criados manualmente, a partir das inscrições confirmadas
  do evento (sem duplicar quem já existe) ou por importação de planilha. As fichas de saúde chegam
  apenas por importação ou digitação no painel; o site público MUST NOT coletar dados de saúde.
- **FR-025**: A importação MUST aceitar Excel e CSV, sugerir a correspondência entre colunas e
  campos (reconhecendo os nomes de coluna dos formulários usados hoje), permitir ajuste manual e
  lembrar a correspondência usada para o próximo arquivo do mesmo formato. Antes de gravar, MUST
  mostrar uma prévia com novos, atualizações, possíveis repetidos e linhas inválidas (com o motivo).
  Linhas inválidas são ignoradas; a gravação das demais é tudo-ou-nada.
- **FR-026**: O sistema MUST apontar possíveis cadastros repetidos por semelhança de nome, CPF,
  e-mail, celular e data de nascimento, MUST NOT mesclar automaticamente casos ambíguos, e MUST
  permitir mesclar manualmente dois participantes, combinando os dados.
- **FR-027**: Dados de saúde MUST ser vistos e editados apenas por quem tem as permissões de saúde;
  para os demais, MUST NOT aparecer em listas, detalhes, indicadores ou exportações.
- **FR-028**: Toda alteração em participante MUST ficar no histórico (campo, valor anterior, valor
  novo, autor, data), e usuários com permissão MUST poder registrar observações com autor e data.
- **FR-029**: Usuários com permissão MUST poder buscar participantes por nome (sem diferenciar
  acentos e maiúsculas), CPF ou telefone, filtrar por igreja, cidade, sexo e condição de saúde, e
  exportar a lista filtrada em CSV e PDF.
- **FR-030**: O painel de cada acampamento MUST mostrar o total de participantes, a distribuição por
  sexo, faixa etária, igreja e cidade e, para quem tem permissão de saúde, quantos e quais
  participantes têm alergias, medicamentos, restrições alimentares, condições de saúde e
  necessidades especiais.
- **FR-031**: Exclusão de participante MUST pedir confirmação; a exclusão de todos os participantes
  de um evento MUST exigir que o usuário digite o nome do evento para confirmar.
- **FR-031a**: Participantes MUST pertencer a um único evento; não há cadastro permanente de pessoas
  entre acampamentos.
- **FR-031b**: O painel MUST avisar os administradores sobre acampamentos encerrados há mais de 60
  dias que ainda guardam fichas de saúde, com atalho para a exclusão em lote; não há exclusão
  automática. A referência é a data de término do evento (ou a de início, se não houver término).

**Virada para o novo sistema**

- **FR-032**: Na virada, todas as inscrições antigas e todos os cadastros antigos de participantes
  (incluindo fichas de saúde, históricos, observações e importações) MUST ser excluídos
  definitivamente, sem migração, e as telas e operações antigas MUST ser removidas.
- **FR-033**: A exclusão da virada MUST ser executada só após confirmação explícita do responsável
  no momento da execução, e o resultado (quantidade de registros excluídos) MUST ser registrado. Se
  a exclusão for interrompida, ela MUST poder ser executada de novo com segurança, informando o que
  ainda resta.

**Eventos**

- **FR-034**: Editores MUST poder criar, editar, publicar, despublicar e arquivar eventos com:
  título, descrição, data e horário de início e fim, local (nome, endereço, link de mapa), imagem,
  categoria, destaque na página inicial e situação das inscrições (abertas/encerradas, com data de
  encerramento opcional e modelo de formulário).
- **FR-035**: Imagens de eventos MUST aceitar JPG, PNG ou WebP de até 5 MB e ter texto alternativo
  obrigatório.
- **FR-036**: Eventos com inscrições ou participantes MUST NOT ser excluídos, apenas arquivados.
- **FR-037**: O site MUST mostrar os eventos publicados e futuros em ordem de data, e a página
  inicial MUST mostrar o evento marcado como destaque; mudanças publicadas MUST aparecer no site em
  até 1 minuto.

**Devocionais**

- **FR-038**: Editores MUST poder criar, editar, publicar, despublicar e excluir devocionais com
  título, mês de referência e link do material.
- **FR-039**: Os 24 devocionais atuais MUST ser importados como conteúdo inicial publicado.
- **FR-040**: A página Devocional MUST listar os publicados do mais recente para o mais antigo,
  destacar o mais recente e permitir busca por título e filtro por mês.

**Mensagens**

- **FR-041**: Mensagens de contato (nome, e-mail, mensagem) e de "Quero servir" (nome, WhatsApp,
  ministério) MUST ser salvas antes do envio do aviso por e-mail; falha no e-mail MUST NOT perder a
  mensagem.
- **FR-042**: Usuários com permissão MUST poder listar, filtrar por tipo e status (nova, lida,
  arquivada), abrir, marcar como lida/não lida, arquivar e excluir mensagens; o painel MUST exibir o
  total de mensagens novas.

**Site público (redesign)**

- **FR-043**: As páginas Início, Sobre, Eventos, Devocional, Podcast, Contribua e as páginas de
  inscrição MUST seguir o design aprovado (estrutura, cores, tipografia, componentes).
- **FR-044**: Todo o conteúdo e todas as funções atuais do site MUST ser preservados no redesign
  (textos, endereços, links de redes sociais, chave Pix, dados bancários, player e link do podcast,
  mapa e cópia de endereço).
- **FR-045**: As páginas MUST funcionar a partir de 360px de largura sem rolagem horizontal, com
  contraste de texto AA e alvos de toque de no mínimo 44px.
- **FR-046**: O painel administrativo MUST usar o mesmo guia de estilo do redesign e cumprir os
  mesmos requisitos de acessibilidade do FR-045, com navegação completa por teclado e rótulo em
  todos os campos.

### Key Entities *(include if feature involves data)*

- **Usuário**: pessoa da equipe com acesso ao painel. Nome, e-mail de acesso, papel, situação
  (ativo/inativo), indicação de senha provisória, último acesso.
- **Papel**: conjunto nomeado de permissões. Nome, descrição, lista de permissões, indicação de
  papel padrão do sistema.
- **Permissão**: ação que pode ser concedida (ex.: "exportar inscrições"). Lista fixa definida pelo
  sistema.
- **Evento**: atividade divulgada no site. Título, descrição, período, local, imagem, categoria,
  destaque, situação de publicação (rascunho, publicado, arquivado), situação das inscrições,
  modelo de formulário e seus parâmetros.
- **Inscrição**: resposta de um visitante ao formulário de um evento. Pertence a um evento; dados
  comuns (nome, telefone, data de envio, status) e respostas específicas do modelo de formulário;
  em eventos pagos, lote, valor calculado, forma de pagamento e parcelas; histórico de alterações.
- **Participante**: pessoa inscrita em um acampamento. Pertence a um evento e pode estar ligado à
  inscrição de origem. Identificação, contatos, responsáveis, contato de emergência, declaração,
  origem (inscrição, importação ou manual), observações e histórico de alterações.
- **Ficha de saúde**: dados de saúde de um participante (um para um). Dado sensível com acesso
  restrito.
- **Responsável**: pai, mãe ou tutor de um participante. Nome, parentesco, telefone, WhatsApp,
  e-mail.
- **Importação**: carga de planilha em um evento. Arquivo, autor, data, correspondência de colunas
  usada, totais de novos, atualizados e repetidos em revisão.
- **Devocional**: material de leitura. Título, mês de referência, link do material, situação de
  publicação, data de publicação.
- **Mensagem**: contato recebido pelo site. Tipo (contato ou servir), dados enviados, status (nova,
  lida, arquivada), data.
- **Registro de auditoria**: ação sensível realizada. Autor, ação, registro afetado, data,
  resultado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das telas administrativas e operações sobre dados não públicos recusam acesso sem
  login, verificado tentando cada uma delas sem sessão; zero dados de inscritos ou participantes
  retornados.
- **SC-002**: Um administrador cria um usuário com papel e esse usuário entra no painel vendo apenas
  as áreas permitidas em menos de 3 minutos, do início ao fim.
- **SC-003**: Um editor publica um evento ou devocional novo e ele aparece no site em até 1 minuto,
  sem nenhuma alteração de código ou nova publicação do site.
- **SC-004**: Um editor cria um evento com inscrições a partir de qualquer um dos 4 modelos, sem
  ajuda de desenvolvedor, em menos de 10 minutos.
- **SC-005**: A equipe encontra uma inscrição ou participante pelo nome em menos de 10 segundos e
  exporta a lista de um evento em menos de 1 minuto.
- **SC-006**: 100% das mensagens enviadas pelos formulários de contato e "Quero servir" ficam
  disponíveis no painel, inclusive quando o envio do e-mail falha.
- **SC-007**: Um visitante conclui uma inscrição de evento pelo celular em menos de 3 minutos.
- **SC-008**: Uma planilha de 300 participantes é importada, revisada e gravada em menos de 10
  minutos, e nenhum caso ambíguo é mesclado sem decisão do usuário.
- **SC-009**: 0 dados de saúde aparecem para usuários sem permissão de saúde, verificado em listas,
  detalhes, indicadores e exportações.
- **SC-010**: Todas as páginas públicas são aprovadas pelo responsável na comparação com o design e
  não apresentam rolagem horizontal em 360px de largura.
- **SC-011**: Após a virada, nenhuma inscrição nem cadastro de participante do sistema antigo
  permanece armazenado (0 registros).

## Assumptions

- **Volume**: até algumas dezenas de usuários do painel, centenas de inscrições e participantes por
  evento e poucos eventos por ano; não há exigência de alta escala.
- **Restrição definida pelo responsável**: os dados persistentes do painel passam a ficar em banco
  relacional gerenciado (Postgres no Neon); detalhes de implementação ficam no plano técnico.
- **Dados antigos**: inscrições e participantes não serão migrados (decisão do responsável). Por
  precaução, um arquivo de exportação é gerado e entregue ao responsável antes da exclusão; se ele
  dispensar, a exclusão segue sem exportação.
- **Usuários atuais**: não são migrados; o primeiro administrador é criado pela configuração
  inicial e os demais são recriados pelo painel.
- **Participantes**: existem apenas em eventos do modelo Acampamento (ver FR-031a e FR-031b para
  vínculo por evento e retenção).
- **Telas antigas até a virada**: permanecem como estão, por decisão do responsável; a correção de
  segurança chega junto com o novo painel.
- **Fora do sistema de participantes**: foto e anexos de participantes (previstos no sistema atual,
  mas sem uso nas telas) não entram nesta entrega.
- **Modelos de formulário**: os 4 modelos reproduzem as regras dos formulários atuais (Acampa SALT,
  Festa na Roça, Projeto Missionário) e acrescentam o Simples; um modelo novo exige desenvolvimento.
- **Conteúdo inicial**: o evento existente no site e os 24 devocionais atuais são importados como
  conteúdo inicial; o material dos devocionais continua hospedado externamente (somente o link é
  guardado).
- **Retenção**: o log de auditoria é guardado por pelo menos 1 ano, sem exclusão automática nesta
  entrega. Inscrições de eventos arquivados permanecem até serem excluídas individualmente; exclusão
  em lote de inscrições fica para uma entrega futura.
- **Backup**: a recuperação da base usa a restauração a um ponto no tempo do provedor de banco,
  dentro da janela do plano contratado.
- **Recuperação de senha**: não há "esqueci minha senha" por e-mail nesta entrega; o administrador
  redefine a senha.
- **Idioma e fuso**: português do Brasil; horário de Brasília.
- **Design de referência**: canvas "SALT — Redesign do site"
  (https://claude.ai/artifact/CaujQ86r71wdXcNUSb3H5T), incluindo o guia de estilo. Pontos marcados
  como placeholder no design (data e local da Festa na Roça) usam os dados reais do evento quando
  cadastrado.
- **Fora do escopo**: gestão de episódios do podcast pelo painel (continuam como hoje), pagamentos
  online integrados, aplicativo móvel, recuperação de senha por e-mail, notificações automáticas
  para inscritos e construtor livre de formulários.
