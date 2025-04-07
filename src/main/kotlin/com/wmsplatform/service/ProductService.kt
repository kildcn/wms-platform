package com.wmsplatform.service

import com.wmsplatform.domain.model.Product
import com.wmsplatform.domain.repository.ProductRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class ProductService(private val productRepository: ProductRepository) {

    fun getProductById(id: Long): Product {
        return productRepository.findById(id)
            .orElseThrow { NoSuchElementException("Product not found with id: $id") }
    }

    fun getProductBySku(sku: String): Product {
        return productRepository.findBySku(sku)
            .orElseThrow { NoSuchElementException("Product not found with SKU: $sku") }
    }

    fun getAllProducts(): List<Product> {
        return productRepository.findAll()
    }

    fun getProductsByCategory(category: String): List<Product> {
        return productRepository.findByCategory(category)
    }

    fun getLowStockProducts(): List<Product> {
        return productRepository.findLowStockProducts()
    }

    @Transactional
    fun createProduct(product: Product): Product {
        // Check if product with the same SKU already exists
        if (productRepository.findBySku(product.sku).isPresent) {
            throw IllegalArgumentException("Product with SKU ${product.sku} already exists")
        }

        return productRepository.save(product)
    }

    @Transactional
    fun updateProduct(id: Long, product: Product): Product {
        val existingProduct = getProductById(id)

        // Create a new product object with updated values but preserve the ID
        val updatedProduct = product.copy(
            id = existingProduct.id,
            createdAt = existingProduct.createdAt,
            updatedAt = LocalDateTime.now()
        )

        return productRepository.save(updatedProduct)
    }

    @Transactional
    fun updateStock(id: Long, newQuantity: Int): Product {
        val product = getProductById(id)

        val updatedProduct = product.copy(
            stockQuantity = newQuantity,
            updatedAt = LocalDateTime.now()
        )

        return productRepository.save(updatedProduct)
    }

    @Transactional
    fun deleteProduct(id: Long) {
        if (!productRepository.existsById(id)) {
            throw NoSuchElementException("Product not found with id: $id")
        }

        productRepository.deleteById(id)
    }
}
