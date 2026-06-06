package com.fintrack.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal de inicialização da aplicação FinTrack Auth Backend.
 * Responsável por carregar o Spring Boot em modo Stateless e configurar todo o ecossistema.
 *
 * @author Desenvolvedor Java Sênior
 */
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
