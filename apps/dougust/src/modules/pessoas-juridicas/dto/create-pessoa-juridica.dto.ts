import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreatePessoaJuridicaDto {
  @IsUUID()
  businessId!: string;

  @IsString()
  @Length(1, 50)
  cnpj!: string;

  @IsString()
  accessTokenEncrypted!: string;

  @IsString()
  @Length(1, 255)
  webhookVerifyToken!: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  nomeFantasia?: string | null;
}
