package com.wmsplatform.domain.repository

import com.wmsplatform.domain.model.InventoryItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface InventoryRepository : JpaRepository<InventoryItem, Long> {
    fun findByProductId(productId: Long): List<InventoryItem>
}
