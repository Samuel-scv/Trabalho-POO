// Biblioteca.test.ts

import { BibliotecaService } from '../src/Library/Biblioteca';
import { Livro } from '../src/Library/Livro';
import { Emprestimo } from '../src/Library/Emprestimo';
import { Membro } from '../src/User/Membro';
import { GerenciadorArquivos } from '../src/utils/GerenciadorArquivos';

// 1. MOCKANDO O SISTEMA DE ARQUIVOS
// Isso substitui a implementação real do GerenciadorArquivos pela nossa simulação.
jest.mock('./GerenciadorArquivos');
const MockGerenciadorArquivos = GerenciadorArquivos as jest.Mock<GerenciadorArquivos>;

// Dados de teste
const mockLivro = new Livro('1984', 'George Orwell', '978-85-359-0091-6', 1949);
const mockMembro = new Membro('Alice Silva', 'Rua A', '12345678', 'M001');

// Simula dados crus que seriam carregados do JSON
const dadosLivroCru = { _titulo: mockLivro.titulo, _autor: mockLivro.autor, _isbn: mockLivro.isbn, _anoPublicacao: mockLivro.anoPublicacao, _disponivel: true };
const dadosMembroCru = { _nome: mockMembro.nome, _endereco: mockMembro.endereco, _telefone: mockMembro.telefone, _numeroMatricula: mockMembro.numeroMatricula };
const dadosEmprestimoCru = { livroIsbn: mockLivro.isbn, membroMatricula: mockMembro.numeroMatricula, _dataEmprestimo: new Date().toISOString(), _devolvido: false };


