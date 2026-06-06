package com.fintrack.backend.service;

import com.fintrack.backend.model.*;
import com.fintrack.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Componente de inicialização automática de dados (Database Seeding) do FinTrack.
 * Executa imediatamente após a subida do contexto do Spring Boot. Se a tabela 'users' 
 * estiver vazia, cadastra o usuário root padrão, categorias, contas e transações mockadas 
 * para imediata visualização do dashboard.
 *
 * @author Desenvolvedor Java Sênior
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Construtor para injeção de dependências obrigatórias via Spring IoC.
     */
    public DataInitializer(UserRepository userRepository, 
                           CategoryRepository categoryRepository,
                           WalletRepository walletRepository,
                           TransactionRepository transactionRepository,
                           SubscriptionRepository subscriptionRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("[SEEDED ENGINE] Executando verificação de integridade e carga inicial...");

        // 1. Inicializa as Categorias se estiverem vazias
        if (categoryRepository.count() == 0) {
            logger.info("[SEEDED ENGINE] Tabela de Categorias vazia. Semeando categorias padrão...");
            categoryRepository.save(new Category("Salário", CategoryType.ENTRADA));     // id 1
            categoryRepository.save(new Category("Rendimento", CategoryType.ENTRADA));  // id 2
            categoryRepository.save(new Category("Freelance", CategoryType.ENTRADA));   // id 3
            categoryRepository.save(new Category("Alimentação", CategoryType.SAIDA));   // id 4
            categoryRepository.save(new Category("Transporte", CategoryType.SAIDA));    // id 5
            categoryRepository.save(new Category("Moradia", CategoryType.SAIDA));       // id 6
            categoryRepository.save(new Category("Lazer", CategoryType.SAIDA));         // id 7
            categoryRepository.save(new Category("Assinaturas", CategoryType.SAIDA));   // id 8
            categoryRepository.save(new Category("Saúde", CategoryType.SAIDA));         // id 9
            categoryRepository.save(new Category("Educação", CategoryType.SAIDA));     // id 10
            logger.info("[SEEDED ENGINE] 10 categorias padrão foram semeadas com sucesso.");
        }

        // 2. Inicializa o Usuário Root e estruturas financeiras iniciais
        long totalUsuarios = userRepository.count();

        if (totalUsuarios == 0) {
            logger.info("[SEEDED ENGINE] Banco de dados de usuários está vazio. Iniciando carga padrão...");

            // Dados declarados para o primeiro usuário administrador
            String nomePadrao = "Usuário Root";
            String emailPadrao = "root@fintrack.com";
            String senhaPlana = "admin123";

            // Criptografa a senha em formato BCrypt
            String senhaCriptografada = passwordEncoder.encode(senhaPlana);

            // Instancia e persiste o usuário raiz
            User usuarioRoot = new User(nomePadrao, emailPadrao, senhaCriptografada);
            usuarioRoot = userRepository.save(usuarioRoot);

            logger.info("[SEEDED ENGINE] Usuário root persistido: {}", emailPadrao);

            // 3. Semeia as carteiras/contas bancárias (Wallets) vinculadas ao usuário root
            List<Wallet> wallets = new ArrayList<>();
            wallets.add(walletRepository.save(new Wallet(usuarioRoot, "Conta Corrente Itaú", 4850.00, WalletType.CORRENTE, "Itaú")));
            wallets.add(walletRepository.save(new Wallet(usuarioRoot, "Fundo de Reserva Nubank", 12000.00, WalletType.POUPANCA, "Nubank")));
            wallets.add(walletRepository.save(new Wallet(usuarioRoot, "Carteira XP Ações", 35000.00, WalletType.INVESTIMENTO, "XP")));
            wallets.add(walletRepository.save(new Wallet(usuarioRoot, "Caixinha Inter Global", 15300.00, WalletType.INVESTIMENTO, "Inter")));

            logger.info("[SEEDED ENGINE] 4 contas financeiras semeadas para o usuário root.");

            // Adquire categorias criadas para associação das transações
            List<Category> categories = categoryRepository.findAll();
            Category catSalario = categories.stream().filter(c -> c.getNome().equals("Salário")).findFirst().orElse(null);
            Category catAlimento = categories.stream().filter(c -> c.getNome().equals("Alimentação")).findFirst().orElse(null);
            Category catMoradia = categories.stream().filter(c -> c.getNome().equals("Moradia")).findFirst().orElse(null);
            Category catAssina = categories.stream().filter(c -> c.getNome().equals("Assinaturas")).findFirst().orElse(null);
            Category catSaude = categories.stream().filter(c -> c.getNome().equals("Saúde")).findFirst().orElse(null);
            Category catTransp = categories.stream().filter(c -> c.getNome().equals("Transporte")).findFirst().orElse(null);
            Category catLazer = categories.stream().filter(c -> c.getNome().equals("Lazer")).findFirst().orElse(null);
            Category catEduca = categories.stream().filter(c -> c.getNome().equals("Educação")).findFirst().orElse(null);
            Category catFreelance = categories.stream().filter(c -> c.getNome().equals("Freelance")).findFirst().orElse(null);

            Wallet wItau = wallets.get(0);
            Wallet wNubank = wallets.get(1);

            // 4. Semeia lançamentos financeiros de demonstração (Transactions)
            if (catSalario != null && catAlimento != null) {
                transactionRepository.save(new Transaction(wItau, catSalario, "Salário Mensal Senior Dev", 12500.00, 
                        LocalDateTime.now().minusDays(5), TransactionType.ENTRADA, TransactionStatus.PAGO, PaymentMethod.AUTOMATICO, "AUTO-DEPOSIT-99120"));

                transactionRepository.save(new Transaction(wItau, catAlimento, "Supermercado Condor", 650.00, 
                        LocalDateTime.now().minusDays(3), TransactionType.SAIDA, TransactionStatus.PAGO, PaymentMethod.CARTAO, "CARD-AUTH-8871"));

                if (catMoradia != null) {
                    transactionRepository.save(new Transaction(wItau, catMoradia, "Aluguel Apartamento", 2200.00, 
                            LocalDateTime.now().minusDays(1), TransactionType.SAIDA, TransactionStatus.PAGO, PaymentMethod.BOLETO, "34191.79001 01043.513184 91020.150008 7 97400000220000"));
                }

                if (catAssina != null) {
                    transactionRepository.save(new Transaction(wNubank, catAssina, "Netflix Premium UltraHD", 55.90, 
                            LocalDateTime.now().minusDays(2), TransactionType.SAIDA, TransactionStatus.PAGO, PaymentMethod.CARTAO, "CARD-AUTH-9531"));
                }

                if (catSaude != null) {
                    transactionRepository.save(new Transaction(wItau, catSaude, "Consulta Odontológica", 250.00, 
                            LocalDateTime.now().minusDays(1), TransactionType.SAIDA, TransactionStatus.PAGO, PaymentMethod.PIX, "CLINICA-ODONTO-PIX"));
                }

                if (catTransp != null) {
                    transactionRepository.save(new Transaction(wItau, catTransp, "Abastecimento Posto shell", 180.00, 
                            LocalDateTime.now().minusDays(1), TransactionType.SAIDA, TransactionStatus.PAGO, PaymentMethod.PIX, "POSTO-SHELL-PIX-KEY"));
                }

                if (catLazer != null) {
                    transactionRepository.save(new Transaction(wItau, catLazer, "Jantar Especial Outback", 320.00, 
                            LocalDateTime.now().minusDays(1), TransactionType.SAIDA, TransactionStatus.PAGO, PaymentMethod.CARTAO, "CARD-AUTH-1102"));
                }

                // Contas Pendentes futuras
                if (catMoradia != null) {
                    transactionRepository.save(new Transaction(wItau, catMoradia, "Conta de Energia Copel", 245.50, 
                            LocalDateTime.now().plusDays(6), TransactionType.SAIDA, TransactionStatus.PENDENTE, PaymentMethod.BOLETO, "836200000020455000481007011030202606"));
                }

                if (catEduca != null) {
                    transactionRepository.save(new Transaction(wNubank, catEduca, "Mensalidade Pós-Graduação", 480.00, 
                            LocalDateTime.now().plusDays(9), TransactionType.SAIDA, TransactionStatus.PENDENTE, PaymentMethod.BOLETO, "34191790010104351318491020150"));
                }

                if (catFreelance != null) {
                    transactionRepository.save(new Transaction(wItau, catFreelance, "Projeto Freelance API Spring", 3200.00, 
                            LocalDateTime.now().plusDays(4), TransactionType.ENTRADA, TransactionStatus.PENDENTE, PaymentMethod.PIX, "PIX-KEY-FREELANCE"));
                }

                logger.info("[SEEDED ENGINE] Lançamentos de demonstração persistidos.");
            }

            // 5. Semeia Assinaturas Recorrentes (Subscriptions)
            if (catAssina != null) {
                subscriptionRepository.save(new Subscription(wNubank, catAssina, "Netflix Premium", 55.90, 4, SubscriptionPeriodicity.MENSAL, true));
                subscriptionRepository.save(new Subscription(wItau, catAssina, "Spotify Família", 34.90, 10, SubscriptionPeriodicity.MENSAL, true));
                subscriptionRepository.save(new Subscription(wItau, catAssina, "Amazon Prime Video", 19.90, 18, SubscriptionPeriodicity.MENSAL, true));
                subscriptionRepository.save(new Subscription(wNubank, catAssina, "Academia Smart Fit", 119.90, 15, SubscriptionPeriodicity.MENSAL, true));
                
                Wallet wXp = wallets.get(2);
                subscriptionRepository.save(new Subscription(wXp, catAssina, "Bloomberg Professional", 1200.00, 25, SubscriptionPeriodicity.ANUAL, true));

                logger.info("[SEEDED ENGINE] Assinaturas recorrentes semeadas.");
            }

            // Imprime log formatado com alta visibilidade para facilitar o logon inicial do desenvolvedor
            System.out.println("\n==========================================================================");
            System.out.println("  [SUCCESS] BANCO DE DADOS POPULADO E CONFIGURADO COM SUCESSO!");
            System.out.println("==========================================================================");
            System.out.println("  Credenciais padrão de acesso para desenvolvimento (texto plano):");
            System.out.println("  - E-mail: " + emailPadrao);
            System.out.println("  - Senha : " + senhaPlana);
            System.out.println("==========================================================================\n");

            logger.info("[SEEDED ENGINE] Inicialização de dados finalizada com sucesso!");
        } else {
            logger.info("[SEEDED ENGINE] A carga inicial de dados foi ignorada. Encontrados {} usuários na base.", totalUsuarios);
        }
    }
}
