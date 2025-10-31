// Export all enums
export * from './enums';

// Export core tables
export * from './core-tables';


// Re-export the main tables for convenience
export { tenant, users, pessoasJuridicas } from './core-tables';

// Re-export relations
export { tenantsRelations } from './core-tables';
