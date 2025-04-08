package com.wmsplatform.controller

import com.wmsplatform.domain.model.InventoryHistory
import com.wmsplatform.service.InventoryHistoryService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@RestController
@RequestMapping("/api/inventory-history")
class InventoryHistoryController(private val inventoryHistoryService: InventoryHistoryService) {

    @GetMapping("/product/{productId}")
    fun getHistoryByProduct(@PathVariable productId: Long): ResponseEntity<List<InventoryHistory>> {
        return ResponseEntity.ok(inventoryHistoryService.getHistoryByProduct(productId))
    }

    @GetMapping("/item/{inventoryItemId}")
    fun getHistoryByInventoryItem(@PathVariable inventoryItemId: Long): ResponseEntity<List<InventoryHistory>> {
        return ResponseEntity.ok(inventoryHistoryService.getHistoryByInventoryItem(inventoryItemId))
    }

    @GetMapping("/product/{productId}/monthly-summary")
    fun getMonthlySummary(
        @PathVariable productId: Long,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?
    ): ResponseEntity<List<Map<String, Any>>> {
        // Default to last 6 months if dates not provided
        val start = startDate?.atStartOfDay() ?: LocalDateTime.now().minusMonths(6).withDayOfMonth(1).with(LocalTime.MIN)
        val end = endDate?.atTime(LocalTime.MAX) ?: LocalDateTime.now()

        return ResponseEntity.ok(inventoryHistoryService.getMonthlySummary(productId, start, end))
    }

    @GetMapping("/product/{productId}/recent")
    fun getRecentHistory(
        @PathVariable productId: Long,
        @RequestParam(defaultValue = "10") limit: Int
    ): ResponseEntity<List<InventoryHistory>> {
        return ResponseEntity.ok(inventoryHistoryService.getRecentHistory(productId, limit))
    }
}
