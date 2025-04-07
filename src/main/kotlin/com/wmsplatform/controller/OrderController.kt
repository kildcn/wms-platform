package com.wmsplatform.controller

import com.wmsplatform.domain.model.Order
import com.wmsplatform.domain.model.OrderStatus
import com.wmsplatform.service.OrderService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/orders")
class OrderController(private val orderService: OrderService) {

    @GetMapping
    fun getOrdersByStatus(
        @RequestParam(required = false) status: OrderStatus?
    ): ResponseEntity<List<Order>> {
        return ResponseEntity.ok(
            if (status != null) orderService.getOrdersByStatus(status)
            else orderService.getHighPriorityOrders(0) // All orders sorted by priority
        )
    }

    @GetMapping("/{id}")
    fun getOrderById(@PathVariable id: Long): ResponseEntity<Order> {
        return try {
            ResponseEntity.ok(orderService.getOrderById(id))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/number/{orderNumber}")
    fun getOrderByNumber(@PathVariable orderNumber: String): ResponseEntity<Order> {
        return try {
            ResponseEntity.ok(orderService.getOrderByNumber(orderNumber))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/customer/{customerId}")
    fun getOrdersByCustomer(@PathVariable customerId: Long): ResponseEntity<List<Order>> {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId))
    }

    @GetMapping("/priority")
    fun getHighPriorityOrders(
        @RequestParam(required = false, defaultValue = "5") minPriority: Int
    ): ResponseEntity<List<Order>> {
        return ResponseEntity.ok(orderService.getHighPriorityOrders(minPriority))
    }

    @PostMapping
    fun createOrder(@Valid @RequestBody order: Order): ResponseEntity<Order> {
        return try {
            ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(order))
        } catch (e: NoSuchElementException) {
            ResponseEntity.badRequest().body(null)
        } catch (e: IllegalStateException) {
            ResponseEntity.badRequest().body(null)
        }
    }

    @PatchMapping("/{id}/status")
    fun updateOrderStatus(
        @PathVariable id: Long,
        @RequestParam status: OrderStatus
    ): ResponseEntity<Order> {
        return try {
            ResponseEntity.ok(orderService.updateOrderStatus(id, status))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        } catch (e: IllegalStateException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PostMapping("/{id}/cancel")
    fun cancelOrder(@PathVariable id: Long): ResponseEntity<Order> {
        return try {
            ResponseEntity.ok(orderService.cancelOrder(id))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        } catch (e: IllegalStateException) {
            ResponseEntity.badRequest().build()
        }
    }
}
