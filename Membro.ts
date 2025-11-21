export class Membro {
  constructor(
    private _nome: string,
    private _endereco: string,
    private _telefone: string,
    private _numeroMatricula: string
  ) {}

  public get nome(): string {
    return this._nome;
  }

  public set nome(nome: string) {
    this._nome = nome;
  }

  public get endereco(): string {
    return this._endereco;
  }

  public set endereco(endereco: string) {
    this._endereco = endereco;
  }

  public get telefone(): string {
    return this._telefone;
  }

  public set telefone(telefone: string) {
    this._telefone = telefone;
  }

  public get numeroMatricula(): string {
    return this._numeroMatricula;
  }

  public set numeroMatricula(numeroMatricula: string) {
    this._numeroMatricula = numeroMatricula;
  }

  public toString(): string {
    return `Nome: ${this._nome}, Endereço: ${this._endereco}, Telefone: ${this._telefone}, Matrícula: ${this._numeroMatricula}`;
  }
}