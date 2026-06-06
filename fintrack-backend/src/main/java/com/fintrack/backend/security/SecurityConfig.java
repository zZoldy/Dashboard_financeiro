package com.fintrack.backend.security;

import com.fintrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Classe principal de configuração de segurança do ecossistema FinTrack.
 * Define a política de sessão stateless, regras de firewall de rotas para endpoints públicos ou privados,
 * filtros de requisições de tokens, Beans fundamentais como PasswordEncoder e AuthenticationManager.
 *
 * @author Desenvolvedor Java Sênior
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;

    /**
     * Define a cadeia de filtros de segurança (Security Filter Chain) do Spring Security.
     * Desabilita a proteção CSRF, define a política stateless e adiciona interceptação de CORS específica.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable()) // Stateless APIs descartam CSRF por não usarem login baseado em Cookies
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Registra políticas CORS
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/auth/**").permitAll() // Libera endpoints de Autenticação de forma pública
                        .anyRequest().authenticated() // Bloqueia e exige validação JWT para qualquer outra requisição
                )
                // Insere o filtro personalizado JWT antes do filtro padrão de autenticação por Username/Password
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Configuração centralizada CORS nativa exigida no requisito.
     * Libera de forma explícita conexões vindas do ecossistema Frontend (Portas 3000 e 5173).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permite conexões do app local React no Vite (tanto na porta do dev server anterior quanto padrão do vite)
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Origin", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true); // Permite credenciais CORS

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Aplica a todas as URLs da API
        return source;
    }

    /**
     * Fornece o Bean de Gerenciamento de Autenticação nativo do Spring Boot.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * Define a codificação criptográfica via Algoritmo de Hashing BCrypt de alta complexidade adaptativa.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Componente UserDetailsService para recuperar registros no banco MySQL a partir de solicitações do AuthenticationManager.
     */
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return email -> userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Nenhum usuário cadastrado com o e-mail: " + email));
    }
}
