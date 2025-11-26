import { Pessoa } from './Pessoa';

// A classe Membro herda tudo de Pessoa (nome, endereço, telefone).
export class Membro extends Pessoa {
  
  constructor(
    nome: string,
    endereco: string,
    telefone: string,
    // Adiciona um atributo específico que só Membro tem: matrícula.
    private _numeroMatricula: string
  ) {
    // 'super' chama o construtor da classe pai (Pessoa) para inicializar os dados herdados.
    super(nome, endereco, telefone);
  }

  // Getter e Setter específicos para matrícula
  public get numeroMatricula(): string {
    return this._numeroMatricula;
  }

  public set numeroMatricula(numeroMatricula: string) {
    this._numeroMatricula = numeroMatricula;
  }

  // POLIMORFISMO: O modificador 'override' indica que estamos sobrescrevendo
  // o comportamento do método toString() que veio da classe Pessoa.
  public override toString(): string {
    // Reaproveitamos a formatação da classe pai (super.toString) e adicionamos a matrícula.
    return `${super.toString()}, Matrícula: ${this._numeroMatricula}`;
  }
}