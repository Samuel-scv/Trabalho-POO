
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Define o ambiente de teste como Node.js (ideal para projetos backend)
  testEnvironment: 'node', 
  
  // Informa ao Jest que ele deve procurar por arquivos .ts e .tsx
  testMatch: [
    "**/__tests__/**/*.ts?(x)", 
    "**/?(*.)+(spec|test).ts?(x)"
  ],

  // Define o 'preset' (predefinição) para usar o ts-jest, 
  // que lida com a compilação de TypeScript automaticamente.
  preset: 'ts-jest',

  // Configuração opcional: 
  // Define onde estão os arquivos de código-fonte que devem ser testados.
  roots: [
    "<rootDir>/src",
    "<rootDir>/"
  ],

  // Permite que você use imports baseados em caminhos relativos
  moduleDirectories: [
    "node_modules",
    "src"
  ]
};