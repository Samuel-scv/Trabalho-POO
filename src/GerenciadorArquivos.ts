import * as fs from 'fs';
import * as path from 'path';

// Define os tipos de arquivos válidos para evitar erros de digitação.
export type TipoDado = 'livros' | 'membros' | 'emprestimos';

// Define o caminho da pasta onde os arquivos JSON serão salvos.
const DATA_DIR = path.join(process.cwd(), 'data');

export class GerenciadorArquivos {
    // Cria o caminho completo do arquivo (ex: .../data/livros.json)
    private getFilePath(tipo: TipoDado): string {
        return path.join(DATA_DIR, `${tipo}.json`);
    }

    // Verifica se a pasta 'data' existe. Se não, cria ela.
    private garantirDiretorio(): void {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true});
        }
    }

    // Salva qualquer array de dados (Genérico <T>) em um arquivo JSON.
    public salvarDados<T>(tipo: TipoDado, data: T[]): void {
        this.garantirDiretorio();
        const filePath = this.getFilePath(tipo);
        try {
            // Converte o array de objetos para texto JSON formatado.
            const jsonString = JSON.stringify(data, null, 2);
            fs.writeFileSync(filePath, jsonString, 'utf-8');
        } catch (error) {
            console.error(`Erro ao salvar dados de ${tipo}:`, error);
        }
    }

    // Lê os dados do arquivo e converte de volta para objetos.
    public carregar<T>(tipo: TipoDado): T[] {
     const filePath = this.getFilePath(tipo);
     
     // Se o arquivo não existir, retorna uma lista vazia para começar do zero.
     if (!fs.existsSync(filePath)) {
        return [];
     }

     try {
        const data = fs.readFileSync(filePath, 'utf-8');
        // Se o arquivo estiver vazio, retorna lista vazia.
        if (!data.trim()) {
            return [];
        }
        
        const parsedData = JSON.parse(data);
        
        // Garante que o que foi lido é realmente uma lista (array).
        if (Array.isArray(parsedData)) {
            return parsedData as T[];
        } else {
            console.error(`Aviso: Dados de ${filePath} não são um array válido.`);
            return [];
        }
     } catch (error) {
        console.error(`Erro ao ler dados de ${tipo}`, error);
        return [];
     }
    }
}