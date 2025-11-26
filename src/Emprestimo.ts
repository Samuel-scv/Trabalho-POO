import { Livro } from './Livro';
import { Membro } from './Membro';

export class Emprestimo {
  private _dataDevolucao: Date | null = null;
  private _devolvido: boolean = false;

  constructor(
    // Associação: O empréstimo "tem um" Livro e "tem um" Membro.
    private _livro: Livro,
    private _membro: Membro,
    // Data do empréstimo é criada automaticamente no momento da instância (agora).
    private _dataEmprestimo: Date = new Date()
  ) {}

  // Apenas Getters para livro e membro, pois não devemos mudar o livro/membro de um empréstimo já feito.
  public get livro(): Livro {
    return this._livro;
  }

  public get membro(): Membro {
    return this._membro;
  }

  public get dataEmprestimo(): Date {
    return this._dataEmprestimo;
  }

  public get dataDevolucao(): Date | null {
    return this._dataDevolucao;
  }

  public set dataDevolucao(data: Date) {
    this._dataDevolucao = data;
  }

  public get devolvido(): boolean {
    return this._devolvido;
  }

  public set devolvido(devolvido: boolean) {
    this._devolvido = devolvido;
  }

  // Exibe os detalhes do empréstimo.
  // Mostra a data de devolução apenas se ela existir (if ternário).
  public toString(): string {
    const status = this._devolvido ? "Devolvido" : "Ativo";
    const devolucao = this._devolvido && this._dataDevolucao 
      ? `, Devolução: ${this._dataDevolucao.toLocaleDateString('pt-BR')}` 
      : "";
    
    return `Empréstimo ${status}: ${this._livro.titulo} para ${this._membro.nome} (Empréstimo: ${this._dataEmprestimo.toLocaleDateString('pt-BR')}${devolucao})`;
  }
}