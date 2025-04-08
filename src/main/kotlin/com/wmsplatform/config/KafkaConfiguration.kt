// src/main/kotlin/com/wmsplatform/config/KafkaConfiguration.kt
package com.wmsplatform.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.boot.autoconfigure.kafka.KafkaProperties
import org.springframework.kafka.core.DefaultKafkaProducerFactory
import org.springframework.kafka.core.KafkaTemplate
import org.slf4j.LoggerFactory

@Configuration
class KafkaConfiguration {
    private val logger = LoggerFactory.getLogger(KafkaConfiguration::class.java)

    /**
     * Creates a KafkaTemplate that will handle errors gracefully if Kafka is not available
     */
    @Bean
    @ConditionalOnMissingBean(KafkaTemplate::class)
    fun kafkaTemplate(properties: KafkaProperties): KafkaTemplate<String, String> {
        logger.info("Configuring fallback-safe Kafka Template")

        // Create a standard Kafka template, but we'll catch errors when using it
        val factory = DefaultKafkaProducerFactory<String, String>(properties.buildProducerProperties())
        return KafkaTemplate(factory)
    }

    /**
     * Extension function to safely send Kafka messages, logging instead of failing if there's an error
     */
    fun KafkaTemplate<String, String>.safeSend(topic: String, key: String, value: String) {
        try {
            this.send(topic, key, value)
        } catch (e: Exception) {
            logger.warn("Failed to send Kafka message to topic $topic. Logging instead: [$key] = $value", e)
        }
    }
}
