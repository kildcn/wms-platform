package com.wmsplatform.controller

import com.wmsplatform.domain.model.InventoryItem
import com.wmsplatform.service.InventoryService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/inventory")
class InventoryController(private val inventoryService: InventoryService) {

    @GetMapping("/{id}")
    fun getInventoryItemById(@PathVariable id: Long): ResponseEntity<InventoryItem> {
        return try {
            ResponseEntity.ok(inventoryService.getInventoryItemById(id))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/product/{productId}")
    fun getInventoryByProduct(@PathVariable productId: Long): ResponseEntity<List<InventoryItem>> {
        return ResponseEntity.ok(inventoryService.getInventoryByProduct(productId))
    }

    @GetMapping("/location/{locationId}")
    fun getInventoryByLocation(@PathVariable locationId: Long): ResponseEntity<List<InventoryItem>> {
        return ResponseEntity.ok(inventoryService.getInventoryByLocation(locationId))
    }

    @GetMapping("/product/{productId}/quantity")
    fun getAvailableQuantity(@PathVariable productId: Long): ResponseEntity<Int> {
        return ResponseEntity.ok(inventoryService.getAvailableQuantity(productId))
    }

    @GetMapping("/expired")
    fun getExpiredItems(): ResponseEntity<List<InventoryItem>> {
        return ResponseEntity.ok(inventoryService.getExpiredItems())
    }

    @GetMapping("/expiring")
    fun getItemsExpiringWithinDays(
        @RequestParam(defaultValue = "7") days: Long
    ): ResponseEntity<List<InventoryItem>> {
        return ResponseEntity.ok(inventoryService.getItemsExpiringWithinDays(days))
    }

    @GetMapping("/stock-by-category")
    fun getStockByCategory(): ResponseEntity<Map<String, Int>> {
        return ResponseEntity.ok(inventoryService.getStockByCategory())
    }

    @PostMapping("/add")
    fun addInventory(
        @RequestParam productId: Long,
        @RequestParam quantity: Int,
        @RequestParam(required = false) locationId: Long?,
        @RequestParam(required = false) batchNumber: String?,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) expiryDate: LocalDateTime?
    ): ResponseEntity<InventoryItem> {
        return try {
            ResponseEntity.status(HttpStatus.CREATED).body(
                inventoryService.addInventory(productId, quantity, locationId, batchNumber, expiryDate)
            )
        } catch (e: NoSuchElementException) {
            ResponseEntity.badRequest().build()
        } catch (e: IllegalStateException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{inventoryItemId}/move")
    fun moveInventory(
        @PathVariable inventoryItemId: Long,
        @RequestParam newLocationId: Long,
        @RequestParam quantity: Int
    ): ResponseEntity<InventoryItem> {
        return try {
            ResponseEntity.ok(inventoryService.moveInventory(inventoryItemId, newLocationId, quantity))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/remove")
    fun removeInventory(
        @RequestParam productId: Long,
        @RequestParam quantity: Int
    ): ResponseEntity<Boolean> {
        val success = inventoryService.removeInventory(productId, quantity)
        return if (success) {
            ResponseEntity.ok(true)
        } else {
            ResponseEntity.badRequest().body(false)
        }
    }

    @PostMapping("/{inventoryItemId}/quarantine")
    fun quarantineInventory(@PathVariable inventoryItemId: Long): ResponseEntity<InventoryItem> {
        return try {
            ResponseEntity.ok(inventoryService.quarantineInventory(inventoryItemId))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping("/location/{locationId}/count")
    fun cycleCount(@PathVariable locationId: Long): ResponseEntity<List<InventoryItem>> {
        return ResponseEntity.ok(inventoryService.cycleCount(locationId))
    }
}
