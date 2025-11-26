// Define uma classe abstrata 'Pessoa'. 
// 'abstract' significa que esta classe não pode ser instanciada diretamente (new Pessoa),
// ela serve apenas de modelo para outras classes herdarem.
export abstract class Pessoa {
  
  // O construtor define os atributos básicos que toda pessoa terá.
  // 'protected' permite que esses atributos sejam acessados pelas classes filhas (como Membro),
  // mas não de fora da classe (encapsulamento).
  constructor(
    protected _nome: string,
    protected _endereco: string,
    protected _telefone: string
  ) {}

  // Getters e Setters: Métodos para ler e alterar os valores dos atributos privados/protegidos.
  
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

  // Método base para converter o objeto em string.
  // Será usado (e modificado) pelas classes filhas via Polimorfismo.
  public toString(): string {
    return `Nome: ${this._nome}, Endereço: ${this._endereco}, Telefone: ${this._telefone}`;
  }
}