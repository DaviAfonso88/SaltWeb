import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

// ---------------------------------------------------------------- enums
export const publicationEnum = pgEnum("publication", ["draft", "published", "archived"]);
export const formModelEnum = pgEnum("form_model", ["acampamento", "festa", "missao", "simples"]);
export const registrationStatusEnum = pgEnum("registration_status", [
  "pending",
  "confirmed",
  "cancelled",
]);
export const messageKindEnum = pgEnum("message_kind", ["contato", "servir"]);
export const messageStatusEnum = pgEnum("message_status", ["new", "read", "archived"]);
export const sexEnum = pgEnum("sex", ["M", "F"]);
export const participantSourceEnum = pgEnum("participant_source", [
  "registration",
  "import",
  "manual",
]);

// ---------------------------------------------------------------- acesso
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions").array().notNull().default(sql`'{}'::text[]`),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "restrict" }),
  active: boolean("active").notNull().default(true),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    ip: text("ip"),
    userAgent: text("user_agent"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    actorLabel: text("actor_label"),
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ip: text("ip"),
    createdAt: createdAt(),
  },
  (t) => [
    index("audit_created_idx").on(t.createdAt.desc()),
    index("audit_action_idx").on(t.action),
    index("audit_actor_idx").on(t.actorUserId),
  ],
);

export const entityHistory = pgTable(
  "entity_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    field: text("field").notNull(),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    actorLabel: text("actor_label"),
    createdAt: createdAt(),
  },
  (t) => [index("history_entity_idx").on(t.entityType, t.entityId, t.createdAt)],
);

// ---------------------------------------------------------------- conteúdo
export const eventImages = pgTable("event_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  data: bytea("data").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  createdAt: createdAt(),
});

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary"),
    description: text("description"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    locationName: text("location_name"),
    locationAddress: text("location_address"),
    locationMapUrl: text("location_map_url"),
    imageId: uuid("image_id").references(() => eventImages.id, { onDelete: "set null" }),
    imageAlt: text("image_alt"),
    category: text("category"),
    featured: boolean("featured").notNull().default(false),
    publication: publicationEnum("publication").notNull().default("draft"),
    externalUrl: text("external_url"),
    externalLabel: text("external_label"),
    formModel: formModelEnum("form_model"),
    formConfig: jsonb("form_config").$type<Record<string, unknown>>().notNull().default({}),
    registrationOpen: boolean("registration_open").notNull().default(false),
    registrationClosesAt: timestamp("registration_closes_at", { withTimezone: true }),
    version: integer("version").notNull().default(1),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("events_publication_starts_idx").on(t.publication, t.startsAt)],
);

export const devotionals = pgTable(
  "devotionals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    referenceMonth: date("reference_month").notNull(),
    url: text("url").notNull(),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    version: integer("version").notNull().default(1),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("devotionals_published_idx").on(t.published, t.publishedAt.desc())],
);

/** Dia e horário das programações fixas (células, culto, discipulado). O resto do conteúdo fica em lib/programacoes/catalog.ts. */
export const programacaoKindEnum = pgEnum("programacao_kind", ["semanal", "mensal", "personalizada"]);

export const programacoes = pgTable("programacoes", {
  slug: text("slug").primaryKey(),
  kind: programacaoKindEnum("kind").notNull(),
  /** 0 = domingo … 6 = sábado. */
  weekday: integer("weekday").notNull().default(5),
  /** Semana do mês (1–4) ou 5 = última; só vale para `mensal`. */
  nth: integer("nth").notNull().default(1),
  /** "HH:MM" (horário de Brasília); vazio em `personalizada`. */
  time: text("time"),
  customDay: text("custom_day"),
  customTime: text("custom_time"),
  version: integer("version").notNull().default(1),
  updatedAt: updatedAt(),
});

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: messageKindEnum("kind").notNull(),
    name: text("name").notNull(),
    email: text("email"),
    whatsapp: text("whatsapp"),
    ministry: text("ministry"),
    body: text("body"),
    status: messageStatusEnum("status").notNull().default("new"),
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    emailError: text("email_error"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("messages_status_idx").on(t.status, t.createdAt.desc())],
);

// ---------------------------------------------------------------- inscrições
export type RegistrationPayment = {
  lote?: string;
  valorOriginalCentavos: number;
  valorFinalCentavos: number;
  plano?: string;
  forma?: string;
  parcelas: { rotulo: string; valorCentavos: number; pago: boolean; pagoEm?: string }[];
};

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    number: integer("number").notNull(),
    name: text("name").notNull(),
    nameKey: text("name_key").notNull(),
    phone: text("phone").notNull(),
    phoneKey: text("phone_key").notNull(),
    email: text("email"),
    status: registrationStatusEnum("status").notNull().default("pending"),
    amountCents: integer("amount_cents").notNull().default(0),
    answers: jsonb("answers").$type<Record<string, unknown>>().notNull().default({}),
    payment: jsonb("payment").$type<RegistrationPayment>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("registrations_event_person_uq").on(t.eventId, t.nameKey, t.phoneKey),
    uniqueIndex("registrations_event_number_uq").on(t.eventId, t.number),
    index("registrations_event_status_idx").on(t.eventId, t.status),
    index("registrations_event_created_idx").on(t.eventId, t.createdAt),
  ],
);

