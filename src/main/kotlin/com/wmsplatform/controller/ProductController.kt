package com.wmsplatform.controller

import com.wmsplatform.domain.model.Product
import com.wmsplatform.service.ProductService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/products")
class ProductController(private val productService: ProductService) {

    @GetMapping
    fun getAllProducts(): ResponseEntity<List<Product>> {
        return ResponseEntity.ok(productService.getAllProducts())
    }

    @GetMapping("/{id}")
    fun getProductById(@PathVariable id: Long): ResponseEntity<Product> {
        return try {
            ResponseEntity.ok(productService.getProductById(id))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/sku/{sku}")
    fun getProductBySku(@PathVariable sku: String): ResponseEntity<Product> {
        return try {
            ResponseEntity.ok(productService.getProductBySku(sku))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/category/{category}")
    fun getProductsByCategory(@PathVariable category: String): ResponseEntity<List<Product>> {
        return ResponseEntity.ok(productService.getProductsByCategory(category))
    }

    @GetMapping("/low-stock")
    fun getLowStockProducts(): ResponseEntity<List<Product>> {
        return ResponseEntity.ok(productService.getLowStockProducts())
    }

    @PostMapping
    fun createProduct(@Valid @RequestBody product: Product): ResponseEntity<Product> {
        return try {
            ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(product))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.badRequest().build()
        }
    }

    @PutMapping("/{id}")
    fun updateProduct(
        @PathVariable id: Long,
        @Valid @RequestBody product: Product
    ): ResponseEntity<Product> {
        return try {
            ResponseEntity.ok(productService.updateProduct(id, product))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @PatchMapping("/{id}/stock")
    fun updateStock(
        @PathVariable id: Long,
        @RequestParam quantity: Int
    ): ResponseEntity<Product> {
        return try {
            if (quantity < 0) {
                return ResponseEntity.badRequest().build()
            }
            ResponseEntity.ok(productService.updateStock(id, quantity))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/{id}")
    fun deleteProduct(@PathVariable id: Long): ResponseEntity<Void> {
        return try {
            productService.deleteProduct(id)
            ResponseEntity.noContent().build()
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }
}
