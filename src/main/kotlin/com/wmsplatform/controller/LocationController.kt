package com.wmsplatform.controller

import com.wmsplatform.domain.model.WarehouseLocation
import com.wmsplatform.domain.model.LocationType
import com.wmsplatform.service.WarehouseLocationService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/locations")
class WarehouseLocationController(private val locationService: WarehouseLocationService) {

    @GetMapping
    fun getAllLocations(): ResponseEntity<List<WarehouseLocation>> {
        return ResponseEntity.ok(locationService.getAllLocations())
    }

    @GetMapping("/{id}")
    fun getLocationById(@PathVariable id: Long): ResponseEntity<WarehouseLocation> {
        return try {
            ResponseEntity.ok(locationService.getLocationById(id))
        } catch (e: NoSuchElementException) {
            ResponseEntity.notFound().build()
        }
    }

    @GetMapping("/available")
    fun getAvailableLocations(
        @RequestParam(required = false) type: LocationType?
    ): ResponseEntity<List<WarehouseLocation>> {
        return ResponseEntity.ok(
            if (type != null) locationService.getAvailableLocationsByType(type)
            else locationService.getAvailableLocations()
        )
    }

    @GetMapping("/type/{type}")
    fun getLocationsByType(@PathVariable type: LocationType): ResponseEntity<List<WarehouseLocation>> {
        return ResponseEntity.ok(locationService.getLocationsByType(type))
    }
}
