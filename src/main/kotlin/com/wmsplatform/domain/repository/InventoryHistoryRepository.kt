package com.wmsplatform.domain.repository

import com.wmsplatform.domain.model.InventoryHistory
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface InventoryHistoryRepository : JpaRepository<InventoryHistory, Long> {

    fun findByProductId(productId: Long): List<InventoryHistory>

    fun findByInventoryItemId(inventoryItemId: Long): List<InventoryHistory>

    fun findByProductIdOrderByTimestampDesc(productId: Long): List<InventoryHistory>

    @Query("SELECT h FROM InventoryHistory h WHERE h.productId = :productId AND h.timestamp BETWEEN :startDate AND :endDate ORDER BY h.timestamp DESC")
    fun findByProductIdAndDateRange(productId: Long, startDate: LocalDateTime, endDate: LocalDateTime): List<InventoryHistory>

    @Query("SELECT SUM(CASE WHEN h.actionType = 'ADDED' THEN h.quantity ELSE 0 END) FROM InventoryHistory h WHERE h.productId = :productId AND h.timestamp BETWEEN :startDate AND :endDate")
    fun getTotalAddedByProductAndDateRange(productId: Long, startDate: LocalDateTime, endDate: LocalDateTime): Int?

    @Query("SELECT SUM(CASE WHEN h.actionType = 'REMOVED' THEN h.quantity ELSE 0 END) FROM InventoryHistory h WHERE h.productId = :productId AND h.timestamp BETWEEN :startDate AND :endDate")
    fun getTotalRemovedByProductAndDateRange(productId: Long, startDate: LocalDateTime, endDate: LocalDateTime): Int?
}
