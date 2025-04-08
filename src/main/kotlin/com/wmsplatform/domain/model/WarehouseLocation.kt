package com.wmsplatform.domain.model

import jakarta.persistence.*
import com.fasterxml.jackson.annotation.JsonIgnore

@Entity
@Table(name = "warehouse_locations")
data class WarehouseLocation(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    val aisle: String,

    @Column(nullable = false)
    val rack: String,

    @Column(nullable = false)
    val shelf: String,

    @Column(nullable = false)
    val bin: String,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    val type: LocationType,

    @Column(nullable = false)
    val isOccupied: Boolean = false,

    @Column(nullable = false)
    val maxWeight: Double,

    @Column(nullable = false)
    val currentWeight: Double = 0.0,

    @JsonIgnore

    @OneToMany(mappedBy = "location", cascade = [CascadeType.ALL], orphanRemoval = true)
    val inventory: MutableList<InventoryItem> = mutableListOf()
)

enum class LocationType {
    PICKING,
    PACKING,
    BULK_STORAGE,
    RECEIVING,
    SHIPPING
}
