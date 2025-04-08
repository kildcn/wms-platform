package com.wmsplatform.service

import com.wmsplatform.domain.model.InventoryActionType
import com.wmsplatform.domain.model.InventoryHistory
import com.wmsplatform.domain.repository.InventoryHistoryRepository
import com.wmsplatform.domain.repository.ProductRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

@Service
class InventoryHistoryService(
    private val inventoryHistoryRepository: InventoryHistoryRepository,
    private val productRepository: ProductRepository
) {

    fun getHistoryByProduct(productId: Long): List<InventoryHistory> {
        return inventoryHistoryRepository.findByProductIdOrderByTimestampDesc(productId)
    }

    fun getHistoryByInventoryItem(inventoryItemId: Long): List<InventoryHistory> {
        return inventoryHistoryRepository.findByInventoryItemId(inventoryItemId)
    }

    fun getRecentHistory(productId: Long, limit: Int): List<InventoryHistory> {
        return inventoryHistoryRepository.findByProductIdOrderByTimestampDesc(productId)
            .take(limit)
    }

    fun getMonthlySummary(productId: Long, startDate: LocalDateTime, endDate: LocalDateTime): List<Map<String, Any>> {
        val result = mutableListOf<Map<String, Any>>()

        // Create a formatter for month name
        val formatter = DateTimeFormatter.ofPattern("MMM")

        // Get data from repository
        val history = inventoryHistoryRepository.findByProductIdAndDateRange(productId, startDate, endDate)

        // Group by month and summarize
        val groupedByMonth = history.groupBy {
            it.timestamp.year * 100 + it.timestamp.monthValue // Group by year and month
        }

        // For each month, calculate additions and removals
        groupedByMonth.forEach { (yearMonth, records) ->
            val year = yearMonth / 100
            val month = yearMonth % 100

            val date = LocalDateTime.of(year, month, 1, 0, 0)
            val monthName = date.format(formatter)

            val additions = records.filter { it.actionType == InventoryActionType.ADDED }
                .sumOf { it.quantity }

            val removals = records.filter { it.actionType == InventoryActionType.REMOVED }
                .sumOf { it.quantity }

            result.add(mapOf(
                "month" to monthName,
                "year" to year,
                "monthValue" to month,
                "additions" to additions,
                "removals" to removals
            ))
        }

        // Sort by date (descending)
        return result.sortedByDescending {
            (it["year"] as Int) * 100 + (it["monthValue"] as Int)
        }
    }

    fun createHistoryEntry(
        productId: Long,
        inventoryItemId: Long? = null,
        actionType: InventoryActionType,
        quantity: Int,
        sourceLocationId: Long? = null,
        destinationLocationId: Long? = null,
        userId: Long? = null,
        username: String? = null,
        batchNumber: String? = null,
        notes: String? = null
    ): InventoryHistory {
        // Verify product exists
        productRepository.findById(productId)
            .orElseThrow { NoSuchElementException("Product not found with id: $productId") }

        val history = InventoryHistory(
            productId = productId,
            inventoryItemId = inventoryItemId,
            actionType = actionType,
            quantity = quantity,
            sourceLocationId = sourceLocationId,
            destinationLocationId = destinationLocationId,
            userId = userId,
            username = username,
            batchNumber = batchNumber,
            notes = notes,
            timestamp = LocalDateTime.now()
        )

        return inventoryHistoryRepository.save(history)
    }
}
