package com.wmsplatform.service

import com.wmsplatform.domain.model.*
import com.wmsplatform.domain.repository.InventoryItemRepository
import com.wmsplatform.domain.repository.ProductRepository
import com.wmsplatform.domain.repository.WarehouseLocationRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class InventoryService(
    private val inventoryItemRepository: InventoryItemRepository,
    private val productRepository: ProductRepository,
    private val locationRepository: WarehouseLocationRepository,
    private val inventoryHistoryService: InventoryHistoryService
) {
    private val logger = LoggerFactory.getLogger(InventoryService::class.java)

    fun getInventoryItemById(id: Long): InventoryItem {
        return inventoryItemRepository.findById(id)
            .orElseThrow { NoSuchElementException("Inventory item not found with id: $id") }
    }

    fun getInventoryByProduct(productId: Long): List<InventoryItem> {
        return inventoryItemRepository.findByProductId(productId)
    }

    fun getInventoryByLocation(locationId: Long): List<InventoryItem> {
        return inventoryItemRepository.findByLocationId(locationId)
    }

    fun getAvailableQuantity(productId: Long): Int {
        return inventoryItemRepository.getAvailableQuantity(productId) ?: 0
    }

    fun getExpiredItems(): List<InventoryItem> {
        return inventoryItemRepository.findExpiredItems(LocalDateTime.now())
    }

    fun getItemsExpiringWithinDays(days: Long): List<InventoryItem> {
        val now = LocalDateTime.now()
        val futureDate = now.plusDays(days)
        return inventoryItemRepository.findItemsExpiringBetween(now, futureDate)
    }

    @Transactional
    fun addInventory(productId: Long, quantity: Int, locationId: Long?, batchNumber: String?, expiryDate: LocalDateTime?): InventoryItem {
        // Verify product exists
        val product = productRepository.findById(productId)
            .orElseThrow { NoSuchElementException("Product not found with id: $productId") }

        // Find location or auto-assign if not specified
        val location = if (locationId != null) {
            locationRepository.findById(locationId)
                .orElseThrow { NoSuchElementException("Location not found with id: $locationId") }
        } else {
            findSuitableLocation(product)
        }

        // Create inventory item
        val inventoryItem = InventoryItem(
            productId = productId,
            quantity = quantity,
            location = location,
            batchNumber = batchNumber,
            expiryDate = expiryDate,
            lastCountedAt = LocalDateTime.now()
        )

        val savedItem = inventoryItemRepository.save(inventoryItem)

        // Record history
        inventoryHistoryService.createHistoryEntry(
            productId = productId,
            inventoryItemId = savedItem.id,
            actionType = InventoryActionType.ADDED,
            quantity = quantity,
            destinationLocationId = location.id,
            batchNumber = batchNumber,
            notes = "Initial inventory addition"
        )

        // Update product stock count
        updateProductStockCount(product)

        // Update location status
        updateLocationStatus(location)

        return savedItem
    }

    @Transactional
    fun moveInventory(inventoryItemId: Long, newLocationId: Long, quantity: Int): InventoryItem {
        val inventoryItem = getInventoryItemById(inventoryItemId)

        if (quantity > inventoryItem.quantity) {
            throw IllegalArgumentException("Cannot move more than available quantity")
        }

        val newLocation = locationRepository.findById(newLocationId)
            .orElseThrow { NoSuchElementException("Location not found with id: $newLocationId") }

        val oldLocation = inventoryItem.location

        // If moving all quantity, just update the location
        if (quantity == inventoryItem.quantity) {
            val updatedItem = inventoryItem.copy(
                location = newLocation,
                lastCountedAt = LocalDateTime.now()
            )

            val savedItem = inventoryItemRepository.save(updatedItem)

            // Record history
            inventoryHistoryService.createHistoryEntry(
                productId = inventoryItem.productId,
                inventoryItemId = savedItem.id,
                actionType = InventoryActionType.MOVED,
                quantity = quantity,
                sourceLocationId = oldLocation.id,
                destinationLocationId = newLocation.id,
                batchNumber = inventoryItem.batchNumber,
                notes = "Moved entire inventory item"
            )

            // Update location statuses
            updateLocationStatus(oldLocation)
            updateLocationStatus(newLocation)

            return savedItem
        } else {
            // If moving partial quantity, create a new inventory item
            val newItem = InventoryItem(
                productId = inventoryItem.productId,
                quantity = quantity,
                location = newLocation,
                batchNumber = inventoryItem.batchNumber,
                expiryDate = inventoryItem.expiryDate,
                lastCountedAt = LocalDateTime.now()
            )

            // Update original item quantity
            val updatedOriginalItem = inventoryItem.copy(
                quantity = inventoryItem.quantity - quantity
            )

            val savedOriginalItem = inventoryItemRepository.save(updatedOriginalItem)
            val savedNewItem = inventoryItemRepository.save(newItem)

            // Record history
            inventoryHistoryService.createHistoryEntry(
                productId = inventoryItem.productId,
                inventoryItemId = savedNewItem.id,
                actionType = InventoryActionType.MOVED,
                quantity = quantity,
                sourceLocationId = oldLocation.id,
                destinationLocationId = newLocation.id,
                batchNumber = inventoryItem.batchNumber,
                notes = "Split from inventory item #${savedOriginalItem.id}"
            )

            // Update location status
            updateLocationStatus(oldLocation)
            updateLocationStatus(newLocation)

            return savedNewItem
        }
    }

    @Transactional
    fun removeInventory(productId: Long, quantity: Int): Boolean {
        val inventoryItems = inventoryItemRepository.findByProductId(productId)
            .filter { !it.isQuarantined }
            .sortedBy { it.expiryDate ?: LocalDateTime.MAX }

        if (inventoryItems.sumOf { it.quantity } < quantity) {
            return false
        }

        var remainingToRemove = quantity

        for (item in inventoryItems) {
            val location = item.location

            if (item.quantity <= remainingToRemove) {
                // Remove entire item
                val removedQuantity = item.quantity
                inventoryItemRepository.delete(item)
                remainingToRemove -= removedQuantity

                // Record history
                inventoryHistoryService.createHistoryEntry(
                    productId = productId,
                    inventoryItemId = item.id,
                    actionType = InventoryActionType.REMOVED,
                    quantity = removedQuantity,
                    sourceLocationId = location.id,
                    batchNumber = item.batchNumber,
                    notes = "Completely removed inventory item"
                )

                // Update location status
                updateLocationStatus(location)
            } else {
                // Remove partial quantity
                val removedQuantity = remainingToRemove
                val updatedItem = item.copy(
                    quantity = item.quantity - removedQuantity
                )
                inventoryItemRepository.save(updatedItem)

                // Record history
                inventoryHistoryService.createHistoryEntry(
                    productId = productId,
                    inventoryItemId = item.id,
                    actionType = InventoryActionType.REMOVED,
                    quantity = removedQuantity,
                    sourceLocationId = location.id,
                    batchNumber = item.batchNumber,
                    notes = "Partially removed from inventory item"
                )

                remainingToRemove = 0
            }

            if (remainingToRemove == 0) {
                break
            }
        }

        // Update product stock count
        val product = productRepository.findById(productId)
            .orElseThrow { NoSuchElementException("Product not found with id: $productId") }
        updateProductStockCount(product)

        return true
    }

    @Transactional
    fun quarantineInventory(inventoryItemId: Long): InventoryItem {
        val inventoryItem = getInventoryItemById(inventoryItemId)

        val updatedItem = inventoryItem.copy(
            isQuarantined = true
        )

        val savedItem = inventoryItemRepository.save(updatedItem)

        // Record history
        inventoryHistoryService.createHistoryEntry(
            productId = inventoryItem.productId,
            inventoryItemId = savedItem.id,
            actionType = InventoryActionType.QUARANTINED,
            quantity = inventoryItem.quantity,
            sourceLocationId = inventoryItem.location.id,
            batchNumber = inventoryItem.batchNumber,
            notes = "Inventory quarantined"
        )

        // Update product stock count since quarantined items aren't available
        val product = productRepository.findById(inventoryItem.productId)
            .orElseThrow { NoSuchElementException("Product not found with id: ${inventoryItem.productId}") }
        updateProductStockCount(product)

        return savedItem
    }

    @Transactional
    fun cycleCount(locationId: Long): List<InventoryItem> {
        val inventoryItems = inventoryItemRepository.findByLocationId(locationId)

        val updatedItems = inventoryItems.map { item ->
            val updatedItem = item.copy(lastCountedAt = LocalDateTime.now())

            // Record history for each item
            inventoryHistoryService.createHistoryEntry(
                productId = item.productId,
                inventoryItemId = item.id,
                actionType = InventoryActionType.COUNTED,
                quantity = item.quantity,
                sourceLocationId = locationId,
                batchNumber = item.batchNumber,
                notes = "Cycle count performed"
            )

            updatedItem
        }

        return inventoryItemRepository.saveAll(updatedItems)
    }

    // Helper methods
    private fun findSuitableLocation(product: Product): WarehouseLocation {
        // First try to find a location that already has this product
        val existingLocations = inventoryItemRepository.findByProductId(product.id!!)
            .mapNotNull { it.location.id }
            .distinct()
            .mapNotNull { locationRepository.findById(it).orElse(null) }
            .filter { it.currentWeight + product.weight.toDouble() <= it.maxWeight }

        if (existingLocations.isNotEmpty()) {
            return existingLocations.first()
        }

        // Next try to find an empty location
        val emptyLocations = locationRepository.findAvailableLocations(LocationType.BULK_STORAGE)
            .filter { it.currentWeight + product.weight.toDouble() <= it.maxWeight }

        if (emptyLocations.isNotEmpty()) {
            return emptyLocations.first()
        }

        // If no suitable location found, throw exception
        throw IllegalStateException("No suitable location found for product ${product.sku}")
    }

    private fun updateProductStockCount(product: Product) {
        // Calculate total available quantity
        val availableQuantity = getAvailableQuantity(product.id!!)

        // Update product stock count if different
        if (product.stockQuantity != availableQuantity) {
            productRepository.save(product.copy(
                stockQuantity = availableQuantity,
                updatedAt = LocalDateTime.now()
            ))
        }
    }

    private fun updateLocationStatus(location: WarehouseLocation) {
        val items = inventoryItemRepository.findByLocationId(location.id!!)
        val totalWeight = items.sumOf {
            val product = productRepository.findById(it.productId).orElse(null)
            (product?.weight?.toDouble() ?: 0.0) * it.quantity
        }

        val isOccupied = items.isNotEmpty()

        locationRepository.save(location.copy(
            isOccupied = isOccupied,
            currentWeight = totalWeight
        ))
    }
}
