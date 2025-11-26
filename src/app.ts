import * as readline from 'readline';
import { BibliotecaService } from './Biblioteca';
import { Livro } from './Livro';
import { Membro } from './Membro';

// Classe responsável por interagir com o usuário via terminal.
export class BibliotecaCLI {
  private biblioteca: BibliotecaService;
  private rl: readline.Interface;

  constructor() {
    this.biblioteca = new BibliotecaService();
    // Configura a leitura de dados do teclado (stdin) e escrita na tela (stdout)
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // Método auxiliar para transformar a pergunta do readline (callback) em uma Promise (async/await).
  // Isso permite que o código espere o usuário digitar antes de continuar.
  private question(pergunta: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(pergunta, resolve);
    });
  }

  // Ponto de entrada da aplicação
  public async iniciar(): Promise<void> {
    console.log('=== SISTEMA DE BIBLIOTECA ===');
    
    // Loop infinito para manter o menu rodando até o usuário escolher "Sair"
    while (true) {
      await this.mostrarMenuPrincipal();
    }
  }

  private async mostrarMenuPrincipal(): Promise<void> {
    console.log('\n=== MENU PRINCIPAL ===');
    console.log('1. Gerenciar Livros');
    console.log('2. Gerenciar Membros');
    console.log('3. Gerenciar Empréstimos');
    console.log('4. Sair');

    const opcao = await this.question('Escolha uma opção: ');

    switch (opcao ) {
      case '1':
        await this.menuLivros();
        break;
      case '2':
        await this.menuMembros();
        break;
      case '3':
        await this.menuEmprestimos();
        break;
      case '4':
        console.log('Saindo do sistema...');
            this.rl.close(); // Fecha a interface de leitura
            process.exit(0); // Encerra o programa Node.js
      default:
        console.log('Opção inválida!');
    }
  }

  // --- Submenus para cada seção do sistema ---

  private async menuLivros(): Promise<void> {
    while (true) {
      console.log('\n--- GERENCIAR LIVROS ---');
      console.log('1. Adicionar livro');
      console.log('2. Listar livros');
      console.log('3. Atualizar livro');
      console.log('4. Remover livro');
      console.log('5. Voltar');

      const opcao = await this.question('Escolha uma opção: ');

      switch (opcao) {
        case '1':
          await this.adicionarLivro();
          break;
        case '2':
          this.listarLivros();
          break;
        case '3':
          await this.atualizarLivro();
          break;
        case '4':
          await this.removerLivro();
          break;
        case '5':
          return; // Sai do loop e volta para o menu anterior
        default:
          console.log('Opção inválida!');
      }
    }
  }

  private async menuMembros(): Promise<void> {
    while (true) {
      console.log('\n--- GERENCIAR MEMBROS ---');
      console.log('1. Adicionar membro');
      console.log('2. Listar membros');
      console.log('3. Atualizar membro');
      console.log('4. Remover membro');
      console.log('5. Voltar');

      const opcao = await this.question('Escolha uma opção: ');

      switch (opcao) {
        case '1':
          await this.adicionarMembro();
          break;
        case '2':
          this.listarMembros();
          break;
        case '3':
          await this.atualizarMembro();
          break;
        case '4':
          await this.removerMembro();
          break;
        case '5':
          return;
        default:
          console.log('Opção inválida!');
      }
    }
  }

  private async menuEmprestimos(): Promise<void> {
    while (true) {
      console.log('\n--- GERENCIAR EMPRÉSTIMOS ---');
      console.log('1. Realizar empréstimo');
      console.log('2. Listar empréstimos ativos');
      console.log('3. Registrar devolução');
      console.log('4. Histórico de empréstimos');
      console.log('5. Voltar');

      const opcao = await this.question('Escolha uma opção: ');

      switch (opcao) {
        case '1':
          await this.realizarEmprestimo();
          break;
        case '2':
          this.listarEmprestimosAtivos();
          break;
        case '3':
          await this.registrarDevolucao();
          break;
        case '4':
          this.listarHistoricoEmprestimos();
          break;
        case '5':
          return;
        default:
          console.log('Opção inválida!');
      }
    }
  }

  // --- Funções de interação (perguntar dados e chamar o serviço) ---

  private async adicionarLivro(): Promise<void> {
    console.log('\n--- ADICIONAR LIVRO ---');
    const titulo = await this.question('Título: ');
    const autor = await this.question('Autor: ');
    const isbn = await this.question('ISBN: ');
    const anoStr = await this.question('Ano de publicação: ');
    const ano = parseInt(anoStr);

    if (isNaN(ano)) {
      console.log('Ano inválido!');
      return;
    }

    const livro = new Livro(titulo, autor, isbn, ano);
    this.biblioteca.adicionarLivro(livro);
    console.log('Livro adicionado com sucesso!');
  }

  private listarLivros(): void {
    console.log('\n--- LISTA DE LIVROS ---');
    const livros = this.biblioteca.listarLivros();
    
    if (livros.length === 0) {
      console.log('Nenhum livro cadastrado.');
    } else {
      livros.forEach(livro => console.log(livro.toString()));
    }
  }

  private async atualizarLivro(): Promise<void> {
    console.log('\n--- ATUALIZAR LIVRO ---');
    const isbn = await this.question('ISBN do livro a ser atualizado: ');
    
    const livro = this.biblioteca.buscarLivroPorIsbn(isbn);
    if (!livro) {
      console.log('Livro não encontrado!');
      return;
    }

    console.log(`Livro encontrado: ${livro.toString()}`);
    // Permite deixar em branco para não alterar
    const novoTitulo = await this.question('Novo título (deixe em branco para manter): ');
    const novoAutor = await this.question('Novo autor (deixe em branco para manter): ');
    const novoAnoStr = await this.question('Novo ano (deixe em branco para manter): ');

    const dados: any = {};
    if (novoTitulo) dados.titulo = novoTitulo;
    if (novoAutor) dados.autor = novoAutor;
    if (novoAnoStr) {
      const novoAno = parseInt(novoAnoStr);
      if (!isNaN(novoAno)) dados.anoPublicacao = novoAno;
    }

    const sucesso = this.biblioteca.atualizarLivro(isbn, dados);
    if (sucesso) {
      console.log('Livro atualizado com sucesso!');
    } else {
      console.log('Erro ao atualizar livro!');
    }
  }

  private async removerLivro(): Promise<void> {
    console.log('\n--- REMOVER LIVRO ---');
    const isbn = await this.question('ISBN do livro a ser removido: ');
    
    const livro = this.biblioteca.buscarLivroPorIsbn(isbn);
    if (livro) {
      console.log(`Livro a ser removido: ${livro.toString()}`);
      const confirmacao = await this.question('Confirmar remoção? (s/n): ');
      
      if (confirmacao.toLowerCase() === 's') {
        this.biblioteca.removerLivro(isbn);
        console.log('Livro removido com sucesso!');
      } else {
        console.log('Remoção cancelada.');
      }
    } else {
      console.log('Livro não encontrado!');
    }
  }

  private async adicionarMembro(): Promise<void> {
    console.log('\n--- ADICIONAR MEMBRO ---');
    const nome = await this.question('Nome: ');
    const endereco = await this.question('Endereço: ');
    const telefone = await this.question('Telefone: ');
    const matricula = await this.question('Número de matrícula: ');

    const membro = new Membro(nome, endereco, telefone, matricula);
    this.biblioteca.adicionarMembro(membro);
    console.log('Membro adicionado com sucesso!');
  }

  private listarMembros(): void {
    console.log('\n--- LISTA DE MEMBROS ---');
    const membros = this.biblioteca.listarMembros();
    
    if (membros.length === 0) {
      console.log('Nenhum membro cadastrado.');
    } else {
      membros.forEach(membro => console.log(membro.toString()));
    }
  }

  private async atualizarMembro(): Promise<void> {
    console.log('\n--- ATUALIZAR MEMBRO ---');
    const matricula = await this.question('Matrícula do membro a ser atualizado: ');
    
    const membro = this.biblioteca.buscarMembroPorMatricula(matricula);
    if (!membro) {
      console.log('Membro não encontrado!');
      return;
    }

    console.log(`Membro encontrado: ${membro.toString()}`);
    const novoNome = await this.question('Novo nome (deixe em branco para manter): ');
    const novoEndereco = await this.question('Novo endereço (deixe em branco para manter): ');
    const novoTelefone = await this.question('Novo telefone (deixe em branco para manter): ');

    const dados: any = {};
    if (novoNome) dados.nome = novoNome;
    if (novoEndereco) dados.endereco = novoEndereco;
    if (novoTelefone) dados.telefone = novoTelefone;

    const sucesso = this.biblioteca.atualizarMembro(matricula, dados);
    if (sucesso) {
      console.log('Membro atualizado com sucesso!');
    } else {
      console.log('Erro ao atualizar membro!');
    }
  }

  private async removerMembro(): Promise<void> {
    console.log('\n--- REMOVER MEMBRO ---');
    const matricula = await this.question('Matrícula do membro a ser removido: ');
    
    const membro = this.biblioteca.buscarMembroPorMatricula(matricula);
    if (membro) {
      console.log(`Membro a ser removido: ${membro.toString()}`);
      const confirmacao = await this.question('Confirmar remoção? (s/n): ');
      
      if (confirmacao.toLowerCase() === 's') {
        this.biblioteca.removerMembro(matricula);
        console.log('Membro removido com sucesso!');
      } else {
        console.log('Remoção cancelada.');
      }
    } else {
      console.log('Membro não encontrado!');
    }
  }

  private async realizarEmprestimo(): Promise<void> {
    console.log('\n--- REALIZAR EMPRÉSTIMO ---');
    const isbn = await this.question('ISBN do livro: ');
    const matricula = await this.question('Matrícula do membro: ');

    const resultado = this.biblioteca.realizarEmprestimo(isbn, matricula);
    console.log(resultado.mensagem);
  }

  private listarEmprestimosAtivos(): void {
    console.log('\n--- EMPRÉSTIMOS ATIVOS ---');
    const emprestimos = this.biblioteca.listarEmprestimosAtivos();
    
    if (emprestimos.length === 0) {
      console.log('Nenhum empréstimo ativo.');
    } else {
      emprestimos.forEach(emp => console.log(emp.toString()));
    }
  }

  private async registrarDevolucao(): Promise<void> {
    console.log('\n--- REGISTRAR DEVOLUÇÃO ---');
    const isbn = await this.question('ISBN do livro a ser devolvido: ');

    const resultado = this.biblioteca.registrarDevolucao(isbn);
    console.log(resultado.mensagem);
  }

  private listarHistoricoEmprestimos(): void {
    console.log('\n--- HISTÓRICO DE EMPRÉSTIMOS ---');
    const emprestimos = this.biblioteca.listarHistoricoEmprestimos();
    
    if (emprestimos.length === 0) {
      console.log('Nenhum empréstimo no histórico.');
    } else {
      emprestimos.forEach(emp => console.log(emp.toString()));
    }
  }
}

// Inicializa e roda o sistema apenas quando o arquivo for executado diretamente
if (require.main === module) {
  const cli = new BibliotecaCLI();
  cli.iniciar();
}