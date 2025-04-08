package com.wmsplatform.domain.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "inventory_items")
data class InventoryItem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "product_id", nullable = false)
    val productId: Long,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    val location: WarehouseLocation? = null,

    @Column(name = "batch_number")
    val batchNumber: String? = null,

    @Column(name = "expiry_date")
    val expiryDate: LocalDateTime? = null,

    @Column(name = "last_counted_at")
    val lastCountedAt: LocalDateTime? = null,

    @Column(nullable = false)
    val quantity: Int,

    @Column(name = "is_quarantined", nullable = false)
    val isQuarantined: Boolean = false
)
