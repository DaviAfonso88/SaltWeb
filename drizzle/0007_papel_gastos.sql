-- O papel Administrador não é editável no painel e o db:seed não altera papéis que já existem:
-- as permissões novas dos gastos entram aqui.
UPDATE "roles" SET "permissions" = ARRAY(SELECT DISTINCT unnest("permissions" || ARRAY['gastos.ver', 'gastos.gerenciar']::text[])) WHERE "name" = 'Administrador' AND "is_system" = true;--> statement-breakpoint
-- Papel novo (um papel com o mesmo nome criado antes é mantido como está).
INSERT INTO "roles" ("name", "description", "permissions", "is_system") VALUES
	('Equipe de gastos', 'Lança os gastos dos eventos e acompanha o saldo.', ARRAY['gastos.ver', 'gastos.gerenciar']::text[], true)
ON CONFLICT ("name") DO NOTHING;--> statement-breakpoint
-- O modelo "Festa" passou a se chamar "Confraternização" (só descrições que ninguém alterou).
UPDATE "roles" SET "description" = 'Vê o estoque das confraternizações e quem pegou cada item, sem telefones.' WHERE "name" = 'Consulta de estoque' AND "description" = 'Vê o estoque das festas e quem pegou cada item, sem telefones.';--> statement-breakpoint
UPDATE "roles" SET "description" = 'Acompanha o estoque das confraternizações e envia lembretes por WhatsApp.' WHERE "name" = 'Equipe de estoque' AND "description" = 'Acompanha o estoque das festas e envia lembretes por WhatsApp.';
