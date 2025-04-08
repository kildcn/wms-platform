package com.wmsplatform.dto

import com.wmsplatform.domain.model.Product
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDateTime

data class ProductCreateDto(
    @field:NotBlank(message = "SKU is required")
    @field:Size(min = 3, max = 50, message = "SKU must be between 3 and 50 characters")
    val sku: String,

    @field:NotBlank(message = "Name is required")
    @field:Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    val name: String,

    @field:Size(max = 1000, message = "Description cannot exceed 1000 characters")
    val description: String? = null,

    @field:NotNull(message = "Weight is required")
    @field:DecimalMin(value = "0.01", message = "Weight must be greater than 0")
    val weight: BigDecimal,

    @field:NotNull(message = "Width is required")
    @field:DecimalMin(value = "0.01", message = "Width must be greater than 0")
    val width: BigDecimal,

    @field:NotNull(message = "Height is required")
    @field:DecimalMin(value = "0.01", message = "Height must be greater than 0")
    val height: BigDecimal,

    @field:NotNull(message = "Depth is required")
    @field:DecimalMin(value = "0.01", message = "Depth must be greater than 0")
    val depth: BigDecimal,

    @field:NotBlank(message = "Category is required")
    val category: String,

    @field:Min(value = 0, message = "Stock quantity cannot be negative")
    val stockQuantity: Int = 0
) {
    // Convert DTO to domain model
    fun toProduct(): Product {
        return Product(
            id = null,
            sku = sku,
            name = name,
            description = description,
            weight = weight,
            width = width,
            height = height,
            depth = depth,
            category = category,
            stockQuantity = stockQuantity
        )
    }
}

data class ProductUpdateDto(
    @field:NotBlank(message = "Name is required")
    @field:Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    val name: String,

    @field:Size(max = 1000, message = "Description cannot exceed 1000 characters")
    val description: String? = null,

    @field:NotNull(message = "Weight is required")
    @field:DecimalMin(value = "0.01", message = "Weight must be greater than 0")
    val weight: BigDecimal,

    @field:NotNull(message = "Width is required")
    @field:DecimalMin(value = "0.01", message = "Width must be greater than 0")
    val width: BigDecimal,

    @field:NotNull(message = "Height is required")
    @field:DecimalMin(value = "0.01", message = "Height must be greater than 0")
    val height: BigDecimal,

    @field:NotNull(message = "Depth is required")
    @field:DecimalMin(value = "0.01", message = "Depth must be greater than 0")
    val depth: BigDecimal,

    @field:NotBlank(message = "Category is required")
    val category: String
) {
    // Convert DTO to domain model (preserving the ID and other fields)
    fun toProduct(existingProduct: Product): Product {
        return existingProduct.copy(
            name = name,
            description = description,
            weight = weight,
            width = width,
            height = height,
            depth = depth,
            category = category,
            updatedAt = LocalDateTime.now()
        )
    }
}

data class ProductResponseDto(
    val id: Long,
    val sku: String,
    val name: String,
    val description: String?,
    val weight: BigDecimal,
    val width: BigDecimal,
    val height: BigDecimal,
    val depth: BigDecimal,
    val category: String,
    val stockQuantity: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime?
) {
    companion object {
        // Convert domain model to DTO
        fun fromProduct(product: Product): ProductResponseDto {
            return ProductResponseDto(
                id = product.id!!,
                sku = product.sku,
                name = product.name,
                description = product.description,
                weight = product.weight,
                width = product.width,
                height = product.height,
                depth = product.depth,
                category = product.category,
                stockQuantity = product.stockQuantity,
                createdAt = product.createdAt,
                updatedAt = product.updatedAt
            )
        }
    }
}

data class ProductSummaryDto(
    val id: Long,
    val sku: String,
    val name: String,
    val category: String,
    val stockQuantity: Int
) {
    companion object {
        // Convert domain model to summary DTO
        fun fromProduct(product: Product): ProductSummaryDto {
            return ProductSummaryDto(
                id = product.id!!,
                sku = product.sku,
                name = product.name,
                category = product.category,
                stockQuantity = product.stockQuantity
            )
        }
    }
}

data class ProductDto(
    val id: Long?,
    val sku: String,
    val name: String,
    val description: String,
    val weight: Double,
    val width: Double,
    val height: Double,
    val depth: Double,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime?,
    val category: String,
    val stockQuantity: Int
)
