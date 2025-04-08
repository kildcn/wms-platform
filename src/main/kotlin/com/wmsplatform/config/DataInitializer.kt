package com.wmsplatform.config

import com.wmsplatform.domain.model.*
import com.wmsplatform.domain.repository.InventoryItemRepository
import com.wmsplatform.domain.repository.OrderRepository
import com.wmsplatform.domain.repository.ProductRepository
import com.wmsplatform.domain.repository.WarehouseLocationRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.math.BigDecimal
import java.time.LocalDateTime

@Configuration
class DataInitializer {
    private val logger = LoggerFactory.getLogger(DataInitializer::class.java)

    @Bean
    @Profile("!test") // Don't run this initializer in test environment
    fun initDatabase(
        productRepository: ProductRepository,
        locationRepository: WarehouseLocationRepository,
        inventoryRepository: InventoryItemRepository,
        orderRepository: OrderRepository
    ): CommandLineRunner {
        return CommandLineRunner {
            logger.info("Starting database initialization...")

            if (locationRepository.count() > 0) {
                logger.info("Database already contains data, skipping initialization")
                return@CommandLineRunner
            }

            // Create warehouse locations
            val locations = createWarehouseLocations()
            logger.info("Saving ${locations.size} warehouse locations")
            val savedLocations = locationRepository.saveAll(locations)

            // Create products by category
            val products = createProducts()
            logger.info("Saving ${products.size} products")
            val savedProducts = productRepository.saveAll(products)

            // Add inventory for products
            val inventoryItems = createInventoryItems(savedProducts, savedLocations)
            logger.info("Saving ${inventoryItems.size} inventory items")
            inventoryRepository.saveAll(inventoryItems)

            // Create some sample orders
            val orders = createOrders(savedProducts)
            logger.info("Saving ${orders.size} orders")
            orderRepository.saveAll(orders)

            logger.info("Database initialization completed")
        }
    }

    private fun createInitialInventoryHistory(
    inventoryHistoryRepository: InventoryHistoryRepository,
    inventoryItems: List<InventoryItem>
) {
    val random = java.util.Random()
    val historyRecords = mutableListOf<InventoryHistory>()

    // For each inventory item, create history records
    inventoryItems.forEach { item ->
        // Initial creation record
        historyRecords.add(
            InventoryHistory(
                productId = item.productId,
                inventoryItemId = item.id,
                actionType = InventoryActionType.ADDED,
                quantity = item.quantity,
                destinationLocationId = item.location.id,
                batchNumber = item.batchNumber,
                username = "System",
                notes = "Initial inventory creation",
                timestamp = item.createdAt.minusDays(random.nextInt(30).toLong())
            )
        )

        // For some items, add additional history
        if (random.nextBoolean()) {
            // Record a move action
            historyRecords.add(
                InventoryHistory(
                    productId = item.productId,
                    inventoryItemId = item.id,
                    actionType = InventoryActionType.MOVED,
                    quantity = item.quantity,
                    sourceLocationId = item.location.id,
                    destinationLocationId = item.location.id,
                    username = "Warehouse Staff",
                    notes = "Inventory relocation",
                    timestamp = item.createdAt.minusDays(random.nextInt(20).toLong())
                )
            )
        }

        // Add a count record for some items
        if (random.nextBoolean()) {
            historyRecords.add(
                InventoryHistory(
                    productId = item.productId,
                    inventoryItemId = item.id,
                    actionType = InventoryActionType.COUNTED,
                    quantity = item.quantity,
                    sourceLocationId = item.location.id,
                    username = "Inventory Manager",
                    notes = "Cycle count verification",
                    timestamp = item.createdAt.minusDays(random.nextInt(10).toLong())
                )
            )
        }
    }

    // Save all history records
    inventoryHistoryRepository.saveAll(historyRecords)
    logger.info("Created ${historyRecords.size} inventory history records")
}

