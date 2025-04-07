package com.wmsplatform.domain.repository

import com.wmsplatform.domain.model.Order
import com.wmsplatform.domain.model.OrderStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.Optional

@Repository
interface OrderRepository : JpaRepository<Order, Long> {
    fun findByOrderNumber(orderNumber: String): Optional<Order>

    fun findByCustomerId(customerId: Long): List<Order>

    fun findByStatus(status: OrderStatus): List<Order>

    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.createdAt >= :startDate")
    fun findByStatusAndCreatedAtAfter(status: OrderStatus, startDate: LocalDateTime): List<Order>

    @Query("SELECT o FROM Order o WHERE o.priorityLevel >= :minPriority ORDER BY o.priorityLevel DESC")
    fun findHighPriorityOrders(minPriority: Int): List<Order>
}
