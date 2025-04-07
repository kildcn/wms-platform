package com.wmsplatform.domain.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "orders")
data class Order(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false, unique = true)
    val orderNumber: String,

    @Column(nullable = false)
    val customerId: Long,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    val status: OrderStatus,

    @OneToMany(mappedBy = "order", cascade = [CascadeType.ALL], orphanRemoval = true)
    val items: MutableList<OrderItem> = mutableListOf(),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime? = null,

    @Column(name = "shipping_address", nullable = false, length = 1000)
    val shippingAddress: String,

    @Column(name = "priority_level")
    val priorityLevel: Int = 0
)

enum class OrderStatus {
    CREATED,
    PROCESSING,
    PICKING,
    PACKING,
    SHIPPED,
    DELIVERED,
    CANCELED
}
