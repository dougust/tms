import { BadRequestException, ValidationPipe } from '@nestjs/common';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      exceptionFactory: (validationErrors = []) => {
        const formatErrors = (
          errors: any[],
          parentPath = ''
        ): Record<string, string[]> => {
          const result: Record<string, string[]> = {};
          for (const err of errors) {
            const path = parentPath
              ? `${parentPath}.${err.property}`
              : err.property;
            if (err.constraints) {
              result[path] = Object.values(err.constraints);
            }
            if (err.children && err.children.length) {
              const childResult = formatErrors(err.children, path);
              for (const key of Object.keys(childResult)) {
                if (result[key]) {
                  result[key] = [...result[key], ...childResult[key]];
                } else {
                  result[key] = childResult[key];
                }
              }
            }
          }
          return result;
        };
        const errorsDict = formatErrors(validationErrors as any[]);
        return new BadRequestException({ message: errorsDict });
      },
    });
  }
}