    private fun createWarehouseLocations(): List<WarehouseLocation> {
        val locations = mutableListOf<WarehouseLocation>()

        // Create locations for different warehouse areas

        // Bulk Storage Area (A aisles)
        for (aisle in 1..3) {
            for (rack in 1..5) {
                for (shelf in 1..4) {
                    for (bin in 1..2) {
                        locations.add(
                            WarehouseLocation(
                                aisle = "A$aisle",
                                rack = rack.toString().padStart(2, '0'),
                                shelf = shelf.toString().padStart(2, '0'),
                                bin = bin.toString().padStart(2, '0'),
                                type = LocationType.BULK_STORAGE,
                                isOccupied = false,
                                maxWeight = 500.0,
                                currentWeight = 0.0
                            )
                        )
                    }
                }
            }
        }

        // Picking Area (B aisles)
        for (aisle in 1..2) {
            for (rack in 1..4) {
                for (shelf in 1..3) {
                    locations.add(
                        WarehouseLocation(
                            aisle = "B$aisle",
                            rack = rack.toString().padStart(2, '0'),
                            shelf = shelf.toString().padStart(2, '0'),
                            bin = "01",
                            type = LocationType.PICKING,
                            isOccupied = false,
                            maxWeight = 200.0,
                            currentWeight = 0.0
                        )
                    )
                }
            }
        }

        // Packing Area (C aisle)
        for (rack in 1..3) {
            locations.add(
                WarehouseLocation(
                    aisle = "C1",
                    rack = rack.toString().padStart(2, '0'),
                    shelf = "01",
                    bin = "01",
                    type = LocationType.PACKING,
                    isOccupied = false,
                    maxWeight = 100.0,
                    currentWeight = 0.0
                )
            )
        }

        // Receiving Area (D aisle)
        for (rack in 1..2) {
            locations.add(
                WarehouseLocation(
                    aisle = "D1",
                    rack = rack.toString().padStart(2, '0'),
                    shelf = "01",
                    bin = "01",
                    type = LocationType.RECEIVING,
                    isOccupied = false,
                    maxWeight = 400.0,
                    currentWeight = 0.0
                )
            )
        }

        // Shipping Area (E aisle)
        for (rack in 1..2) {
            locations.add(
                WarehouseLocation(
                    aisle = "E1",
                    rack = rack.toString().padStart(2, '0'),
                    shelf = "01",
                    bin = "01",
                    type = LocationType.SHIPPING,
                    isOccupied = false,
                    maxWeight = 400.0,
                    currentWeight = 0.0
                )
            )
        }

        return locations
    }

