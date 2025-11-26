CREATE SCHEMA "dg_0001";
--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('trial', 'starter', 'professional', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'agent', 'viewer');--> statement-breakpoint
CREATE TABLE "dg_0001"."cad_beneficios" (
	"beneficio_id" uuid DEFAULT gen_random_uuid(),
	"funcionario_id" uuid,
	"valor" numeric(15, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_beneficios" PRIMARY KEY("beneficio_id")
);
--> statement-breakpoint
CREATE TABLE "dg_0001"."cad_diarias" (
	"diarias_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"dia" date NOT NULL,
	"funcionario_id" uuid NOT NULL,
	"projeto_id" uuid,
	"tipo_diaria" uuid,
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
	"funcao" uuid,
	"salario" numeric(15, 2),
	"dependentes" integer,
	"projeto_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_funcionrio" PRIMARY KEY("funcionario_id"),
	CONSTRAINT "cad_funcionarios_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "cad_funcionarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "dg_0001"."cad_lookup" (
	"lookup_id" uuid DEFAULT gen_random_uuid(),
	"grupo" varchar(100),
	"nome" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_lookup" PRIMARY KEY("grupo","nome"),
	CONSTRAINT "cad_lookup_lookup_id_unique" UNIQUE("lookup_id")
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
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" varchar(64),
	"user_agent" varchar(512),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"tenant_id" varchar(255) PRIMARY KEY NOT NULL,
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
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenants_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "tenant_memberships" (
	"tenant_id" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pk_tenant_memberships" PRIMARY KEY("tenant_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_beneficios" ADD CONSTRAINT "fk_funcionario_beneficios" FOREIGN KEY ("funcionario_id") REFERENCES "dg_0001"."cad_funcionarios"("funcionario_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_diarias" ADD CONSTRAINT "fk_diarias_projetos" FOREIGN KEY ("projeto_id") REFERENCES "dg_0001"."cad_projetos"("projeto_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_diarias" ADD CONSTRAINT "fk_diarias_funcionarios" FOREIGN KEY ("funcionario_id") REFERENCES "dg_0001"."cad_funcionarios"("funcionario_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_diarias" ADD CONSTRAINT "fk_diaria_lookup" FOREIGN KEY ("tipo_diaria") REFERENCES "dg_0001"."cad_lookup"("lookup_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_funcionarios" ADD CONSTRAINT "fk_funcionarios_projetos" FOREIGN KEY ("projeto_id") REFERENCES "dg_0001"."cad_projetos"("projeto_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_funcionarios" ADD CONSTRAINT "fk_funcionarios_funcao" FOREIGN KEY ("funcao") REFERENCES "dg_0001"."cad_lookup"("lookup_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dg_0001"."cad_projetos" ADD CONSTRAINT "fk_projeto_empresa" FOREIGN KEY ("empresa_id") REFERENCES "dg_0001"."cad_empresas"("empresa_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "fk_auth_sessions_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "fk_tenant_memberships_tenant" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("tenant_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "fk_tenant_memberships_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_sessions_user_token_unique" ON "auth_sessions" USING btree ("user_id","token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");