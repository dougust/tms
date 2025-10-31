CREATE TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."funcionarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cpf" varchar(12) NOT NULL,
	"projetos_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "funcionarios_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."projetos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(255) NOT NULL,
	"descricao" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."funcionarios" ADD CONSTRAINT "funcionarios_projetos_id_projetos_id_fk" FOREIGN KEY ("projetos_id") REFERENCES "c0dab083-af8d-46ab-6f31-3849aa772d68"."projetos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."pessoas_juridicas" DROP COLUMN "access_token_encrypted";--> statement-breakpoint
ALTER TABLE "c0dab083-af8d-46ab-6f31-3849aa772d68"."pessoas_juridicas" DROP COLUMN "webhook_verify_token";