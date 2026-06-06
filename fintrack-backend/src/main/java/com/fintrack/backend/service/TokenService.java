package com.fintrack.backend.service;

import com.fintrack.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/**
 * Serviço responsável por gerenciar o ciclo de vida do Token JWT (JSON Web Token).
 * Permite a geração de novos tokens seguros de autenticação e validação para requisições subsequentes.
 *
 * @author Desenvolvedor Java Sênior
 */
@Service
public class TokenService {

    // Injeta a chave secreta definida nas propriedades da aplicação
    @Value("${api.security.token.secret}")
    private String secret;

    private static final long EXPIRATION_TIME_MILLIS = 2 * 60 * 60 * 1000; // 2 horas em milissegundos

    /**
     * Obtém a chave criptográfica HMAC - SHA de assinatura de forma segura.
     * Caso o segredo definido esteja em Base64, ele será tratado; senão, usa bytes puros.
     */
    private Key getSigningKey() {
        byte[] keyBytes;
        try {
            // Tenta decodificar a String de forma padrão para obter a chave se for Base64 válida
            keyBytes = java.util.Base64.getDecoder().decode(this.secret);
        } catch (IllegalArgumentException e) {
            // Em caso de fallback ou string de texto plano, utiliza arrays de bytes UTF-8
            keyBytes = this.secret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Gera um token de autenticação JWT assinado para o respectivo usuário.
     * Modulador de expiração para o período exato de 2 horas.
     *
     * @param user Usuário autenticado
     * @return String contendo o token JWT assinado
     */
    public String gerarToken(User user) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + EXPIRATION_TIME_MILLIS);

        return Jwts.builder()
                .setIssuer("fintrack-api")
                .setSubject(user.getEmail())
                .setIssuedAt(agora)
                .setExpiration(expiracao)
                .signWith(this.getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Valida o token JWT recebido e retorna o e-mail/subject do usuário se for válido.
     *
     * @param token Token JWT fornecido na requisição
     * @return E-mail do usuário contido no subject do token, ou null se for inválido/expirado
     */
    public String validarToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(this.getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Retorna o identificador do usuário (neste caso, o e-mail)
            return claims.getSubject();
        } catch (JwtException e) {
            // Se o token estiver expirado, com assinatura corrompida ou malformado
            return null;
        }
    }
}
