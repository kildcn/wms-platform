package com.wmsplatform.domain.repository

import com.wmsplatform.domain.model.Product
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface ProductRepository : JpaRepository<Product, Long> {
    fun findBySku(sku: String): Optional<Product>

    fun findByCategory(category: String): List<Product>

    @Query("SELECT p FROM Product p WHERE p.stockQuantity > 0")
    fun findAllInStock(): List<Product>

    @Query("SELECT p FROM Product p WHERE p.stockQuantity < 10")
    fun findLowStockProducts(): List<Product>
}
