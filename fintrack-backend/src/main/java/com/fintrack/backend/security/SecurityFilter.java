package com.fintrack.backend.security;

import com.fintrack.backend.repository.UserRepository;
import com.fintrack.backend.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro de segurança personalizado interceptador de requisições HTTP (Executado uma vez por requisição).
 * Extrai o Token JWT do cabeçalho de autorização, valida suas credenciais e estabelece
 * a sessão autenticada stateless no contexto de segurança do Spring Security.
 *
 * @author Desenvolvedor Java Sênior
 */
@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String token = recuperarToken(request);

        if (token != null) {
            String email = tokenService.validarToken(token);

            // Se o token for válido e o subject (email) foi decodificado
            if (email != null) {
                userRepository.findByEmail(email).ifPresent(user -> {
                    // Cria o token de autenticação contendo as credenciais e authorities do usuário
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user, 
                            null, 
                            user.getAuthorities()
                    );
                    
                    // Injeta a autenticação no contexto do Spring Security
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                });
            }
        }

        // Continua o fluxo da requisição na cadeia de filtros de segurança
        filterChain.doFilter(request, response);
    }

    /**
     * Extrai o Token JWT contido no cabeçalho "Authorization" da requisição HTTP removendo o prefixo "Bearer ".
     *
     * @param request Requisição HTTP recebida
     * @return O token em formato bruto se encontrado e válido, nulo caso contrário
     */
    private String recuperarToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.replace("Bearer ", "");
    }
}
