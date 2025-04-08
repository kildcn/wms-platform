package com.wmsplatform.service

import com.wmsplatform.domain.model.Product
import com.wmsplatform.domain.repository.ProductRepository
import com.wmsplatform.domain.repository.InventoryRepository
import io.mockk.*
import io.mockk.impl.annotations.MockK
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

class ProductServiceTest {

    @MockK
    private lateinit var productRepository: ProductRepository

    private lateinit var productService: ProductService

    private val inventoryRepository: InventoryRepository = mockk()

    @BeforeEach
    fun setUp() {
        MockKAnnotations.init(this)
        productService = ProductService(productRepository, inventoryRepository)
    }

    @Test
    fun `getProductById returns product when found`() {
        // Arrange
        val productId = 1L
        val product = createSampleProduct(id = productId)
        every { productRepository.findById(productId) } returns Optional.of(product)

        // Act
        val result = productService.getProductById(productId)

        // Assert
        assertEquals(product, result)
        verify(exactly = 1) { productRepository.findById(productId) }
    }

    @Test
    fun `getProductById throws exception when product not found`() {
        // Arrange
        val productId = 1L
        every { productRepository.findById(productId) } returns Optional.empty()

        // Act & Assert
        val exception = assertThrows<NoSuchElementException> {
            productService.getProductById(productId)
        }

        assertEquals("Product not found with id: $productId", exception.message)
        verify(exactly = 1) { productRepository.findById(productId) }
    }

    @Test
    fun `getProductBySku returns product when found`() {
        // Arrange
        val sku = "SKU12345"
        val product = createSampleProduct(sku = sku)
        every { productRepository.findBySku(sku) } returns Optional.of(product)

        // Act
        val result = productService.getProductBySku(sku)

        // Assert
        assertEquals(product, result)
        verify(exactly = 1) { productRepository.findBySku(sku) }
    }

    @Test
    fun `getAllProducts returns all products`() {
        // Arrange
        val products = listOf(
            createSampleProduct(id = 1L, sku = "SKU1"),
            createSampleProduct(id = 2L, sku = "SKU2")
        )
        every { productRepository.findAll() } returns products

        // Act
        val result = productService.getAllProducts()

        // Assert
        assertEquals(products, result)
        verify(exactly = 1) { productRepository.findAll() }
    }

    @Test
    fun `createProduct saves product when SKU is unique`() {
        // Arrange
        val newProduct = createSampleProduct(id = null)
        val savedProduct = createSampleProduct(id = 1L)

        every { productRepository.findBySku(newProduct.sku) } returns Optional.empty()
        every { productRepository.save(newProduct) } returns savedProduct

        // Act
        val result = productService.createProduct(newProduct)

        // Assert
        assertEquals(savedProduct, result)
        verify(exactly = 1) { productRepository.findBySku(newProduct.sku) }
        verify(exactly = 1) { productRepository.save(newProduct) }
    }

    @Test
    fun `createProduct throws exception when SKU already exists`() {
        // Arrange
        val newProduct = createSampleProduct(id = null)
        val existingProduct = createSampleProduct(id = 1L, sku = newProduct.sku)

        every { productRepository.findBySku(newProduct.sku) } returns Optional.of(existingProduct)

        // Act & Assert
        val exception = assertThrows<IllegalArgumentException> {
            productService.createProduct(newProduct)
        }

        assertEquals("Product with SKU ${newProduct.sku} already exists", exception.message)
        verify(exactly = 1) { productRepository.findBySku(newProduct.sku) }
        verify(exactly = 0) { productRepository.save(any()) }
    }

    @Test
    fun `updateProduct updates existing product`() {
        // Arrange
        val productId = 1L
        val existingProduct = createSampleProduct(id = productId)
        val updatedProductData = createSampleProduct(
            id = null,
            name = "Updated Name",
            description = "Updated Description"
        )

        val expectedSavedProduct = updatedProductData.copy(
            id = productId,
            createdAt = existingProduct.createdAt,
            updatedAt = LocalDateTime.now()
        )

        every { productRepository.findById(productId) } returns Optional.of(existingProduct)
        every { productRepository.save(match { it.id == productId }) } returns expectedSavedProduct

        // Act
        val result = productService.updateProduct(productId, updatedProductData)

        // Assert
        assertEquals(productId, result.id)
        assertEquals(updatedProductData.name, result.name)
        assertEquals(updatedProductData.description, result.description)
        assertEquals(existingProduct.createdAt, result.createdAt)
        assertNotNull(result.updatedAt)

        verify(exactly = 1) { productRepository.findById(productId) }
        verify(exactly = 1) { productRepository.save(match { it.id == productId }) }
    }

    @Test
    fun `updateStock updates stock quantity for existing product`() {
        // Arrange
        val productId = 1L
        val existingProduct = createSampleProduct(id = productId, stockQuantity = 10)
        val newQuantity = 20

        val expectedSavedProduct = existingProduct.copy(
            stockQuantity = newQuantity,
            updatedAt = LocalDateTime.now()
        )

        every { productRepository.findById(productId) } returns Optional.of(existingProduct)
        every { productRepository.save(match { it.id == productId && it.stockQuantity == newQuantity }) } returns expectedSavedProduct

        // Act
        val result = productService.updateStock(productId, newQuantity)

        // Assert
        assertEquals(productId, result.id)
        assertEquals(newQuantity, result.stockQuantity)
        assertNotNull(result.updatedAt)

        verify(exactly = 1) { productRepository.findById(productId) }
        verify(exactly = 1) { productRepository.save(match { it.id == productId && it.stockQuantity == newQuantity }) }
    }

    @Test
    fun `deleteProduct deletes existing product`() {
        // Arrange
        val productId = 1L
        every { productRepository.existsById(productId) } returns true
        every { productRepository.deleteById(productId) } just runs

        // Act
        productService.deleteProduct(productId)

        // Assert
        verify(exactly = 1) { productRepository.existsById(productId) }
        verify(exactly = 1) { productRepository.deleteById(productId) }
    }

    @Test
    fun `deleteProduct throws exception when product not found`() {
        // Arrange
        val productId = 1L
        every { productRepository.existsById(productId) } returns false

        // Act & Assert
        val exception = assertThrows<NoSuchElementException> {
            productService.deleteProduct(productId)
        }

        assertEquals("Product not found with id: $productId", exception.message)
        verify(exactly = 1) { productRepository.existsById(productId) }
        verify(exactly = 0) { productRepository.deleteById(any()) }
    }

    // Helper method to create a sample product for testing
    private fun createSampleProduct(
        id: Long? = 1L,
        sku: String = "SKU12345",
        name: String = "Test Product",
        description: String = "Test Description",
        weight: BigDecimal = BigDecimal("1.5"),
        width: BigDecimal = BigDecimal("10.0"),
        height: BigDecimal = BigDecimal("5.0"),
        depth: BigDecimal = BigDecimal("7.0"),
        category: String = "General",
        stockQuantity: Int = 100,
        createdAt: LocalDateTime = LocalDateTime.now(),
        updatedAt: LocalDateTime? = null
    ): Product {
        return Product(
            id = id,
            sku = sku,
            name = name,
            description = description,
            weight = weight,
            width = width,
            height = height,
            depth = depth,
            category = category,
            stockQuantity = stockQuantity,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}
