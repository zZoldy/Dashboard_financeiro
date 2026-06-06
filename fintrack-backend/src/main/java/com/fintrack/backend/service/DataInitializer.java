package com.fintrack.backend.service;

import com.fintrack.backend.model.Category;
import com.fintrack.backend.model.CategoryType;
import com.fintrack.backend.model.User;
import com.fintrack.backend.repository.CategoryRepository;
import com.fintrack.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Componente de inicialização automática de dados do FinTrack.
 * Executa imediatamente após a subida do contexto do Spring Boot.
 * Cadastra apenas as categorias base e o usuário root padrão.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, 
                           CategoryRepository categoryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("[SEEDED ENGINE] Executando verificação de integridade e carga inicial...");

        // 1. Inicializa as Categorias (Necessário para os formulários do React funcionarem)
        if (categoryRepository.count() == 0) {
            logger.info("[SEEDED ENGINE] Tabela de Categorias vazia. Semeando categorias padrão...");
            categoryRepository.save(new Category("Salário", CategoryType.ENTRADA));
            categoryRepository.save(new Category("Rendimento", CategoryType.ENTRADA));
            categoryRepository.save(new Category("Freelance", CategoryType.ENTRADA));
            categoryRepository.save(new Category("Alimentação", CategoryType.SAIDA));
            categoryRepository.save(new Category("Transporte", CategoryType.SAIDA));
            categoryRepository.save(new Category("Moradia", CategoryType.SAIDA));
            categoryRepository.save(new Category("Lazer", CategoryType.SAIDA));
            categoryRepository.save(new Category("Assinaturas", CategoryType.SAIDA));
            categoryRepository.save(new Category("Saúde", CategoryType.SAIDA));
            categoryRepository.save(new Category("Educação", CategoryType.SAIDA));
            logger.info("[SEEDED ENGINE] 10 categorias padrão foram semeadas com sucesso.");
        }

        // 2. Inicializa apenas o Usuário Root
        long totalUsuarios = userRepository.count();

        if (totalUsuarios == 0) {
            logger.info("[SEEDED ENGINE] Banco de dados de usuários está vazio. Iniciando carga do usuário root...");

            String nomePadrao = "Usuário Root";
            String emailPadrao = "root@fintrack.com";
            String senhaPlana = "admin123";

            // Criptografa a senha antes de salvar
            String senhaCriptografada = passwordEncoder.encode(senhaPlana);

            User usuarioRoot = new User(nomePadrao, emailPadrao, senhaCriptografada);
            userRepository.save(usuarioRoot);

            System.out.println("\n==========================================================================");
            System.out.println("  [SUCCESS] USUÁRIO ROOT CRIADO COM SUCESSO!");
            System.out.println("==========================================================================");
            System.out.println("  Credenciais padrão de acesso para desenvolvimento:");
            System.out.println("  - E-mail: " + emailPadrao);
            System.out.println("  - Senha : " + senhaPlana);
            System.out.println("==========================================================================\n");

        } else {
            logger.info("[SEEDED ENGINE] A carga inicial foi ignorada. Encontrados {} usuários na base.", totalUsuarios);
        }
    }
}