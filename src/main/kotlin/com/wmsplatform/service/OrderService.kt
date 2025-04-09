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
import org.slf4j.LoggerFactory

@Service
class OrderService(
    private val orderRepository: OrderRepository,
    private val productRepository: ProductRepository,
    private val eventPublisher: ApplicationEventPublisher
) {

    private val logger = LoggerFactory.getLogger(OrderService::class.java)

    @Transactional(readOnly = true)
    fun getOrderById(id: Long): Order {
        logger.debug("Getting order by ID: {}", id)
        return orderRepository.findById(id)
            .orElseThrow { NoSuchElementException("Order not found with id: $id") }
    }

    @Transactional(readOnly = true)
    fun getOrderByNumber(orderNumber: String): Order {
        logger.debug("Getting order by number: {}", orderNumber)
        return orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow { NoSuchElementException("Order not found with number: $orderNumber") }
    }

    @Transactional(readOnly = true)
    fun getOrdersByCustomer(customerId: Long): List<Order> {
        logger.debug("Getting orders for customer: {}", customerId)
        return orderRepository.findByCustomerId(customerId)
    }

    @Transactional(readOnly = true)
    fun getOrdersByStatus(status: OrderStatus): List<Order> {
        logger.debug("Getting orders with status: {}", status)
        return orderRepository.findByStatus(status)
    }

    @Transactional(readOnly = true)
    fun getHighPriorityOrders(minPriority: Int = 5): List<Order> {
        logger.debug("Getting high priority orders (priority >= {})", minPriority)
        return orderRepository.findHighPriorityOrders(minPriority)
    }

    @Transactional
    fun createOrder(order: Order): Order {
        try {
            logger.info("Creating new order: {}", order.orderNumber)

            // Check if order number already exists
            logger.debug("Checking if order number already exists: {}", order.orderNumber)
            orderRepository.findByOrderNumber(order.orderNumber).ifPresent {
                logger.error("Order with number {} already exists", order.orderNumber)
                throw IllegalStateException("Order with number ${order.orderNumber} already exists")
            }

            // Check product availability for each item
            logger.debug("Order has {} items", order.items.size)

            // Ensure order has a status
            val orderToSave = if (order.status == OrderStatus.CREATED) {
                order
            } else {
                logger.debug("Setting default status CREATED for order")
                order.copy(status = OrderStatus.CREATED)
            }

            // For each item, verify product exists and set the order reference
            order.items.forEach { item ->
                if (item.quantity <= 0) {
                    throw IllegalArgumentException("Quantity must be greater than 0")
                }

                // Check product exists
                val productId = item.productId
                logger.debug("Checking product with ID: {}", productId)
                productRepository.findById(productId).orElseThrow {
                    NoSuchElementException("Product not found with id: $productId")
                }

                // Set order reference (this is crucial for the bidirectional relationship)
                item.order = orderToSave
            }

            // Save the order
            logger.debug("Saving order to database: {}", orderToSave)
            val savedOrder = orderRepository.save(orderToSave)
            logger.info("Order saved successfully with ID: {}", savedOrder.id)

            // Publish event
            if (savedOrder.id != null) {
                logger.debug("Publishing order created event")
                eventPublisher.publishEvent(OrderStatusChangedEvent(
                    this,
                    savedOrder.id,
                    null,
                    savedOrder.status
                ))
            }

            return savedOrder
        } catch (ex: Exception) {
            logger.error("Error creating order: {}", ex.message, ex)
            throw ex
        }
    }

    @Transactional
    fun updateOrderStatus(orderId: Long, newStatus: OrderStatus): Order {
        logger.info("Updating order status: orderId={}, newStatus={}", orderId, newStatus)

        val order = orderRepository.findById(orderId).orElseThrow {
            logger.error("Order not found with id: {}", orderId)
            NoSuchElementException("Order not found with id: $orderId")
        }

        // Don't update if status is the same
        if (order.status == newStatus) {
            logger.info("Order {} already has status {}, no update needed", orderId, newStatus)
            return order
        }

        // Validate the status transition
        try {
            validateStatusTransition(order.status, newStatus)
        } catch (ex: IllegalStateException) {
            logger.error("Invalid status transition from {} to {} for order {}",
                order.status, newStatus, orderId, ex)
            throw ex
        }

        val updatedOrder = order.copy(
            status = newStatus,
            updatedAt = LocalDateTime.now()
        )

        logger.debug("Saving updated order with new status")
        val savedOrder = orderRepository.save(updatedOrder)

        // Publish an event for the status change
        logger.debug("Publishing status change event")
        eventPublisher.publishEvent(OrderStatusChangedEvent(
            this,
            savedOrder.id!!,
            order.status,
            newStatus
        ))

        logger.info("Order status updated successfully: orderId={}, from={}, to={}",
            orderId, order.status, newStatus)
        return savedOrder
    }

    @Transactional
    fun cancelOrder(id: Long): Order {
        logger.info("Cancelling order with ID: {}", id)

        val order = getOrderById(id)

        // Only orders in certain statuses can be canceled
        if (order.status in listOf(OrderStatus.DELIVERED, OrderStatus.CANCELED)) {
            logger.error("Cannot cancel order {} that has already been {}", id, order.status)
            throw IllegalStateException("Cannot cancel order that has already been ${order.status}")
        }

        val oldStatus = order.status
        val updatedOrder = order.copy(
            status = OrderStatus.CANCELED,
            updatedAt = LocalDateTime.now()
        )

        logger.debug("Saving cancelled order")
        val savedOrder = orderRepository.save(updatedOrder)

        // Publish an event for the cancellation
        logger.debug("Publishing cancellation event")
        eventPublisher.publishEvent(OrderStatusChangedEvent(
            this,
            savedOrder.id!!,
            oldStatus,
            OrderStatus.CANCELED
        ))

        logger.info("Order {} successfully cancelled", id)
        return savedOrder
    }

    // Ensure validateStatusTransition allows the desired transition
    private fun validateStatusTransition(oldStatus: OrderStatus, newStatus: OrderStatus) {
        val validTransitions = mapOf(
            OrderStatus.CREATED to listOf(OrderStatus.PROCESSING, OrderStatus.CANCELED),
            OrderStatus.PROCESSING to listOf(OrderStatus.PICKING, OrderStatus.CANCELED),
            OrderStatus.PICKING to listOf(OrderStatus.PACKING, OrderStatus.CANCELED),
            OrderStatus.PACKING to listOf(OrderStatus.SHIPPED, OrderStatus.CANCELED),
            OrderStatus.SHIPPED to listOf(OrderStatus.DELIVERED, OrderStatus.CANCELED),
            OrderStatus.DELIVERED to emptyList(),
            OrderStatus.CANCELED to emptyList()
        )

        logger.debug("Validating status transition: oldStatus={}, newStatus={}", oldStatus, newStatus)

        if (newStatus !in (validTransitions[oldStatus] ?: emptyList())) {
            logger.error("Invalid status transition from {} to {}", oldStatus, newStatus)
            throw IllegalStateException("Invalid status transition from $oldStatus to $newStatus")
        }
    }
}