    private fun createProducts(): List<Product> {
        // Create different categories of products
        val categories = listOf(
            "Electronics",
            "Clothing",
            "Food",
            "Books",
            "Furniture",
            "Sports"
        )

        val products = mutableListOf<Product>()

        // Electronics
        products.addAll(listOf(
            Product(
                sku = "ELEC001",
                name = "Smartphone X12",
                description = "Latest smartphone with 5G capabilities",
                weight = BigDecimal("0.18"),
                width = BigDecimal("7.5"),
                height = BigDecimal("15"),
                depth = BigDecimal("0.8"),
                category = "Electronics",
                stockQuantity = 0 // Will be updated based on inventory
            ),
            Product(
                sku = "ELEC002",
                name = "Laptop Pro",
                description = "Professional laptop with 16GB RAM",
                weight = BigDecimal("2.1"),
                width = BigDecimal("35"),
                height = BigDecimal("23"),
                depth = BigDecimal("1.5"),
                category = "Electronics",
                stockQuantity = 0
            ),
            Product(
                sku = "ELEC003",
                name = "Wireless Headphones",
                description = "Noise-canceling Bluetooth headphones",
                weight = BigDecimal("0.25"),
                width = BigDecimal("18"),
                height = BigDecimal("20"),
                depth = BigDecimal("8"),
                category = "Electronics",
                stockQuantity = 0
            )
        ))

        // Clothing
        products.addAll(listOf(
            Product(
                sku = "CLO001",
                name = "Men's T-Shirt",
                description = "100% cotton t-shirt",
                weight = BigDecimal("0.2"),
                width = BigDecimal("60"),
                height = BigDecimal("80"),
                depth = BigDecimal("1"),
                category = "Clothing",
                stockQuantity = 0
            ),
            Product(
                sku = "CLO002",
                name = "Women's Jeans",
                description = "Slim fit denim jeans",
                weight = BigDecimal("0.5"),
                width = BigDecimal("40"),
                height = BigDecimal("100"),
                depth = BigDecimal("2"),
                category = "Clothing",
                stockQuantity = 0
            )
        ))

        // Food
        products.addAll(listOf(
            Product(
                sku = "FOOD001",
                name = "Organic Coffee Beans",
                description = "Fair trade coffee beans, 500g",
                weight = BigDecimal("0.5"),
                width = BigDecimal("10"),
                height = BigDecimal("20"),
                depth = BigDecimal("5"),
                category = "Food",
                stockQuantity = 0
            ),
            Product(
                sku = "FOOD002",
                name = "Chocolate Gift Box",
                description = "Assorted chocolates, 250g",
                weight = BigDecimal("0.25"),
                width = BigDecimal("15"),
                height = BigDecimal("15"),
                depth = BigDecimal("3"),
                category = "Food",
                stockQuantity = 0
            )
        ))

        // Books
        products.addAll(listOf(
            Product(
                sku = "BOOK001",
                name = "Modern Programming",
                description = "Guide to modern programming techniques",
                weight = BigDecimal("0.8"),
                width = BigDecimal("20"),
                height = BigDecimal("25"),
                depth = BigDecimal("3"),
                category = "Books",
                stockQuantity = 0
            ),
            Product(
                sku = "BOOK002",
                name = "Business Strategy",
                description = "Business strategy and management",
                weight = BigDecimal("0.9"),
                width = BigDecimal("20"),
                height = BigDecimal("28"),
                depth = BigDecimal("3"),
                category = "Books",
                stockQuantity = 0
            )
        ))

        // Furniture
        products.addAll(listOf(
            Product(
                sku = "FURN001",
                name = "Office Chair",
                description = "Ergonomic office chair",
                weight = BigDecimal("15"),
                width = BigDecimal("60"),
                height = BigDecimal("110"),
                depth = BigDecimal("60"),
                category = "Furniture",
                stockQuantity = 0
            ),
            Product(
                sku = "FURN002",
                name = "Coffee Table",
                description = "Wooden coffee table",
                weight = BigDecimal("25"),
                width = BigDecimal("90"),
                height = BigDecimal("45"),
                depth = BigDecimal("60"),
                category = "Furniture",
                stockQuantity = 0
            )
        ))

        // Sports
        products.addAll(listOf(
            Product(
                sku = "SPORT001",
                name = "Yoga Mat",
                description = "Anti-slip yoga mat",
                weight = BigDecimal("1.2"),
                width = BigDecimal("60"),
                height = BigDecimal("180"),
                depth = BigDecimal("0.5"),
                category = "Sports",
                stockQuantity = 0
            ),
            Product(
                sku = "SPORT002",
                name = "Dumbbell Set",
                description = "Set of 2 dumbbells, 5kg each",
                weight = BigDecimal("10"),
                width = BigDecimal("40"),
                height = BigDecimal("15"),
                depth = BigDecimal("15"),
                category = "Sports",
                stockQuantity = 0
            )
        ))

        return products
    }

