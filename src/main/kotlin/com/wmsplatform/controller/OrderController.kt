package com.wmsplatform.controller

import com.wmsplatform.domain.model.Order
import com.wmsplatform.domain.model.OrderStatus
import com.wmsplatform.service.OrderService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.slf4j.LoggerFactory

@RestController
@RequestMapping("/api/orders")
class OrderController(private val orderService: OrderService) {
    private val logger = LoggerFactory.getLogger(OrderController::class.java)

    @GetMapping
    fun getOrdersByStatus(
        @RequestParam(required = false) status: OrderStatus?
    ): ResponseEntity<List<Order>> {
        return try {
            ResponseEntity.ok(
                if (status != null) orderService.getOrdersByStatus(status)
                else orderService.getHighPriorityOrders(0) // All orders sorted by priority
            )
        } catch (ex: Exception) {
            logger.error("Error getting orders by status: {}", ex.message, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/{id}")
    fun getOrderById(@PathVariable id: Long): ResponseEntity<Order> {
        logger.info("Getting order with ID: {}", id)
        return try {
            ResponseEntity.ok(orderService.getOrderById(id))
        } catch (e: NoSuchElementException) {
            logger.error("Order not found with ID: {}", id, e)
            ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("Error getting order by ID: {}", ex.message, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/number/{orderNumber}")
    fun getOrderByNumber(@PathVariable orderNumber: String): ResponseEntity<Order> {
        logger.info("Getting order with number: {}", orderNumber)
        return try {
            ResponseEntity.ok(orderService.getOrderByNumber(orderNumber))
        } catch (e: NoSuchElementException) {
            logger.error("Order not found with number: {}", orderNumber, e)
            ResponseEntity.notFound().build()
        } catch (ex: Exception) {
            logger.error("Error getting order by number: {}", ex.message, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/customer/{customerId}")
    fun getOrdersByCustomer(@PathVariable customerId: Long): ResponseEntity<List<Order>> {
        return try {
            ResponseEntity.ok(orderService.getOrdersByCustomer(customerId))
        } catch (ex: Exception) {
            logger.error("Error getting orders by customer: {}", ex.message, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/priority")
    fun getHighPriorityOrders(
        @RequestParam(required = false, defaultValue = "5") minPriority: Int
    ): ResponseEntity<List<Order>> {
        return try {
            ResponseEntity.ok(orderService.getHighPriorityOrders(minPriority))
        } catch (ex: Exception) {
            logger.error("Error getting high priority orders: {}", ex.message, ex)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @PostMapping
    fun createOrder(@Valid @RequestBody order: Order): ResponseEntity<Any> {
        logger.info("Creating new order: {}", order.orderNumber)

        // Log the entire order object for debugging
        logger.debug("Order details: {}", order)

        return try {
            // Attempt to print order items
            for (item in order.items) {
                logger.debug("Order item: productId={}, quantity={}", item.productId, item.quantity)
            }

            val createdOrder = orderService.createOrder(order)
            logger.info("Order created successfully with ID: {}", createdOrder.id)
            ResponseEntity.status(HttpStatus.CREATED).body(createdOrder)
        } catch (e: NoSuchElementException) {
            logger.error("Product not found when creating order", e)
            ResponseEntity.badRequest().body(mapOf("error" to "Product not found", "message" to e.message))
        } catch (e: IllegalStateException) {
            logger.error("Invalid state when creating order", e)
            ResponseEntity.badRequest().body(mapOf("error" to "Invalid state", "message" to e.message))
        } catch (e: Exception) {
            logger.error("Unexpected error creating order: {}", e.message, e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Internal server error", "message" to e.message))
        }
    }

    @PatchMapping("/{id}/status")
    fun updateOrderStatus(
        @PathVariable id: Long,
        @RequestBody body: Map<String, String>
    ): ResponseEntity<Any> {
        logger.info("Updating order status for ID: {}, status: {}", id, body["status"])

        val status = try {
            body["status"]?.let { OrderStatus.valueOf(it) }
                ?: return ResponseEntity.badRequest().body(mapOf("error" to "Status is required"))
        } catch (e: IllegalArgumentException) {
            logger.error("Invalid status value: {}", body["status"], e)
            return ResponseEntity.badRequest().body(mapOf("error" to "Invalid status value", "message" to e.message))
        }

        return try {
            val updatedOrder = orderService.updateOrderStatus(id, status)
            ResponseEntity.ok(updatedOrder)
        } catch (e: NoSuchElementException) {
            logger.error("Order with ID {} not found", id, e)
            ResponseEntity.notFound().build()
        } catch (e: IllegalStateException) {
            logger.error("Invalid state transition for order ID {}", id, e)
            ResponseEntity.badRequest().body(mapOf("error" to "Invalid state transition", "message" to e.message))
        } catch (e: Exception) {
            logger.error("Unexpected error while updating order ID {}: {}", id, e.message, e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Internal server error", "message" to e.message))
        }
    }

    @PostMapping("/{id}/cancel")
    fun cancelOrder(@PathVariable id: Long): ResponseEntity<Any> {
        logger.info("Cancelling order with ID: {}", id)
        return try {
            ResponseEntity.ok(orderService.cancelOrder(id))
        } catch (e: NoSuchElementException) {
            logger.error("Order not found with ID: {}", id, e)
            ResponseEntity.notFound().build()
        } catch (e: IllegalStateException) {
            logger.error("Cannot cancel order in current state, ID: {}", id, e)
            ResponseEntity.badRequest().body(mapOf("error" to "Invalid state", "message" to e.message))
        } catch (e: Exception) {
            logger.error("Unexpected error cancelling order ID {}: {}", id, e.message, e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Internal server error", "message" to e.message))
        }
    }
}
