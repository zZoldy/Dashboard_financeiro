package com.fintrack.backend.controller;

import com.fintrack.backend.dto.LoginRequest;
import com.fintrack.backend.dto.LoginResponse;
import com.fintrack.backend.dto.RegisterRequest;
import com.fintrack.backend.model.User;
import com.fintrack.backend.repository.UserRepository;
import com.fintrack.backend.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller responsável pelos serviços relacionados ao subsistema de Autenticação (/api/auth).
 * Fornece os canais públicos para login de usuários e registro seguro de novas contas com hashes BCrypt.
 *
 * @author Desenvolvedor Java Sênior
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Autentica o usuário fornecido com credenciais via e-mail e senha.
     * Gera o JWT de autorização stateless correspondente caso as credenciais estejam corretas.
     *
     * @param request JSON mapeado no DTO {@link LoginRequest}
     * @return ResponseEntity contendo DTO {@link LoginResponse} no sucesso ou Bad Request se inválido
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Instancia o token de autenticação padrão com as credenciais enviadas pelo usuário
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getSenha()
            );

            // Delega a autenticação para o gerenciador nativo do Spring Security
            Authentication authentication = authenticationManager.authenticate(authenticationToken);

            // Obtém os dados detalhados do usuário carregados pelo provider
            User user = (User) authentication.getPrincipal();

            // Gera o Token JWT para o usuário com expiração de 2 horas
            String token = tokenService.gerarToken(user);

            // Retorna o payload completo com token e perfil de acesso básico
            LoginResponse response = new LoginResponse(
                    token,
                    user.getId(),
                    user.getNome(),
                    user.getEmail()
            );

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            // Tratamento específico para e-mail ou senha inválidos
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("E-mail ou senha incorretos.");
        } catch (Exception e) {
            // Tratamento genérico para falhas na conexão
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno ao autenticar no servidor: " + e.getMessage());
        }
    }

    /**
     * Endpoint para criação e registro de novos usuários no banco de dados MySQL.
     * Aplica hashing de segurança BCrypt na password enviada antes da persistência.
     *
     * @param request JSON mapeado no DTO {@link RegisterRequest}
     * @return ResponseEntity com Status 201 Created se concluído ou BadRequest para duplicidades
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Valida duplicidade de e-mail único
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Este e-mail já está cadastrado no sistema.");
            }

            // Realiza o hash criptográfico seguro irreversível da senha enviada
            String senhaCriptografada = passwordEncoder.encode(request.getSenha());

            // Cria o modelo agregando as informações e data_criacao automática
            User novoUsuario = new User(
                    request.getNome(),
                    request.getEmail(),
                    senhaCriptografada
            );

            // Salva na tabela 'users'
            userRepository.save(novoUsuario);

            return ResponseEntity.status(HttpStatus.CREATED).body("Usuário registrado com sucesso!");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno ao salvar novo usuário: " + e.getMessage());
        }
    }
}
