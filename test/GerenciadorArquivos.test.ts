import * as fs from 'fs';
import * as path from 'path';
import { GerenciadorArquivos, TipoDado } from '../src/GerenciadorArquivos';

// 1. MOCKANDO O MÓDULO FS (File System)
// Isso impede que os testes criem arquivos no seu disco real.
jest.mock('fs', () => ({
    // Simula o retorno de 'data/'
    existsSync: jest.fn(),
    // Mocka a criação de diretório, apenas registra que foi chamado
    mkdirSync: jest.fn(),
    // Mocka a escrita, apenas registra o que seria escrito
    writeFileSync: jest.fn(),
    // Mocka a leitura
    readFileSync: jest.fn(),
}));

// Mocka o path para simplificar o teste de caminho, mas usa o real para DATA_DIR
jest.mock('path', () => ({
    join: jest.fn((...args) => args.join('/')),
    resolve: jest.fn((...args) => args.join('/')),
    // Usamos o process.cwd real para simular o DATA_DIR
    cwd: () => process.cwd(),
}));


describe('GerenciadorArquivos', () => {
    let gerenciador: GerenciadorArquivos;
    const mockData = [{ id: 1, nome: 'Teste' }];
    const tipo: TipoDado = 'livros';
    const filePath = `MOCK_CWD/data/${tipo}.json`; // Caminho simulado

    beforeEach(() => {
        jest.clearAllMocks();
        // Garante que o método join do path retorne o caminho simulado para o arquivo
        (path.join as jest.Mock).mockImplementation((...args) => {
             if (args.length > 2 && args[args.length - 1].endsWith('.json')) {
                 return filePath;
             }
             return args.join('/');
        });
        
        gerenciador = new GerenciadorArquivos();
    });

    // --- TESTE DE SALVAMENTO (PERSISTÊNCIA) ---

    test('1. Deve salvar dados corretamente em formato JSON indentado', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true); // Simula que 'data' existe
        
        gerenciador.salvarDados(tipo, mockData);
        
        // Verifica se o diretório foi garantido (chamado mkdirSync)
        // Note: Neste mock, é chamado, mas não faz nada. 
        // O teste de garantirdiretorio abaixo valida a lógica de mkdirSync/existsSync
        
        // 1. Verifica se writeFileSync foi chamado com o caminho correto
        expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.any(String), 'utf-8');

        // 2. Verifica se o conteúdo JSON está correto e formatado (indentação 2)
        const expectedJson = JSON.stringify(mockData, null, 2);
        expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expectedJson, 'utf-8');
    });
    
    // --- TESTES DE CARREGAMENTO ---

    test('2. Deve carregar dados corretamente de um arquivo existente', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true); // Simula que o arquivo existe
        const dataJson = JSON.stringify(mockData);
        (fs.readFileSync as jest.Mock).mockReturnValue(dataJson); // Simula o conteúdo lido

        const loadedData = gerenciador.carregar(tipo);
        
        expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf-8');
        expect(loadedData).toEqual(mockData);
    });

    test('3. Deve retornar um array vazio se o arquivo não existir', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false); // Simula que o arquivo NÃO existe

        const loadedData = gerenciador.carregar(tipo);
        
        expect(loadedData).toEqual([]);
        expect(fs.readFileSync).not.toHaveBeenCalled(); // Não deve tentar ler
    });

    test('4. Deve retornar um array vazio se o arquivo estiver vazio (apenas espaços)', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue('   \n '); // Simula arquivo vazio

        const loadedData = gerenciador.carregar(tipo);
        
        expect(loadedData).toEqual([]);
    });

    test('5. Deve retornar um array vazio se o arquivo não contiver um array válido', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue('{"objeto": "nao-array"}'); // Simula objeto (não array)

        const loadedData = gerenciador.carregar(tipo);
        
        expect(loadedData).toEqual([]);
    });
});