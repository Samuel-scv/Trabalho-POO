import * as fs from 'fs';
import * as path from 'path';

export type TipoDado = 'livros' | 'membros' | 'emprestimos';

const DATA_DIR = path.join(process.cwd(), 'data');

export class GerenciadorArquivos {
    private getFilePath(tipo: TipoDado): string {
        return path.join(DATA_DIR, `${tipo}.json`);
    }

    private garantirDiretorio(): void {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true});
    }
    }


    public salvarDados<T>(tipo: TipoDado, data: T[]): void {
        this.garantirDiretorio();
        const filePath = this.getFilePath(tipo);
        try {
            const jsonString = JSON.stringify(data, null, 2);
            fs.writeFileSync(filePath, jsonString, 'utf-8');
        } catch (error) {
            console.error(`Erro ao ler dados de ${tipo}:`, error);
        }
    }

    public carregar<T>(tipo: TipoDado): T[] {
     const filePath = this.getFilePath(tipo);
     if (!fs.existsSync(filePath)) {
        return [];
     }

        try {
        const data = fs.readFileSync(filePath, 'utf-8');
        if (!data.trim()) {
            return [];
        }
     const parsedData = JSON.parse(data);
     
     if (Array.isArray(parsedData)) {
        return parsedData as T[];
     } else {
        console.error(`Aviso: Dados de ${filePath} não são um array válido. Retornando vazio.`);
        return [];
     }
        } catch (error) {
            console.error(`Erro ao ler dados de ${tipo} do arquivo ${filePath}`, error);
            return [];
        }
    }
}