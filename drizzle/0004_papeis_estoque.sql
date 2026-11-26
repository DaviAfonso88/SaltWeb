-- O papel Administrador não é editável no painel e o db:seed não altera papéis que já existem:
-- as permissões novas do estoque entram aqui.
UPDATE "roles" SET "permissions" = ARRAY(SELECT DISTINCT unnest("permissions" || ARRAY['estoque.ver', 'estoque.contatos']::text[])) WHERE "name" = 'Administrador' AND "is_system" = true;--> statement-breakpoint
-- Papéis novos do estoque (um papel com o mesmo nome criado antes é mantido como está).
INSERT INTO "roles" ("name", "description", "permissions", "is_system") VALUES
	('Consulta de estoque', 'Vê o estoque das festas e quem pegou cada item, sem telefones.', ARRAY['estoque.ver']::text[], true),
	('Equipe de estoque', 'Acompanha o estoque das festas e envia lembretes por WhatsApp.', ARRAY['estoque.ver', 'estoque.contatos']::text[], true)
ON CONFLICT ("name") DO NOTHING;
