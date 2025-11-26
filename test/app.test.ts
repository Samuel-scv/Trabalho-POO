// Para rodar este teste complexo, é necessário usar o Jest e mocks.
// O mock do 'readline' deve vir antes de qualquer import que o utilize.

// 1. MOCKANDO O READLINE: Simula as respostas do usuário no terminal.
// A fila de respostas deve ser ajustada para testar fluxos diferentes.
const mockAnswers: string[] = [
    '1',    // Menu Principal: 1. Gerenciar Livros
    '1',    // Menu Livros: 1. Adicionar livro
    'O Senhor dos Anéis', // Título
    'J.R.R. Tolkien',     // Autor
    '123-456',            // ISBN
    '1954',               // Ano
    '5',    // Menu Livros: 5. Voltar
    '4'     // Menu Principal: 4. Sair
];
let answerIndex = 0;

jest.mock('readline', () => ({
    createInterface: jest.fn(() => ({
        // Simula a função question que captura a entrada do usuário
        question: jest.fn((pergunta, callback) => {
            const answer = mockAnswers[answerIndex++];
            // Usa process.nextTick para simular o assíncrono do readline
            process.nextTick(() => callback(answer));
        }),
        close: jest.fn(), // Mocka o fechamento da interface
    })),
}));

// 2. MOCKANDO O GerenciadorArquivos: Isola a CLI de qualquer leitura/escrita de arquivo real.
jest.mock('../src/utils/GerenciadorArquivos', () => {
    return {
        // Mocka a classe em si, para que o constructor da Biblioteca possa usá-lo
        GerenciadorArquivos: jest.fn(() => ({
            carregar: jest.fn(() => []), // Sempre retorna lista vazia ao iniciar o teste
            salvarDados: jest.fn(),      // Apenas registra que a persistência foi chamada
        })),
        // Exporta o tipo TipoDado (opcional, mas bom para tipagem)
        TipoDado: {}
    };
});

// Mocka as classes de entidade para evitar erros de referência
// e garantir que o service (Biblioteca) as aceite.
jest.mock('../src/Library/Livro', () => ({
    Livro: jest.fn().mockImplementation((titulo, autor, isbn, ano) => ({
        titulo, autor, isbn, ano,
        toString: jest.fn(() => `Livro Mock: ${titulo}`)
    }))
}));
jest.mock('../src/User/Membro', () => ({
    Membro: jest.fn().mockImplementation((nome, endereco, telefone, matricula) => ({
        nome, endereco, telefone, matricula,
        toString: jest.fn(() => `Membro Mock: ${nome}`)
    }))
}));


// Importa o serviço e a CLI para o teste
import { BibliotecaService } from '../src/Library/Biblioteca';

describe('BibliotecaCLI - Teste de Interface de Usuário', () => {
    
    // Espiona o console para capturar a saída
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    // Mocka o processo de saída para que o Jest não seja interrompido
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        // Lançar um erro aqui força a parada do loop while(true) na CLI
        throw new Error('Processo finalizado intencionalmente');
    });
    
    // Limpa a saída do console e o índice das respostas antes de cada teste
    beforeEach(() => {
        answerIndex = 0;
        mockConsoleLog.mockClear();
    });

    test('1. Deve simular o fluxo de menus e uma operação de Adição de Livro', async () => {
        const cli = new BibliotecaService();
        
        try {
            await cli.iniciar(); 
        } catch (error) {
            // Esperamos que o erro intencional de saída do processo ocorra
            expect((error as Error).message).toBe('Processo finalizado intencionalmente');
        }

        // --- Verificações de Fluxo e Mensagens ---
        
        // Verifica o menu principal
        expect(mockConsoleLog).toHaveBeenCalledWith('=== SISTEMA DE BIBLIOTECA ===');
        
        // Verifica a mensagem de sucesso da operação (Adicionar livro)
        expect(mockConsoleLog).toHaveBeenCalledWith('Livro adicionado com sucesso!');
        
        // Verifica se a saída final foi chamada
        expect(mockConsoleLog).toHaveBeenCalledWith('Saindo do sistema...');
        expect(mockExit).toHaveBeenCalledWith(0);
    });

    afterAll(() => {
        // Restaura as funções originais
        mockExit.mockRestore();
        mockConsoleLog.mockRestore();
    });
});