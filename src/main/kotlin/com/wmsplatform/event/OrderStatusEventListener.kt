package com.wmsplatform.event

import com.wmsplatform.domain.model.OrderStatus
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Component

/**
 * Listens to order status change events and performs necessary actions
 */
@Component
class OrderStatusEventListener(
    private val kafkaTemplate: KafkaTemplate<String, String>
) {
    private val logger = LoggerFactory.getLogger(OrderStatusEventListener::class.java)

    @EventListener
    fun handleOrderStatusChange(event: OrderStatusChangedEvent) {
        logger.info("Order ${event.orderId} status changed from ${event.oldStatus} to ${event.newStatus}")

        // Perform different actions based on the new status
        when (event.newStatus) {
            OrderStatus.PROCESSING -> {
                // Notify warehouse staff
                logger.info("Notifying warehouse staff about new order ${event.orderId}")
                kafkaTemplate.send("wms-notifications", "warehouse-staff",
                    "New order ${event.orderId} ready for processing")
            }

            OrderStatus.PICKING -> {
                // Allocate inventory and generate picking list
                logger.info("Order ${event.orderId} moved to picking status")
                kafkaTemplate.send("wms-operations", "inventory-allocation",
                    "Allocate inventory for order ${event.orderId}")
            }

            OrderStatus.PACKING -> {
                // Notify packing station
                logger.info("Order ${event.orderId} ready for packing")
                kafkaTemplate.send("wms-operations", "packing-station",
                    "Order ${event.orderId} ready for packing")
            }

            OrderStatus.SHIPPED -> {
                // Update inventory counts and notify customer
                logger.info("Order ${event.orderId} has been shipped")
                kafkaTemplate.send("wms-external", "customer-notifications",
                    "Order ${event.orderId} has been shipped")
            }

            OrderStatus.DELIVERED -> {
                // Close the order lifecycle
                logger.info("Order ${event.orderId} has been delivered")
                kafkaTemplate.send("wms-analytics", "completed-orders",
                    "Order ${event.orderId} completed successfully")
            }

            OrderStatus.CANCELED -> {
                // Return any allocated inventory
                logger.info("Order ${event.orderId} has been canceled")
                kafkaTemplate.send("wms-operations", "inventory-release",
                    "Release inventory for canceled order ${event.orderId}")
            }

            else -> {
                logger.info("No specific action for status change to ${event.newStatus} for order ${event.orderId}")
            }
        }
    }
}
