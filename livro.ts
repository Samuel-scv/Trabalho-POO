export class Livro {
  private _disponivel: boolean = true;

  constructor(
    private _titulo: string,
    private _autor: string,
    private _isbn: string,
    private _anoPublicacao: number
  ) {}

  public get titulo(): string {
    return this._titulo;
  }

  public set titulo(titulo: string) {
    this._titulo = titulo;
  }

  public get autor(): string {
    return this._autor;
  }

  public set autor(autor: string) {
    this._autor = autor;
  }

  public get isbn(): string {
    return this._isbn;
  }

  public set isbn(isbn: string) {
    this._isbn = isbn;
  }

  public get anoPublicacao(): number {
    return this._anoPublicacao;
  }

  public set anoPublicacao(anoPublicacao: number) {
    this._anoPublicacao = anoPublicacao;
  }

  public get disponivel(): boolean {
    return this._disponivel;
  }

  public set disponivel(disponivel: boolean) {
    this._disponivel = disponivel;
  }

  public toString(): string {
    const status = this._disponivel ? "Disponível" : "Emprestado";
    return `"${this._titulo}" por ${this._autor} (${this._anoPublicacao}) - ISBN: ${this._isbn} - ${status}`;
  }
}