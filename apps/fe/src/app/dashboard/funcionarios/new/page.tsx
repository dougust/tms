'use client';

import {
  CreateFuncionarioDto,
  createFuncionarioDtoSchema,
  useFuncionariosControllerCreate,
  useProjetosControllerFindAll,
  ProjetoDto,
} from '@dougust/clients';
import { Button } from '@dougust/ui';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { FormField, FormPageLayout } from '../../../../components';

const defaultValues: CreateFuncionarioDto = {
  cpf: '',
  email: '',
  nome: '',
  social: '',
  nascimento: '',
  phone: '',
  rg: '',
  projetoId: '',
  funcao: '',
  valor_diaria: '',
  valor_almoco: '',
  valor_cafe: '',
  valor_saude_ocupacional: '',
  valor_saude_plano: '',
  valor_janta: '',
  valor_desconto_casa: '',
  salario: '',
  dependetes: '',
};

export default function NewFuncionarioPage() {
  const router = useRouter();
  const createMutation = useFuncionariosControllerCreate();
  const { data: projetos = [], isPending: isProjetosPending, isError: isProjetosError } =
    useProjetosControllerFindAll<ProjetoDto[]>();

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
              // The `form` key is optional
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
                    <option value="">{isProjetosPending ? 'Carregando projetos...' : 'Selecione um projeto'}</option>
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
            <form.Field
              name="funcao"
              children={(field) => (
                <FormField
                  id="funcao"
                  label="Função"
                  type="text"
                  placeholder="Ex: Servente, Pedreiro, Mestre de obras"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />
          </div>
        </div>

        {/* Valores e Benefícios */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Valores e Benefícios</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Valor Diária */}
            <form.Field
              name="valor_diaria"
              children={(field) => (
                <FormField
                  id="valor_diaria"
                  label="Valor da Diária"
                  type="text"
                  placeholder="0,00"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Valor Almoço */}
            <form.Field
              name="valor_almoco"
              children={(field) => (
                <FormField
                  id="valor_almoco"
                  label="Valor do Almoço"
                  type="text"
                  placeholder="0,00"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Valor Café */}
            <form.Field
              name="valor_cafe"
              children={(field) => (
                <FormField
                  id="valor_cafe"
                  label="Valor do Café"
                  type="text"
                  placeholder="0,00"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Valor Janta */}
            <form.Field
              name="valor_janta"
              children={(field) => (
                <FormField
                  id="valor_janta"
                  label="Valor da Janta"
                  type="text"
                  placeholder="0,00"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Saúde Ocupacional */}
            <form.Field
              name="valor_saude_ocupacional"
              children={(field) => (
                <FormField
                  id="valor_saude_ocupacional"
                  label="Saúde Ocupacional"
                  type="text"
                  placeholder="0,00"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Plano de Saúde */}
            <form.Field
              name="valor_saude_plano"
              children={(field) => (
                <FormField
                  id="valor_saude_plano"
                  label="Plano de Saúde"
                  type="text"
                  placeholder="0,00"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Desconto Casa */}
            <form.Field
              name="valor_desconto_casa"
              children={(field) => (
                <FormField
                  id="valor_desconto_casa"
                  label="Desconto Casa"
                  type="text"
                  placeholder="0,00"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Salário */}
            <form.Field
              name="salario"
              children={(field) => (
                <FormField
                  id="salario"
                  label="Salário"
                  type="text"
                  placeholder="0,00"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Dependentes */}
            <form.Field
              name="dependetes"
              children={(field) => (
                <FormField
                  id="dependetes"
                  label="Dependentes"
                  type="text"
                  placeholder="0"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />
          </div>
        </div>

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
