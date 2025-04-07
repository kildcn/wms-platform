package com.wmsplatform.service

import com.wmsplatform.domain.model.Order
import com.wmsplatform.domain.model.OrderStatus
import com.wmsplatform.domain.repository.OrderRepository
import com.wmsplatform.domain.repository.ProductRepository
import com.wmsplatform.event.OrderStatusChangedEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class OrderService(
    private val orderRepository: OrderRepository,
    private val productRepository: ProductRepository,
    private val eventPublisher: ApplicationEventPublisher
) {

    fun getOrderById(id: Long): Order {
        return orderRepository.findById(id)
            .orElseThrow { NoSuchElementException("Order not found with id: $id") }
    }

    fun getOrderByNumber(orderNumber: String): Order {
        return orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow { NoSuchElementException("Order not found with number: $orderNumber") }
    }

    fun getOrdersByCustomer(customerId: Long): List<Order> {
        return orderRepository.findByCustomerId(customerId)
    }

    fun getOrdersByStatus(status: OrderStatus): List<Order> {
        return orderRepository.findByStatus(status)
    }

    fun getHighPriorityOrders(minPriority: Int = 5): List<Order> {
        return orderRepository.findHighPriorityOrders(minPriority)
    }

    @Transactional
    fun createOrder(order: Order): Order {
        // Validate order items
        order.items.forEach { item ->
            val product = productRepository.findById(item.productId)
                .orElseThrow { NoSuchElementException("Product not found with id: ${item.productId}") }

            if (product.stockQuantity < item.quantity) {
                throw IllegalStateException("Not enough stock for product ${product.name} (SKU: ${product.sku})")
            }
        }

        val savedOrder = orderRepository.save(order)

        // Publish an event for the new order
        eventPublisher.publishEvent(OrderStatusChangedEvent(
            this,
            savedOrder.id!!,
            null,
            savedOrder.status
        ))

        return savedOrder
    }

    @Transactional
    fun updateOrderStatus(id: Long, newStatus: OrderStatus): Order {
        val order = getOrderById(id)
        val oldStatus = order.status

        if (oldStatus == newStatus) {
            return order  // No change required
        }

        // Validate state transition
        validateStatusTransition(oldStatus, newStatus)

        val updatedOrder = order.copy(
            status = newStatus,
            updatedAt = LocalDateTime.now()
        )

        val savedOrder = orderRepository.save(updatedOrder)

        // Publish an event for the status change
        eventPublisher.publishEvent(OrderStatusChangedEvent(
            this,
            savedOrder.id!!,
            oldStatus,
            newStatus
        ))

        return savedOrder
    }

    @Transactional
    fun cancelOrder(id: Long): Order {
        val order = getOrderById(id)

        // Only orders in certain statuses can be canceled
        if (order.status in listOf(OrderStatus.SHIPPED, OrderStatus.DELIVERED)) {
            throw IllegalStateException("Cannot cancel order that has already been ${order.status}")
        }

        val oldStatus = order.status
        val updatedOrder = order.copy(
            status = OrderStatus.CANCELED,
            updatedAt = LocalDateTime.now()
        )

        val savedOrder = orderRepository.save(updatedOrder)

        // Publish an event for the cancellation
        eventPublisher.publishEvent(OrderStatusChangedEvent(
            this,
            savedOrder.id!!,
            oldStatus,
            OrderStatus.CANCELED
        ))

        return savedOrder
    }

    // Helper method to validate status transitions
    private fun validateStatusTransition(oldStatus: OrderStatus, newStatus: OrderStatus) {
        val validTransitions = mapOf(
            OrderStatus.CREATED to listOf(OrderStatus.PROCESSING, OrderStatus.CANCELED),
            OrderStatus.PROCESSING to listOf(OrderStatus.PICKING, OrderStatus.CANCELED),
            OrderStatus.PICKING to listOf(OrderStatus.PACKING, OrderStatus.CANCELED),
            OrderStatus.PACKING to listOf(OrderStatus.SHIPPED, OrderStatus.CANCELED),
            OrderStatus.SHIPPED to listOf(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED to emptyList(),
            OrderStatus.CANCELED to emptyList()
        )

        if (!validTransitions[oldStatus]!!.contains(newStatus)) {
            throw IllegalStateException("Cannot transition from $oldStatus to $newStatus")
        }
    }
}
