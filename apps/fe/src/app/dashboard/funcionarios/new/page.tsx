'use client';

import {
  CreateFuncionarioDto,
  createFuncionarioDtoSchema,
  useFuncionariosControllerCreate,
  useProjetosControllerFindAll,
  ProjetoDto,
  useLookupsControllerFindByGroup,
  LookupDto,
} from '@dougust/clients';
import { Button } from '@dougust/ui';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { FormField, FormPageLayout } from '../../../../components';

const defaultValues: CreateFuncionarioDto = {
  projetoId: '',
  cpf: '',
  email: '',
  nome: '',
  social: '',
  nascimento: '',
  phone: '',
  rg: '',
  funcao: '',
  dependetes: 0,
};

export default function NewFuncionarioPage() {
  const router = useRouter();
  const createMutation = useFuncionariosControllerCreate();
  const {
    data: projetos = [],
    isPending: isProjetosPending,
    isError: isProjetosError,
  } = useProjetosControllerFindAll<ProjetoDto[]>();

  const {
    data: funcoes = [],
    isPending: isFuncoesPending,
    isError: isFuncoesError,
  } = useLookupsControllerFindByGroup<LookupDto[]>('Funcao');

  const form = useForm({
    defaultValues,
    validators: {
      onChange: createFuncionarioDtoSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          await createMutation.mutateAsync({ data: value });
          router.push('/dashboard/funcionarios');
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message;
          if (errorMessage) {
            return {
              fields: {
                ...errorMessage,
              },
            };
          }
        }
      },
    },
  });

  return (
    <FormPageLayout
      returnButton={{
        text: 'Retornar para lista de funcionarios',
        href: '/dashboard/funcionarios',
      }}
      title="Criar novo Funcionario"
      description="Preencha os campos abaixo para criar um novo funcionario."
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await form.handleSubmit();
        }}
        className="p-6 space-y-6"
      >
        {/* Error Banner */}
        {createMutation.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Failed to create funcionario. Please try again.
            </p>
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Personal Information</h3>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Nome */}
            <form.Field
              name="nome"
              children={(field) => (
                <FormField
                  id="nome"
                  label="Nome"
                  type="text"
                  placeholder="Digite o nome"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Social */}
            <form.Field
              name="social"
              children={(field) => (
                <FormField
                  id="social"
                  label="Apelido"
                  type="text"
                  placeholder="Digite o apelido"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* CPF */}
            <form.Field
              name="cpf"
              children={(field) => (
                <FormField
                  id="cpf"
                  label="CPF"
                  type="text"
                  placeholder="000.000.000-00"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* RG */}
            <form.Field
              name="rg"
              children={(field) => (
                <FormField
                  id="rg"
                  label="RG"
                  type="text"
                  placeholder="Enter RG number"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Nascimento */}
            <form.Field
              name="nascimento"
              children={(field) => (
                <FormField
                  id="nascimento"
                  label="Data de Nascimento"
                  type="date"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Informacao de contato</h3>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Email */}
            <form.Field
              name="email"
              children={(field) => (
                <FormField
                  id="email"
                  label="Email"
                  placeholder="email@example.com"
                  type="email"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Phone */}
            <form.Field
              name="phone"
              children={(field) => (
                <FormField
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  label="Telefone"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />
          </div>
        </div>

        {/* Projeto e Função */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Projeto e Função</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Projeto */}
            <form.Field
              name="projetoId"
              children={(field) => (
                <div className="space-y-2">
                  <label htmlFor="projetoId" className="text-sm font-medium">
                    Projeto
                  </label>
                  <select
                    id="projetoId"
                    className="border rounded-md px-3 py-2 bg-background"
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isProjetosPending || isProjetosError}
                  >
                    <option value="">
                      {isProjetosPending
                        ? 'Carregando projetos...'
                        : 'Selecione um projeto'}
                    </option>
                    {projetos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                  {field.state.meta.errors[0] && (
                    <p className="text-xs text-red-600">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : (field.state.meta.errors[0] as any).message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Função */}
            {
              <form.Field
                name="funcao"
                children={(field) => (
                  <div className="space-y-2">
                    <label htmlFor="funcao" className="text-sm font-medium">
                      Função
                    </label>
                    <select
                      id="funcao"
                      className="border rounded-md px-3 py-2 bg-background"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={isFuncoesPending || isFuncoesError}
                    >
                      <option value="">
                        {isFuncoesPending ? 'Carregando funções...' : 'Selecione uma função'}
                      </option>
                      {funcoes.map((f) => (
                        <option key={`${f.grupo}-${f.nome}`} value={f.nome!}>
                          {f.nome}
                        </option>
                      ))}
                    </select>
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-red-600">
                        {typeof field.state.meta.errors[0] === 'string'
                          ? field.state.meta.errors[0]
                          : (field.state.meta.errors[0] as any).message}
                      </p>
                    )}
                  </div>
                )}
              />
            }
          </div>
        </div>

        {/* Benefícios (opcional) */}
        <details className="space-y-4 border rounded-md p-4" open={false as any}>
          <summary className="cursor-pointer list-none text-sm font-semibold select-none">
            Benefícios
            <span className="ml-2 text-xs font-normal text-muted-foreground">(opcional)</span>
          </summary>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Valor Café */}
            <form.Field
              name="valorCafe"
              children={(field) => (
                <div className="space-y-2">
                  <label htmlFor="valorCafe" className="text-sm font-medium">
                    Valor Café
                  </label>
                  <input
                    id="valorCafe"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    className="border rounded-md px-3 py-2 bg-background"
                    value={(field.state.value as any) ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.handleChange((v === '' ? undefined : Number(v)) as any);
                    }}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors[0] && (
                    <p className="text-xs text-red-600">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : (field.state.meta.errors[0] as any).message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Valor Saúde Ocupacional */}
            <form.Field
              name="valorSaudeOcupacional"
              children={(field) => (
                <div className="space-y-2">
                  <label htmlFor="valorSaudeOcupacional" className="text-sm font-medium">
                    Valor Saúde Ocupacional
                  </label>
                  <input
                    id="valorSaudeOcupacional"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    className="border rounded-md px-3 py-2 bg-background"
                    value={(field.state.value as any) ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.handleChange((v === '' ? undefined : Number(v)) as any);
                    }}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors[0] && (
                    <p className="text-xs text-red-600">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : (field.state.meta.errors[0] as any).message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Valor Plano Saúde */}
            <form.Field
              name="valorSaudePlano"
              children={(field) => (
                <div className="space-y-2">
                  <label htmlFor="valorSaudePlano" className="text-sm font-medium">
                    Valor Plano Saúde
                  </label>
                  <input
                    id="valorSaudePlano"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    className="border rounded-md px-3 py-2 bg-background"
                    value={(field.state.value as any) ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.handleChange((v === '' ? undefined : Number(v)) as any);
                    }}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors[0] && (
                    <p className="text-xs text-red-600">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : (field.state.meta.errors[0] as any).message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Valor Janta */}
            <form.Field
              name="valorJanta"
              children={(field) => (
                <div className="space-y-2">
                  <label htmlFor="valorJanta" className="text-sm font-medium">
                    Valor Janta
                  </label>
                  <input
                    id="valorJanta"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    className="border rounded-md px-3 py-2 bg-background"
                    value={(field.state.value as any) ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.handleChange((v === '' ? undefined : Number(v)) as any);
                    }}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors[0] && (
                    <p className="text-xs text-red-600">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : (field.state.meta.errors[0] as any).message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Valor Desconto Casa */}
            <form.Field
              name="valorDescontoCasa"
              children={(field) => (
                <div className="space-y-2">
                  <label htmlFor="valorDescontoCasa" className="text-sm font-medium">
                    Valor Desconto Casa
                  </label>
                  <input
                    id="valorDescontoCasa"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    className="border rounded-md px-3 py-2 bg-background"
                    value={(field.state.value as any) ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.handleChange((v === '' ? undefined : Number(v)) as any);
                    }}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors[0] && (
                    <p className="text-xs text-red-600">
                      {typeof field.state.meta.errors[0] === 'string'
                        ? field.state.meta.errors[0]
                        : (field.state.meta.errors[0] as any).message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </details>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link href="/dashboard/funcionarios">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Create Funcionario
              </>
            )}
          </Button>
        </div>
      </form>
    </FormPageLayout>
  );
}
