package com.wmsplatform.event

import com.wmsplatform.domain.model.OrderStatus
import org.springframework.context.ApplicationEvent

/**
 * Event that gets published when an order's status changes
 */
class OrderStatusChangedEvent(
    source: Any,
    val orderId: Long,
    val oldStatus: OrderStatus?,
    val newStatus: OrderStatus
) : ApplicationEvent(source)
