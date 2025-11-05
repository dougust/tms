'use client';

import {
  CreateEmpresaDto,
  createEmpresaDtoSchema,
  useEmpresasControllerCreate,
} from '@dougust/clients';
import { Button } from '@dougust/ui';
import { Loader2, Save, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { FormField, FormPageLayout } from '../../../../components';

const defaultValues: CreateEmpresaDto = {
  razao: '',
  fantasia: '',
  cnpj: '',
  registro: '',
  phone: '',
  email: '',
};

export default function NewEmpresaPage() {
  const router = useRouter();
  const createMutation = useEmpresasControllerCreate();

  const form = useForm({
    defaultValues,
    validators: {
      onChange: createEmpresaDtoSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          await createMutation.mutateAsync({ data: value });
          router.push('/dashboard/empresas');
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
        text: 'Retornar para lista de empresas',
        href: '/dashboard/empresas',
      }}
      title="Criar nova Empresa"
      description="Preencha os campos abaixo para criar uma nova empresa."
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
              Falha ao criar empresa. Tente novamente.
            </p>
          </div>
        )}

        {/* Company Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Dados da empresa
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Razão Social */}
            <form.Field
              name="razao"
              children={(field) => (
                <FormField
                  id="razao"
                  label="Razão Social"
                  type="text"
                  placeholder="Digite a razão social"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Nome Fantasia */}
            <form.Field
              name="fantasia"
              children={(field) => (
                <FormField
                  id="fantasia"
                  label="Nome Fantasia"
                  type="text"
                  placeholder="Digite o nome fantasia"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* CNPJ */}
            <form.Field
              name="cnpj"
              children={(field) => (
                <FormField
                  id="cnpj"
                  label="CNPJ"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Registro */}
            <form.Field
              name="registro"
              children={(field) => (
                <FormField
                  id="registro"
                  label="Registro"
                  type="text"
                  placeholder="Número de registro"
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
          <h3 className="text-sm font-semibold">Informações de contato</h3>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Email */}
            <form.Field
              name="email"
              children={(field) => (
                <FormField
                  id="email"
                  label="Email"
                  placeholder="email@empresa.com"
                  type="email"
                  state={field.state}
                  handleChange={field.handleChange}
                  handleBlur={field.handleBlur}
                />
              )}
            />

            {/* Telefone */}
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
          <Link href="/dashboard/empresas">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Criar Empresa
              </>
            )}
          </Button>
        </div>
      </form>
    </FormPageLayout>
  );
}