// ---------------------------------------------------------------- participantes
export const importBatches = pgTable("import_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  totalRows: integer("total_rows").notNull().default(0),
  createdCount: integer("created_count").notNull().default(0),
  updatedCount: integer("updated_count").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  mapping: jsonb("mapping").$type<Record<string, string>>(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

export const importMappings = pgTable("import_mappings", {
  signature: text("signature").primaryKey(),
  mapping: jsonb("mapping").$type<Record<string, string>>().notNull(),
  updatedAt: updatedAt(),
});

export type EmergencyContact = { nome: string; parentesco?: string | null; telefone: string };

/** Resposta a uma pergunta extra da ficha de saúde; guarda o texto da pergunta no momento em que foi respondida. */
export type ExtraAnswer = { id: string; pergunta: string; tipo: "texto" | "simnao"; resposta: string };

export const participants = pgTable(
  "participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    number: integer("number").notNull(),
    registrationId: uuid("registration_id")
      .unique()
      .references(() => registrations.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    nameKey: text("name_key").notNull(),
    sex: sexEnum("sex"),
    birthDate: date("birth_date"),
    cpf: text("cpf"),
    rg: text("rg"),
    church: text("church"),
    city: text("city"),
    address: text("address"),
    mobile: text("mobile"),
    whatsapp: text("whatsapp"),
    email: text("email"),
    emergencyContact: jsonb("emergency_contact").$type<EmergencyContact>(),
    authorizationDeclared: boolean("authorization_declared").notNull().default(false),
    source: participantSourceEnum("source").notNull().default("manual"),
    importBatchId: uuid("import_batch_id").references(() => importBatches.id, {
      onDelete: "set null",
    }),
    version: integer("version").notNull().default(1),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("participants_event_number_uq").on(t.eventId, t.number),
    index("participants_event_name_idx").on(t.eventId, t.nameKey),
    index("participants_event_cpf_idx").on(t.eventId, t.cpf),
    index("participants_event_mobile_idx").on(t.eventId, t.mobile),
  ],
);

export const participantGuardians = pgTable(
  "participant_guardians",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    relationship: text("relationship").notNull(),
    phone: text("phone").notNull(),
    whatsapp: text("whatsapp"),
    email: text("email"),
    address: text("address"),
    notes: text("notes"),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("guardians_participant_idx").on(t.participantId)],
);

/** Dado sensível: consultado apenas por lib/participants/health.ts. */
export const participantHealth = pgTable("participant_health", {
  participantId: uuid("participant_id")
    .primaryKey()
    .references(() => participants.id, { onDelete: "cascade" }),
  bloodType: text("blood_type"),
  allergies: text("allergies").array().notNull().default(sql`'{}'::text[]`),
  allergyReaction: text("allergy_reaction"),
  allergyMedication: text("allergy_medication"),
  medications: text("medications").array().notNull().default(sql`'{}'::text[]`),
  conditions: text("conditions").array().notNull().default(sql`'{}'::text[]`),
  conditionDetails: text("condition_details"),
  disability: text("disability"),
  disabilityDetails: text("disability_details"),
  dietaryRestrictions: text("dietary_restrictions").array().notNull().default(sql`'{}'::text[]`),
  physicalRestrictions: text("physical_restrictions"),
  medicalNotes: text("medical_notes").array().notNull().default(sql`'{}'::text[]`),
  otherHealthInfo: text("other_health_info"),
  specialNeeds: boolean("special_needs").notNull().default(false),
  specialNeedsDetails: text("special_needs_details"),
  extraAnswers: jsonb("extra_answers").$type<ExtraAnswer[]>().notNull().default(sql`'[]'::jsonb`),
  updatedAt: updatedAt(),
});

export const participantNotes = pgTable(
  "participant_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    authorUserId: uuid("author_user_id").references(() => users.id, { onDelete: "set null" }),
    authorLabel: text("author_label"),
    createdAt: createdAt(),
  },
  (t) => [index("notes_participant_idx").on(t.participantId, t.createdAt)],
);

export type Role = typeof roles.$inferSelect;
export type User = typeof users.$inferSelect;
export type EventRow = typeof events.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Devotional = typeof devotionals.$inferSelect;
export type Message = typeof messages.$inferSelect;