describe('BibliotecaService - Testes de Unidade e Persistência', () => {
    let biblioteca: BibliotecaService;
    let mockSalvarDados: jest.Mock;
    let mockCarregarDados: jest.Mock;

    beforeEach(() => {
        // Zera todas as simulações e funções mockadas antes de cada teste
        jest.clearAllMocks();

        // Define as funções mockadas
        mockCarregarDados = jest.fn((tipo: string) => {
            // Garante que o sistema inicia sempre com listas vazias ou o dado configurado
            if (tipo === 'livros') return [];
            if (tipo === 'membros') return [];
            if (tipo === 'emprestimos') return [];
            return [];
        });
        mockSalvarDados = jest.fn();

        // Implementa o mock para a classe GerenciadorArquivos
        MockGerenciadorArquivos.mockImplementation(() => {
            return {
                carregar: mockCarregarDados,
                salvarDados: mockSalvarDados,
            } as any as GerenciadorArquivos;
        });

        // Inicializa o serviço (o construtor chama carregarDados)
        biblioteca = new BibliotecaService();
        mockSalvarDados.mockClear(); // Limpa chamadas de salvarDados do construtor
    });

    // --- TESTES DE LIVROS ---

    test('1. Deve adicionar um livro e chamar salvarDados', () => {
        biblioteca.adicionarLivro(mockLivro);

        expect(biblioteca.listarLivros()).toHaveLength(1);
        expect(mockSalvarDados).toHaveBeenCalledTimes(3); // Verifica persistência: livros, membros, emprestimos
        expect(mockLivro.disponivel).toBe(true);
    });

    test('2. Deve atualizar o título de um livro e chamar salvarDados', () => {
        biblioteca.adicionarLivro(mockLivro);
        mockSalvarDados.mockClear();

        const sucesso = biblioteca.atualizarLivro(mockLivro.isbn, { titulo: '1984 - Nova Edição' });

        expect(sucesso).toBe(true);
        expect(biblioteca.buscarLivroPorIsbn(mockLivro.isbn)?.titulo).toBe('1984 - Nova Edição');
        expect(mockSalvarDados).toHaveBeenCalledTimes(3); // Verifica persistência
    });

    test('3. Deve remover um livro e chamar salvarDados', () => {
        biblioteca.adicionarLivro(mockLivro);
        mockSalvarDados.mockClear();

        const sucesso = biblioteca.removerLivro(mockLivro.isbn);

        expect(sucesso).toBe(true);
        expect(biblioteca.listarLivros()).toHaveLength(0);
        expect(mockSalvarDados).toHaveBeenCalledTimes(3); // Verifica persistência
    });

    // --- TESTES DE MEMBROS ---

    test('4. Deve adicionar um membro e chamar salvarDados', () => {
        biblioteca.adicionarMembro(mockMembro);

        expect(biblioteca.listarMembros()).toHaveLength(1);
        expect(mockSalvarDados).toHaveBeenCalledTimes(3); // Verifica persistência
    });

    test('5. Deve atualizar o telefone de um membro e chamar salvarDados', () => {
        biblioteca.adicionarMembro(mockMembro);
        mockSalvarDados.mockClear();

        const sucesso = biblioteca.atualizarMembro(mockMembro.numeroMatricula, { telefone: '99999-0000' });

        expect(sucesso).toBe(true);
        expect(biblioteca.buscarMembroPorMatricula(mockMembro.numeroMatricula)?.telefone).toBe('99999-0000');
        expect(mockSalvarDados).toHaveBeenCalledTimes(3); // Verifica persistência
    });

    test('6. Deve remover um membro e chamar salvarDados', () => {
        biblioteca.adicionarMembro(mockMembro);
        mockSalvarDados.mockClear();

        const sucesso = biblioteca.removerMembro(mockMembro.numeroMatricula);

        expect(sucesso).toBe(true);
        expect(biblioteca.listarMembros()).toHaveLength(0);
        expect(mockSalvarDados).toHaveBeenCalledTimes(3); // Verifica persistência
    });

    // --- TESTES DE EMPRÉSTIMOS (Regras de Negócio) ---

    test('7. Deve realizar um empréstimo com sucesso', () => {
        biblioteca.adicionarLivro(mockLivro);
        biblioteca.adicionarMembro(mockMembro);
        mockSalvarDados.mockClear();

        const resultado = biblioteca.realizarEmprestimo(mockLivro.isbn, mockMembro.numeroMatricula);

        expect(resultado.sucesso).toBe(true);
        expect(resultado.mensagem).toBe("Empréstimo realizado com sucesso.");
        expect(mockLivro.disponivel).toBe(false);
        expect(biblioteca.listarEmprestimosAtivos()).toHaveLength(1);
        expect(mockSalvarDados).toHaveBeenCalledTimes(3); // Verifica persistência
    });

    test('8. Deve falhar ao realizar empréstimo se o livro não estiver disponível', () => {
        // Simula livro já emprestado
        mockLivro.disponivel = false;
        biblioteca.adicionarLivro(mockLivro);
        biblioteca.adicionarMembro(mockMembro);
        mockSalvarDados.mockClear();

        const resultado = biblioteca.realizarEmprestimo(mockLivro.isbn, mockMembro.numeroMatricula);

        expect(resultado.sucesso).toBe(false);
        expect(resultado.mensagem).toBe("Livro já está emprestado.");
        expect(mockSalvarDados).not.toHaveBeenCalled(); // Não deve salvar se falhar
    });

    test('9. Deve falhar ao realizar empréstimo se o membro atingir o limite (3)', () => {
        biblioteca.adicionarMembro(mockMembro);

        // 4 livros para testar o limite
        const livros = [
            new Livro('L1', 'A1', '1', 2000),
            new Livro('L2', 'A2', '2', 2000),
            new Livro('L3', 'A3', '3', 2000),
            new Livro('L4', 'A4', '4', 2000)
        ];
        livros.forEach(l => biblioteca.adicionarLivro(l));

        // 1. Realiza 3 empréstimos
        biblioteca.realizarEmprestimo(livros[0].isbn, mockMembro.numeroMatricula);
        biblioteca.realizarEmprestimo(livros[1].isbn, mockMembro.numeroMatricula);
        biblioteca.realizarEmprestimo(livros[2].isbn, mockMembro.numeroMatricula);

        // 2. Tenta o 4º empréstimo
        const resultadoFinal = biblioteca.realizarEmprestimo(livros[3].isbn, mockMembro.numeroMatricula);

        expect(biblioteca.listarEmprestimosAtivos()).toHaveLength(3);
        expect(resultadoFinal.sucesso).toBe(false);
        expect(resultadoFinal.mensagem).toBe("Membro atingiu o limite de 3 empréstimos simultâneos.");
        // Verifica que houve 3 chamadas de salvamento para os 3 empréstimos válidos + 4 livros + 1 membro (4 + 1 + 3) * 3 = 24. A última tentativa falha, então não deve haver chamadas adicionais.
        // O número exato é (1 membro + 4 livros) * 3 = 15. Depois, 3 empréstimos * 3 = 9. Total: 24 chamadas.
        expect(mockSalvarDados).toHaveBeenCalledTimes(24);
    });

    test('10. Deve registrar devolução com sucesso e liberar o livro', () => {
        // 1. Configuração de um estado inicial com empréstimo ativo
        mockCarregarDados.mockImplementation((tipo: string) => {
            if (tipo === 'livros') return [{ ...dadosLivroCru, _disponivel: false }]; // Livro indisponível
            if (tipo === 'membros') return [dadosMembroCru];
            if (tipo === 'emprestimos') return [dadosEmprestimoCru];
            return [];
        });
        // Recria o serviço para carregar o estado
        biblioteca = new BibliotecaService();
        mockSalvarDados.mockClear();

        // 2. Execução
        const resultado = biblioteca.registrarDevolucao(mockLivro.isbn);

        // 3. Verificação
        expect(resultado.sucesso).toBe(true);
        expect(resultado.mensagem).toBe("Devolução registrada com sucesso.");
        // Livro deve ser liberado
        expect(biblioteca.buscarLivroPorIsbn(mockLivro.isbn)?.disponivel).toBe(true);
        // Empréstimo deve estar marcado como devolvido
        const historico = biblioteca.listarHistoricoEmprestimos();
        expect(historico.find(e => e.livro.isbn === mockLivro.isbn)?.devolvido).toBe(true);
        expect(mockSalvarDados).toHaveBeenCalledTimes(3); // Verifica persistência
    });

    test('11. Deve falhar ao registrar devolução para um empréstimo inexistente/já devolvido', () => {
        const resultado = biblioteca.registrarDevolucao('ISBN-FALSO');

        expect(resultado.sucesso).toBe(false);
        expect(resultado.mensagem).toBe("Não foi encontrado empréstimo ativo para este livro.");
        expect(mockSalvarDados).not.toHaveBeenCalled();
    });

    // --- TESTES DE ESTRUTURA ---

    test('12. Teste de desserialização: Deve reconstruir Empréstimos corretamente', () => {
        const livroEmprestado = new Livro('Livro Único', 'Autor', 'U001', 2020);
        const membroAtivo = new Membro('Membro Ativo', 'End', 'Tel', 'A001');

        // Simula dados carregados do disco
        mockCarregarDados.mockImplementation((tipo: string) => {
            if (tipo === 'livros') return [{ ...livroEmprestado, _disponivel: false }];
            if (tipo === 'membros') return [{ ...membroAtivo }];
            if (tipo === 'emprestimos') return [
                { livroIsbn: 'U001', membroMatricula: 'A001', _dataEmprestimo: new Date().toISOString(), _devolvido: false }
            ];
            return [];
        });

        const bibliotecaNova = new BibliotecaService();

        // Verifica se o objeto Emprestimo foi criado e se as referências (livro/membro) foram religadas
        expect(bibliotecaNova.listarEmprestimosAtivos()).toHaveLength(1);
        const emprestimo = bibliotecaNova.listarEmprestimosAtivos()[0];

        // Verifica se é uma instância da classe correta
        expect(emprestimo).toBeInstanceOf(Emprestimo);
        expect(emprestimo.livro).toBeInstanceOf(Livro);
        expect(emprestimo.membro).toBeInstanceOf(Membro);

        // Verifica o relacionamento
        expect(emprestimo.livro.isbn).toBe('U001');
        expect(emprestimo.membro.numeroMatricula).toBe('A001');
    });
});
