CREATE SCHEMA "c0dab083-af8d-46ab-6f31-3849aa772d68";
--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('trial', 'starter', 'professional', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'agent', 'viewer');--> statement-breakpoint
CREATE TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."atividades_obras" (
	"atividade_obra_id" uuid NOT NULL,
	"projeto_id" uuid NOT NULL,
	"data" timestamp NOT NULL,
	"observacoes" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_atividade_obra" PRIMARY KEY("atividade_obra_id")
);
--> statement-breakpoint
CREATE TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."cadastros" (
	"cadastro_id" uuid DEFAULT gen_random_uuid(),
	"nome_razao" varchar(100),
	"social_fantasia" varchar(100),
	"cpf_cnpj" varchar(15) NOT NULL,
	"nascimento_registro" date,
	"phone" varchar(20),
	"email" varchar(255) NOT NULL,
	"rg" varchar(11),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_cadastros" PRIMARY KEY("cadastro_id"),
	CONSTRAINT "cadastros_cpf_cnpj_unique" UNIQUE("cpf_cnpj"),
	CONSTRAINT "cadastros_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."frequencia" (
	"frequencia_id" uuid DEFAULT gen_random_uuid(),
	"atividade_obra_id" uuid NOT NULL,
	"funcionario_id" uuid NOT NULL,
	"presente" boolean NOT NULL,
	"observacoes" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_frequencia" PRIMARY KEY("frequencia_id")
);
--> statement-breakpoint
CREATE TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."funcionarios" (
	"funcionario_id" uuid NOT NULL,
	"projetos" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "funcionarios_funcionario_id_unique" UNIQUE("funcionario_id")
);
--> statement-breakpoint
CREATE TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."projetos" (
	"projeto_id" uuid DEFAULT gen_random_uuid(),
	"nome" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_projetos" PRIMARY KEY("projeto_id"),
	CONSTRAINT "projetos_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"phone" varchar(20),
	"email" varchar(255),
	"website" varchar(500),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(2) DEFAULT 'US',
	"timezone" varchar(50) DEFAULT 'UTC',
	"currency" varchar(3) DEFAULT 'USD',
	"logo_url" varchar(500),
	"is_active" boolean DEFAULT true,
	"subscription_tier" "subscription_tier" DEFAULT 'starter',
	"trial_ends_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."users" (
	"id" uuid DEFAULT gen_random_uuid(),
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'agent' NOT NULL,
	"is_active" boolean DEFAULT true,
	"user_name" varchar(20),
	"login" varchar(255) NOT NULL,
	"login_verified_at" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_users" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."atividades_obras" ADD CONSTRAINT "fk_atividades_obras_projeto" FOREIGN KEY ("projeto_id") REFERENCES "c0dab083-af8d-46ab-6f31-3849aa772d68"."projetos"("projeto_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."frequencia" ADD CONSTRAINT "fk_atividades_obras" FOREIGN KEY ("atividade_obra_id") REFERENCES "c0dab083-af8d-46ab-6f31-3849aa772d68"."atividades_obras"("atividade_obra_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."frequencia" ADD CONSTRAINT "fk_frequencia_funcionario" FOREIGN KEY ("funcionario_id") REFERENCES "c0dab083-af8d-46ab-6f31-3849aa772d68"."funcionarios"("funcionario_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."funcionarios" ADD CONSTRAINT "fk_funcionario_cadastro" FOREIGN KEY ("funcionario_id") REFERENCES "c0dab083-af8d-46ab-6f31-3849aa772d68"."cadastros"("cadastro_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."users" ADD CONSTRAINT "fk_user_login" FOREIGN KEY ("login") REFERENCES "c0dab083-af8d-46ab-6f31-3849aa772d68"."cadastros"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_atividades_obras_projeto_data" ON "c0dab083-af8d-46ab-6f31-3849aa772d68"."atividades_obras" USING btree ("projeto_id","data");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_frequencia_atividade_funcionario" ON "c0dab083-af8d-46ab-6f31-3849aa772d68"."frequencia" USING btree ("atividade_obra_id","funcionario_id");