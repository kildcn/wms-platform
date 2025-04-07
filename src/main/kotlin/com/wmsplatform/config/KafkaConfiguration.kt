package com.wmsplatform.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.kafka.core.DefaultKafkaProducerFactory
import org.springframework.kafka.core.ProducerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.slf4j.LoggerFactory
import org.apache.kafka.clients.producer.ProducerConfig
import org.apache.kafka.common.serialization.StringSerializer
import java.util.HashMap
import java.util.concurrent.CompletableFuture

@Configuration
class KafkaConfiguration {
    private val logger = LoggerFactory.getLogger(KafkaConfiguration::class.java)

    /**
     * Provides a fallback Kafka template that logs messages instead of sending them
     * when Kafka is not properly configured or available.
     */
    @Bean
    @ConditionalOnMissingBean(KafkaTemplate::class)
    fun kafkaTemplate(): KafkaTemplate<String, String> {
        logger.warn("Using fallback Kafka template that will log messages instead of sending them")

        val configs = HashMap<String, Any>()
        configs[ProducerConfig.BOOTSTRAP_SERVERS_CONFIG] = "localhost:9092" // Dummy address
        configs[ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG] = StringSerializer::class.java
        configs[ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG] = StringSerializer::class.java

        val producerFactory = object : DefaultKafkaProducerFactory<String, String>(configs) {
            override fun createProducer(): Nothing {
                throw UnsupportedOperationException("This is a fallback Kafka producer factory")
            }
        }

        return object : KafkaTemplate<String, String>(producerFactory) {
            override fun send(topic: String, key: String, data: String): CompletableFuture<*> {
                logger.info("KAFKA MESSAGE (Topic: $topic, Key: $key): $data")
                return CompletableFuture.completedFuture(null)
            }
        }
    }
}
