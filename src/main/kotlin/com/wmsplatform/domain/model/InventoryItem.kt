package com.wmsplatform.domain.model

import jakarta.persistence.*
import java.time.LocalDateTime
import com.fasterxml.jackson.annotation.JsonIgnore

@Entity
@Table(name = "inventory_items")
data class InventoryItem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "product_id", nullable = false)
    val productId: Long,

    @Column(nullable = false)
    val quantity: Int,

    @JsonIgnore

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    val location: WarehouseLocation,

    @Column(name = "last_counted_at")
    val lastCountedAt: LocalDateTime? = null,

    @Column(name = "expiry_date")
    val expiryDate: LocalDateTime? = null,

    @Column(name = "batch_number")
    val batchNumber: String? = null,

    @Column(name = "is_quarantined")
    val isQuarantined: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
