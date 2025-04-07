package com.wmsplatform.domain.repository

import com.wmsplatform.domain.model.InventoryItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface InventoryItemRepository : JpaRepository<InventoryItem, Long> {
    fun findByProductId(productId: Long): List<InventoryItem>

    fun findByLocationId(locationId: Long): List<InventoryItem>

    @Query("SELECT i FROM InventoryItem i WHERE i.expiryDate < :date")
    fun findExpiredItems(date: LocalDateTime): List<InventoryItem>

    @Query("SELECT i FROM InventoryItem i WHERE i.expiryDate BETWEEN :startDate AND :endDate")
    fun findItemsExpiringBetween(startDate: LocalDateTime, endDate: LocalDateTime): List<InventoryItem>

    @Query("SELECT SUM(i.quantity) FROM InventoryItem i WHERE i.productId = :productId AND i.isQuarantined = false")
    fun getAvailableQuantity(productId: Long): Int?

    fun findByBatchNumber(batchNumber: String): List<InventoryItem>
}
