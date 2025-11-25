import { Livro } from './Livro';
import { Membro } from './Membro';
import { Emprestimo } from './Emprestimo';
import { GerenciadorArquivos } from './GerenciadorArquivos';

export class BibliotecaService {
  // Listas em memória para manipular os dados rapidamente.
  private livros: Livro[] = [];
  private membros: Membro[] = [];
  private emprestimos: Emprestimo[] = [];
  private gerenciadorArquivos: GerenciadorArquivos;

  constructor() {
    this.gerenciadorArquivos = new GerenciadorArquivos();
    // Ao iniciar o sistema, carrega os dados salvos nos arquivos para a memória.
    this.carregarDados();
  }

  // Reconstrói os objetos a partir dos dados crus (JSON).
  private carregarDados(): void {
    // 1. Carrega e recria objetos Livro
    const dadosLivros = this.gerenciadorArquivos.carregar('livros');
    this.livros = dadosLivros.map((d: any) => {
      const livro = new Livro(d._titulo, d._autor, d._isbn, d._anoPublicacao);
      livro.disponivel = d._disponivel; // Restaura o status de disponibilidade
      return livro;
    });

    // 2. Carrega e recria objetos Membro
    const dadosMembros = this.gerenciadorArquivos.carregar('membros');
    this.membros = dadosMembros.map((d: any) => 
      new Membro(d._nome, d._endereco, d._telefone, d._numeroMatricula)
    );

    // 3. Carrega e recria objetos Emprestimo
    // Atenção: Empréstimos precisam ser reconectados aos objetos reais de Livro e Membro.
    const dadosEmprestimos = this.gerenciadorArquivos.carregar('emprestimos');
    this.emprestimos = dadosEmprestimos.map((d: any) => {
      const livro = this.buscarLivroPorIsbn(d.livroIsbn);
      const membro = this.buscarMembroPorMatricula(d.membroMatricula);
      
      // Só recria o empréstimo se o livro e o membro ainda existirem no sistema.
      if (livro && membro) {
        const emprestimo = new Emprestimo(livro, membro, new Date(d._dataEmprestimo));
        
        if (d._devolvido) {
          emprestimo.devolvido = true;
          emprestimo.dataDevolucao = new Date(d._dataDevolucao);
        }
        
        return emprestimo;
      }
      return null;
    }).filter((e): e is Emprestimo => e !== null); // Remove empréstimos inválidos (null)
  }

  // Salva o estado atual da memória nos arquivos JSON.
  private salvarDados(): void {
    this.gerenciadorArquivos.salvarDados('livros', this.livros);
    this.gerenciadorArquivos.salvarDados('membros', this.membros);
    
    // Para empréstimos, salvamos apenas os IDs (ISBN e Matrícula) para economizar espaço
    // e facilitar a reconstrução dos relacionamentos depois.
    const emprestimosParaSalvar = this.emprestimos.map(emp => ({
      livroIsbn: emp.livro.isbn,
      membroMatricula: emp.membro.numeroMatricula,
      _dataEmprestimo: emp.dataEmprestimo.toISOString(),
      _dataDevolucao: emp.dataDevolucao?.toISOString() || null,
      _devolvido: emp.devolvido
    }));
    
    this.gerenciadorArquivos.salvarDados('emprestimos', emprestimosParaSalvar);
  }

  // --- MÉTODOS DE GERENCIAMENTO DE LIVROS ---

  public adicionarLivro(livro: Livro): void {
    this.livros.push(livro);
    this.salvarDados(); // Persiste a alteração imediatamente
  }

  public listarLivros(): Livro[] {
    return this.livros;
  }

  // Atualiza apenas os campos que foram enviados (Partial<Livro>)
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
      this.livros.splice(index, 1); // Remove 1 item na posição encontrada
      this.salvarDados();
      return true;
    }
    return false;
  }

  public buscarLivroPorIsbn(isbn: string): Livro | undefined {
    return this.livros.find(l => l.isbn === isbn);
  }

  // --- MÉTODOS DE GERENCIAMENTO DE MEMBROS ---

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

  // --- LÓGICA DE EMPRÉSTIMOS (Regras de Negócio) ---

  public realizarEmprestimo(isbn: string, matricula: string): { sucesso: boolean; mensagem: string } {
    const livro = this.buscarLivroPorIsbn(isbn);
    const membro = this.buscarMembroPorMatricula(matricula);

    // Validações básicas
    if (!livro) return { sucesso: false, mensagem: "Livro não encontrado." };
    if (!membro) return { sucesso: false, mensagem: "Membro não encontrado." };
    if (!livro.disponivel) return { sucesso: false, mensagem: "Livro já está emprestado." };

    // Regra: Limite de 3 livros por membro
    const emprestimosAtivos = this.emprestimos.filter(
      emp => !emp.devolvido && emp.membro.numeroMatricula === matricula
    );

    if (emprestimosAtivos.length >= 3) {
      return { sucesso: false, mensagem: "Membro atingiu o limite de 3 empréstimos simultâneos." };
    }

    // Realiza a operação
    livro.disponivel = false; // Marca livro como indisponível
    const emprestimo = new Emprestimo(livro, membro);
    this.emprestimos.push(emprestimo);
    this.salvarDados(); // Salva tudo

    return { sucesso: true, mensagem: "Empréstimo realizado com sucesso." };
  }

  public listarEmprestimosAtivos(): Emprestimo[] {
    return this.emprestimos.filter(emp => !emp.devolvido);
  }

  public registrarDevolucao(isbn: string): { sucesso: boolean; mensagem: string } {
    // Busca um empréstimo ativo para este livro
    const emprestimo = this.emprestimos.find(
      emp => emp.livro.isbn === isbn && !emp.devolvido
    );

    if (!emprestimo) {
      return { sucesso: false, mensagem: "Não foi encontrado empréstimo ativo para este livro." };
    }

    // Finaliza o empréstimo
    emprestimo.devolvido = true;
    emprestimo.dataDevolucao = new Date(); // Data de hoje
    emprestimo.livro.disponivel = true; // Libera o livro
    this.salvarDados();

    return { sucesso: true, mensagem: "Devolução registrada com sucesso." };
  }

  public listarHistoricoEmprestimos(): Emprestimo[] {
    return this.emprestimos;
  }
}