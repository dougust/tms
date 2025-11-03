'use client';

import type { CreateFuncionarioDto } from '@dougust/clients';
import { useFuncionariosControllerCreate } from '@dougust/clients';
import { Button, Input } from '@dougust/ui';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';

const defaultValues: CreateFuncionarioDto = {
  cpf: '',
  email: '',
  nome: '',
  social: '',
  nascimento: '',
  phone: '',
  rg: '',
};

export default function NewFuncionarioPage() {
  const router = useRouter();
  const createMutation = useFuncionariosControllerCreate();

  const form = useForm({
    defaultValues,
    validators: {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard/funcionarios"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Funcionarios
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Funcionario
          </h1>
          <p className="text-muted-foreground">
            Fill in the details to create a new funcionario
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-muted/50 p-6">
          <h2 className="text-lg font-semibold">Funcionario Details</h2>
          <p className="text-sm text-muted-foreground">* Required fields</p>
        </div>

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
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    if (value.length < 1 || value.length > 100) {
                      return 'Nome must be between 1 and 100 characters';
                    }
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="space-y-2">
                    <label htmlFor="nome" className="text-sm font-medium">
                      Nome (Legal Name)
                    </label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Enter legal name"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      maxLength={100}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Social */}
              <form.Field
                name="social"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    if (value.length > 100) {
                      return 'Social must be between 1 and 100 characters';
                    }
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="space-y-2">
                    <label htmlFor="social" className="text-sm font-medium">
                      Social Name (Fantasy Name)
                    </label>
                    <Input
                      id="social"
                      type="text"
                      placeholder="Enter social/fantasy name"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      maxLength={100}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* CPF */}
              <form.Field
                name="cpf"
                validators={{
                  onChange: ({ value }) => {
                    if (!value?.trim()) return 'CPF is required';
                    if (value.length < 1 || value.length > 15) {
                      return 'CPF must be between 1 and 15 characters';
                    }
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="space-y-2">
                    <label htmlFor="cpf" className="text-sm font-medium">
                      CPF <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      maxLength={15}
                      required
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* RG */}
              <form.Field
                name="rg"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    if (value.length < 1 || value.length > 11) {
                      return 'RG must be between 1 and 11 characters';
                    }
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="space-y-2">
                    <label htmlFor="rg" className="text-sm font-medium">
                      RG
                    </label>
                    <Input
                      id="rg"
                      type="text"
                      placeholder="Enter RG number"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      maxLength={11}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Nascimento */}
              <form.Field
                name="nascimento"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    // Simple YYYY-MM-DD check via input type date, no extra validation
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="space-y-2">
                    <label htmlFor="nascimento" className="text-sm font-medium">
                      Birth Date
                    </label>
                    <Input
                      id="nascimento"
                      type="date"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contact Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Email */}
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    if (!value?.trim()) return 'Email is required';
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      return 'Invalid email format';
                    }
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      required
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Phone */}
              <form.Field
                name="phone"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    if (value.length < 1 || value.length > 20) {
                      return 'Phone must be between 1 and 20 characters';
                    }
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      maxLength={20}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-red-600">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
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
      </div>
    </div>
  );
}
