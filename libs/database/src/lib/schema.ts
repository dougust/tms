// Export all enums
export * from './enums';

// Export core tables
export * from './core-tables';


// Re-export the main tables for convenience
export { businesses, users, pessoaJuridica } from './core-tables';

// Re-export relations
export { businessesRelations } from './core-tables';
