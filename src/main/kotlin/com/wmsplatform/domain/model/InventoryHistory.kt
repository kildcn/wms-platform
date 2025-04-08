package com.wmsplatform.domain.model

import jakarta.persistence.*
import java.time.LocalDateTime
import com.fasterxml.jackson.annotation.JsonIgnore

enum class InventoryActionType {
    ADDED,
    REMOVED,
    MOVED,
    COUNTED,
    QUARANTINED
}

@Entity
@Table(name = "inventory_history")
data class InventoryHistory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "product_id", nullable = false)
    val productId: Long,

    @Column(name = "inventory_item_id")
    val inventoryItemId: Long?,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val actionType: InventoryActionType,

    @Column(nullable = false)
    val quantity: Int,

    @Column(name = "source_location_id")
    val sourceLocationId: Long?,

    @Column(name = "destination_location_id")
    val destinationLocationId: Long?,

    @Column(name = "user_id")
    val userId: Long?,

    @Column(name = "username")
    val username: String?,

    @Column(name = "batch_number")
    val batchNumber: String?,

    @Column(name = "timestamp", nullable = false)
    val timestamp: LocalDateTime = LocalDateTime.now(),

    @JsonIgnore

    @Column(length = 500)
    val notes: String? = null
)
