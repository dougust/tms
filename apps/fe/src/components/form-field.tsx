import { Input } from '@dougust/ui';
import { ZodError } from 'zod/v4';

export type FormFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  state: {
    value?: string;
    meta: {
      errors: (string | ZodError)[];
    };
  };
  handleChange: (value: string) => void;
  handleBlur: () => void;
};

export const FormField = (field: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={field.id} className="text-sm font-medium">
        {field.label}
      </label>
      <Input
        id={field.id}
        type={field.type}
        placeholder={field.placeholder}
        value={field.state.value || ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        maxLength={100}
        aria-invalid={field.state.meta.errors.length > 0}
      />

      {field.state.meta.errors[0] && (
        <p className="text-xs text-red-600">
          {typeof field.state.meta.errors[0] === 'string'
            ? field.state.meta.errors[0]
            : field.state.meta.errors[0].message}
        </p>
      )}
    </div>
  );
};
