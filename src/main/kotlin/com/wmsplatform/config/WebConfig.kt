// src/main/kotlin/com/wmsplatform/config/WebConfig.kt
package com.wmsplatform.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.filter.CorsFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.filter.OncePerRequestFilter
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

@Configuration
class WebConfig : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
            .allowedHeaders("*")
            .exposedHeaders("Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers")
            .allowCredentials(true)
    }

    @Bean
    fun corsFilter(): CorsFilter {
        val source = UrlBasedCorsConfigurationSource()
        val config = CorsConfiguration()
        config.allowCredentials = true
        config.addAllowedOrigin("http://localhost:3000")
        config.addAllowedHeader("*")
        config.addAllowedMethod("*")
        source.registerCorsConfiguration("/**", config)
        return CorsFilter(source)
    }

    // Renamed the bean to avoid conflict with GlobalExceptionHandler class
    @Bean
    fun corsExceptionFilter(): OncePerRequestFilter {
        return object : OncePerRequestFilter() {
            override fun doFilterInternal(
                request: HttpServletRequest,
                response: HttpServletResponse,
                filterChain: FilterChain
            ) {
                try {
                    filterChain.doFilter(request, response)
                } catch (ex: Exception) {
                    response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000")
                    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH")
                    response.setHeader("Access-Control-Allow-Headers", "*")
                    response.status = HttpServletResponse.SC_INTERNAL_SERVER_ERROR
                    response.writer.write("Internal Server Error: " + ex.message)
                }
            }
        }
    }
}
