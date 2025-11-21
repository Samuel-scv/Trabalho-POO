import { Livro } from './Livro';
import { Membro } from './Membro';
import { Emprestimo } from './Emprestimo';
import { GerenciadorArquivos } from './GerenciadorArquivos';

export class BibliotecaService {
  private livros: Livro[] = [];
  private membros: Membro[] = [];
  private emprestimos: Emprestimo[] = [];
  private gerenciadorArquivos: GerenciadorArquivos;

  constructor() {
    this.gerenciadorArquivos = new GerenciadorArquivos();
    this.carregarDados();
  }

  private carregarDados(): void {
    // Carregar livros
    const dadosLivros = this.gerenciadorArquivos.carregarDados('livros.json');
    this.livros = dadosLivros.map((d: any) => {
      const livro = new Livro(d._titulo, d._autor, d._isbn, d._anoPublicacao);
      livro.disponivel = d._disponivel;
      return livro;
    });

    // Carregar membros
    const dadosMembros = this.gerenciadorArquivos.carregarDados('membros.json');
    this.membros = dadosMembros.map((d: any) => 
      new Membro(d._nome, d._endereco, d._telefone, d._numeroMatricula)
    );

    // Carregar empréstimos
    const dadosEmprestimos = this.gerenciadorArquivos.carregarDados('emprestimos.json');
    this.emprestimos = dadosEmprestimos.map((d: any) => {
      const livro = this.buscarLivroPorIsbn(d.livroIsbn);
      const membro = this.buscarMembroPorMatricula(d.membroMatricula);
      
      if (livro && membro) {
        const emprestimo = new Emprestimo(livro, membro, new Date(d._dataEmprestimo));
        
        if (d._devolvido) {
          emprestimo.devolvido = true;
          emprestimo.dataDevolucao = new Date(d._dataDevolucao);
        }
        
        return emprestimo;
      }
      return null;
    }).filter((e): e is Emprestimo => e !== null);
  }

  private salvarDados(): void {
    // Salvar livros
    this.gerenciadorArquivos.salvarDados('livros.json', this.livros);
    
    // Salvar membros
    this.gerenciadorArquivos.salvarDados('membros.json', this.membros);
    
    // Salvar empréstimos (apenas referências)
    const emprestimosParaSalvar = this.emprestimos.map(emp => ({
      livroIsbn: emp.livro.isbn,
      membroMatricula: emp.membro.numeroMatricula,
      _dataEmprestimo: emp.dataEmprestimo.toISOString(),
      _dataDevolucao: emp.dataDevolucao?.toISOString() || null,
      _devolvido: emp.devolvido
    }));
    
    this.gerenciadorArquivos.salvarDados('emprestimos.json', emprestimosParaSalvar);
  }

  // CRUD Livros
  public adicionarLivro(livro: Livro): void {
    this.livros.push(livro);
    this.salvarDados();
  }

  public listarLivros(): Livro[] {
    return this.livros;
  }

  public atualizarLivro(isbn: string, dados: Partial<Livro>): boolean {
    const livro = this.buscarLivroPorIsbn(isbn);
    if (livro) {
      if (dados.titulo) livro.titulo = dados.titulo;
      if (dados.autor) livro.autor = dados.autor;
      if (dados.anoPublicacao) livro.anoPublicacao = dados.anoPublicacao;
      this.salvarDados();
      return true;
    }
    return false;
  }

  public removerLivro(isbn: string): boolean {
    const index = this.livros.findIndex(l => l.isbn === isbn);
    if (index !== -1) {
      this.livros.splice(index, 1);
      this.salvarDados();
      return true;
    }
    return false;
  }

  public buscarLivroPorIsbn(isbn: string): Livro | undefined {
    return this.livros.find(l => l.isbn === isbn);
  }

  // CRUD Membros
  public adicionarMembro(membro: Membro): void {
    this.membros.push(membro);
    this.salvarDados();
  }

  public listarMembros(): Membro[] {
    return this.membros;
  }

  public atualizarMembro(matricula: string, dados: Partial<Membro>): boolean {
    const membro = this.buscarMembroPorMatricula(matricula);
    if (membro) {
      if (dados.nome) membro.nome = dados.nome;
      if (dados.endereco) membro.endereco = dados.endereco;
      if (dados.telefone) membro.telefone = dados.telefone;
      this.salvarDados();
      return true;
    }
    return false;
  }

  public removerMembro(matricula: string): boolean {
    const index = this.membros.findIndex(m => m.numeroMatricula === matricula);
    if (index !== -1) {
      this.membros.splice(index, 1);
      this.salvarDados();
      return true;
    }
    return false;
  }

  public buscarMembroPorMatricula(matricula: string): Membro | undefined {
    return this.membros.find(m => m.numeroMatricula === matricula);
  }

  // Empréstimos
  public realizarEmprestimo(isbn: string, matricula: string): { sucesso: boolean; mensagem: string } {
    const livro = this.buscarLivroPorIsbn(isbn);
    const membro = this.buscarMembroPorMatricula(matricula);

    if (!livro) {
      return { sucesso: false, mensagem: "Livro não encontrado." };
    }

    if (!membro) {
      return { sucesso: false, mensagem: "Membro não encontrado." };
    }

    if (!livro.disponivel) {
      return { sucesso: false, mensagem: "Livro já está emprestado." };
    }

    // Verificar limite de empréstimos (3 por membro)
    const emprestimosAtivos = this.emprestimos.filter(
      emp => !emp.devolvido && emp.membro.numeroMatricula === matricula
    );

    if (emprestimosAtivos.length >= 3) {
      return { sucesso: false, mensagem: "Membro atingiu o limite de 3 empréstimos simultâneos." };
    }

    livro.disponivel = false;
    const emprestimo = new Emprestimo(livro, membro);
    this.emprestimos.push(emprestimo);
    this.salvarDados();

    return { sucesso: true, mensagem: "Empréstimo realizado com sucesso." };
  }

  public listarEmprestimosAtivos(): Emprestimo[] {
    return this.emprestimos.filter(emp => !emp.devolvido);
  }

  public registrarDevolucao(isbn: string): { sucesso: boolean; mensagem: string } {
    const emprestimo = this.emprestimos.find(
      emp => emp.livro.isbn === isbn && !emp.devolvido
    );

    if (!emprestimo) {
      return { sucesso: false, mensagem: "Não foi encontrado empréstimo ativo para este livro." };
    }

    emprestimo.devolvido = true;
    emprestimo.dataDevolucao = new Date();
    emprestimo.livro.disponivel = true;
    this.salvarDados();

    return { sucesso: true, mensagem: "Devolução registrada com sucesso." };
  }

  public listarHistoricoEmprestimos(): Emprestimo[] {
    return this.emprestimos;
  }
}