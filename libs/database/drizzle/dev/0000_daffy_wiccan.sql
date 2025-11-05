CREATE SCHEMA "dg_0001";
--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('trial', 'starter', 'professional', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'agent', 'viewer');--> statement-breakpoint
CREATE TABLE "dg_0001"."cad_diarias" (
	"diarias_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"dia" date NOT NULL,
	"funcionario_id" uuid NOT NULL,
	"projeto_id" uuid,
	"tipo_diaria_id" uuid,
	"observacoes" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_diarias" PRIMARY KEY("diarias_id")
);
--> statement-breakpoint
CREATE TABLE "dg_0001"."cad_empresas" (
	"empresa_id" uuid DEFAULT gen_random_uuid(),
	"razao" varchar(100),
	"fantasia" varchar(100),
	"cnpj" varchar(15) NOT NULL,
	"registro" date,
	"phone" varchar(20),
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_empresa" PRIMARY KEY("empresa_id"),
	CONSTRAINT "cad_empresas_cnpj_unique" UNIQUE("cnpj"),
	CONSTRAINT "cad_empresas_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "dg_0001"."cad_funcionarios" (
	"funcionario_id" uuid DEFAULT gen_random_uuid(),
	"nome" varchar(100),
	"social" varchar(100),
	"cpf" varchar(15) NOT NULL,
	"nascimento" date,
	"phone" varchar(20),
	"email" varchar(255) NOT NULL,
	"rg" varchar(11),
	"projeto_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_funcionrio" PRIMARY KEY("funcionario_id"),
	CONSTRAINT "cad_funcionarios_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "cad_funcionarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "dg_0001"."cad_projetos" (
	"projeto_id" uuid DEFAULT gen_random_uuid(),
	"empresa_id" uuid,
	"nome" varchar(100),
	"inicio" date NOT NULL,
	"fim" date NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_projetos" PRIMARY KEY("projeto_id"),
	CONSTRAINT "cad_projetos_nome_unique" UNIQUE("nome")
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
CREATE TABLE "dg_0001"."cad_tipo_diarias" (
	"tipos_diaria_id" uuid DEFAULT gen_random_uuid(),
	"nome" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_tipos_diaria" PRIMARY KEY("tipos_diaria_id")
);
--> statement-breakpoint
CREATE TABLE "dg_0001"."cad_users" (
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
ALTER TABLE "dg_0001"."cad_diarias" ADD CONSTRAINT "fk_diarias_projetos" FOREIGN KEY ("projeto_id") REFERENCES "dg_0001"."cad_projetos"("projeto_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_diarias" ADD CONSTRAINT "fk_diarias_funcionarios" FOREIGN KEY ("funcionario_id") REFERENCES "dg_0001"."cad_funcionarios"("funcionario_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_diarias" ADD CONSTRAINT "fk_diarias_tipo_diaria" FOREIGN KEY ("tipo_diaria_id") REFERENCES "dg_0001"."cad_tipo_diarias"("tipos_diaria_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_funcionarios" ADD CONSTRAINT "fk_funcionarios_projetos" FOREIGN KEY ("projeto_id") REFERENCES "dg_0001"."cad_projetos"("projeto_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_projetos" ADD CONSTRAINT "fk_projeto_empresa" FOREIGN KEY ("empresa_id") REFERENCES "dg_0001"."cad_empresas"("empresa_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_users" ADD CONSTRAINT "fk_user_login" FOREIGN KEY ("login") REFERENCES "dg_0001"."cad_empresas"("email") ON DELETE no action ON UPDATE no action;