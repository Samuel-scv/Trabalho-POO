export class Livro {
  // Atributo privado para controlar se o livro pode ser emprestado.
  // Inicializado como true (disponível).
  private _disponivel: boolean = true;

  constructor(
    private _titulo: string,
    private _autor: string,
    private _isbn: string, // Identificador único do livro
    private _anoPublicacao: number
  ) {}

  // Getters e Setters para permitir acesso controlado aos atributos
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

  // Formata os dados do livro para exibição no terminal.
  // Muda o texto final dependendo se está disponível ou emprestado.
  public toString(): string {
    const status = this._disponivel ? "Disponível" : "Emprestado";
    return `"${this._titulo}" por ${this._autor} (${this._anoPublicacao}) - ISBN: ${this._isbn} - ${status}`;
  }
}