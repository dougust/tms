'use client';

import {
  CreateFuncionarioDto,
  createFuncionarioDtoSchema,
  useFuncionariosControllerCreate,
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
  rg: ''
};

export default function NewFuncionarioPage() {
  const router = useRouter();
  const createMutation = useFuncionariosControllerCreate();

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
