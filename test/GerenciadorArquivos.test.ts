import * as fs from 'fs';
import * as path from 'path';
// 1. CORREÇÃO DE CAMINHO: Assume que o GerenciadorArquivos está na pasta raiz (../)
import { GerenciadorArquivos, TipoDado } from '../src/utils/GerenciadorArquivos'; 

// MOCKANDO O MÓDULO FS (File System)
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

// O mock de 'path' foi REMOVIDO. Usaremos a implementação real do Node.js, 
// que sabe como lidar com as diferenças de caminhos no Windows e no Jest.

describe('GerenciadorArquivos', () => {
    let gerenciador: GerenciadorArquivos;
    const mockData = [{ id: 1, nome: 'Teste' }];
    const tipo: TipoDado = 'livros';
    
    // Define o caminho real. path.join usará a implementação real do Node.js
    const DATA_DIR = path.join(process.cwd(), 'data');
    const filePath = path.join(DATA_DIR, `${tipo}.json`);

    // 2. CORREÇÃO ESTRUTURAL: Inicializa o Gerenciador antes de cada teste.
    beforeEach(() => {
        jest.clearAllMocks();
        // Inicializa uma nova instância da classe a cada teste
        gerenciador = new GerenciadorArquivos();
    });

    // --- TESTE DE SALVAMENTO (PERSISTÊNCIA) ---

    test('1. Deve salvar dados corretamente em formato JSON indentado', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true); // Simula que 'data' existe
        
        gerenciador.salvarDados(tipo, mockData);

        // O Jest agora compara o filePath resolvido pelo path.join real com o mock do fs.
        // O path.normalize garante que a string de caminho esteja no formato correto para comparação.
        const normalizedFilePath = path.normalize(filePath);
        
        // 1. Verifica se writeFileSync foi chamado com o caminho correto
        expect(fs.writeFileSync).toHaveBeenCalledWith(normalizedFilePath, expect.any(String), 'utf-8');

        // 2. Verifica se o conteúdo JSON está correto e formatado (indentação 2)
        const expectedJson = JSON.stringify(mockData, null, 2);
        expect(fs.writeFileSync).toHaveBeenCalledWith(normalizedFilePath, expectedJson, 'utf-8');
    });
    
    // --- TESTES DE CARREGAMENTO ---

    test('2. Deve carregar dados corretamente de um arquivo existente', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true); // Simula que o arquivo existe
        const dataJson = JSON.stringify(mockData);
        (fs.readFileSync as jest.Mock).mockReturnValue(dataJson); // Simula o conteúdo lido

        const loadedData = gerenciador.carregar(tipo);
        
        const normalizedFilePath = path.normalize(filePath);
        expect(fs.readFileSync).toHaveBeenCalledWith(normalizedFilePath, 'utf-8');
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

        // Espia o console.error para evitar poluir a saída do Jest com o "Aviso"
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        const loadedData = gerenciador.carregar(tipo);
        
        expect(loadedData).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore(); // Restaura a função console.error
    });
});