package com.wmsplatform.domain.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "products")
data class Product(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true)
    val sku: String,

    @Column(nullable = false)
    val name: String,

    @Column(length = 1000)
    val description: String? = null,

    @Column(nullable = false)
    val weight: BigDecimal,

    @Column(nullable = false)
    val width: BigDecimal,

    @Column(nullable = false)
    val height: BigDecimal,

    @Column(nullable = false)
    val depth: BigDecimal,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime? = null,

    @Column(nullable = false)
    val category: String,

    @Column(nullable = false)
    val stockQuantity: Int = 0
)