    private fun createInventoryItems(products: List<Product>, locations: List<WarehouseLocation>): List<InventoryItem> {
        val inventoryItems = mutableListOf<InventoryItem>()
        val random = java.util.Random()

        // Group locations by type
        val bulkLocations = locations.filter { it.type == LocationType.BULK_STORAGE }
        val pickingLocations = locations.filter { it.type == LocationType.PICKING }

        // For each product, create some inventory in both bulk and picking locations
        products.forEach { product ->
            // Select some random locations
            val bulkLocation = bulkLocations[random.nextInt(bulkLocations.size)]
            val pickingLocation = pickingLocations[random.nextInt(pickingLocations.size)]

            // Create bulk storage inventory (larger quantity)
            val bulkQuantity = 20 + random.nextInt(80) // 20-100 items
            inventoryItems.add(
                InventoryItem(
                    productId = product.id!!,
                    quantity = bulkQuantity,
                    location = bulkLocation,
                    lastCountedAt = LocalDateTime.now().minusDays(random.nextInt(10).toLong()),
                    batchNumber = "B${product.id}${random.nextInt(1000)}",
                    expiryDate = if (product.category == "Food") LocalDateTime.now().plusMonths(6) else null
                )
            )

            // Create picking area inventory (smaller quantity)
            val pickingQuantity = 5 + random.nextInt(15) // 5-20 items
            inventoryItems.add(
                InventoryItem(
                    productId = product.id!!,
                    quantity = pickingQuantity,
                    location = pickingLocation,
                    lastCountedAt = LocalDateTime.now().minusDays(random.nextInt(5).toLong()),
                    batchNumber = "P${product.id}${random.nextInt(1000)}",
                    expiryDate = if (product.category == "Food") LocalDateTime.now().plusMonths(6) else null
                )
            )

            // For some products, add low stock scenario
            if (random.nextBoolean() && product.category != "Furniture") {
                val lowStockLocation = bulkLocations[random.nextInt(bulkLocations.size)]
                inventoryItems.add(
                    InventoryItem(
                        productId = product.id!!,
                        quantity = 3, // Low stock
                        location = lowStockLocation,
                        lastCountedAt = LocalDateTime.now(),
                        batchNumber = "L${product.id}${random.nextInt(1000)}",
                        expiryDate = if (product.category == "Food") LocalDateTime.now().plusDays(10) else null // About to expire
                    )
                )
            }

            // For some items, create quarantined inventory
            if (random.nextInt(10) < 2) { // 20% chance
                val bulkLocationForQuarantine = bulkLocations[random.nextInt(bulkLocations.size)]
                inventoryItems.add(
                    InventoryItem(
                        productId = product.id!!,
                        quantity = 2 + random.nextInt(5), // 2-7 items
                        location = bulkLocationForQuarantine,
                        lastCountedAt = LocalDateTime.now().minusDays(1),
                        batchNumber = "Q${product.id}${random.nextInt(1000)}",
                        isQuarantined = true
                    )
                )
            }
        }

        return inventoryItems
    }

    private fun createOrders(products: List<Product>): List<Order> {
        val orders = mutableListOf<Order>()
        val random = java.util.Random()
        val orderStatuses = OrderStatus.values()

        // Create 10 sample orders with different statuses
        for (i in 1..10) {
            val orderNumber = "ORD${100 + i}"
            val customerId = 1000L + random.nextInt(100)
            val status = orderStatuses[random.nextInt(orderStatuses.size)]
            val createdDate = LocalDateTime.now().minusDays(random.nextInt(30).toLong())

            // Build order
            val order = Order(
                orderNumber = orderNumber,
                customerId = customerId,
                status = status,
                shippingAddress = "123 Customer Street, City, Country, ${10000 + random.nextInt(90000)}",
                createdAt = createdDate,
                updatedAt = if (status != OrderStatus.CREATED) createdDate.plusDays(1) else null,
                priorityLevel = 1 + random.nextInt(5) // 1-5 priority
            )

            // Add 1-5 items to the order
            val numItems = 1 + random.nextInt(5)
            val selectedProductIndices = mutableSetOf<Int>()

            while (selectedProductIndices.size < numItems) {
                selectedProductIndices.add(random.nextInt(products.size))
            }

            // Create order items
            val orderItems = selectedProductIndices.map { productIndex ->
                val product = products[productIndex]
                val quantity = 1 + random.nextInt(5) // 1-5 quantity
                val price = product.weight.multiply(BigDecimal("10")).add(BigDecimal("15")) // Simple price calculation

                OrderItem(
                    order = order,
                    productId = product.id!!,
                    productSku = product.sku,
                    productName = product.name,
                    quantity = quantity,
                    price = price,
                    isPicked = status.ordinal >= OrderStatus.PICKING.ordinal,
                    isPacked = status.ordinal >= OrderStatus.PACKING.ordinal
                )
            }

            // Add items to order
            order.items.addAll(orderItems)
            orders.add(order)
        }

        return orders
    }
}
