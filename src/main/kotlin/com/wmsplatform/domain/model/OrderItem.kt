package com.wmsplatform.domain.model

import jakarta.persistence.*
import java.math.BigDecimal
import com.fasterxml.jackson.annotation.JsonBackReference
import com.fasterxml.jackson.annotation.JsonIgnore

@Entity
@Table(name = "order_items")
data class OrderItem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")  // Remove nullable=false to allow temporary null during deserialization
    @JsonBackReference // Prevent circular reference
    var order: Order? = null, // Make nullable to fix circular reference issues during deserialization

    @Column(name = "product_id", nullable = false)
    val productId: Long,

    @Column(name = "product_sku", nullable = false)
    val productSku: String,

    @Column(name = "product_name", nullable = false)
    val productName: String,

    @Column(nullable = false)
    val quantity: Int,

    @Column(nullable = false)
    val price: BigDecimal,

    @Column(name = "is_picked", nullable = false)
    var isPicked: Boolean = false,

    @Column(name = "is_packed", nullable = false)
    var isPacked: Boolean = false
)
