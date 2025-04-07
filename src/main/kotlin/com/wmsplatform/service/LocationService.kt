package com.wmsplatform.service

import com.wmsplatform.domain.model.LocationType
import com.wmsplatform.domain.model.WarehouseLocation
import com.wmsplatform.domain.repository.WarehouseLocationRepository
import org.springframework.stereotype.Service

@Service
class WarehouseLocationService(private val locationRepository: WarehouseLocationRepository) {

    fun getAllLocations(): List<WarehouseLocation> {
        return locationRepository.findAll()
    }

    fun getLocationById(id: Long): WarehouseLocation {
        return locationRepository.findById(id)
            .orElseThrow { NoSuchElementException("Location not found with id: $id") }
    }

    fun getLocationsByType(type: LocationType): List<WarehouseLocation> {
        return locationRepository.findByType(type)
    }

    fun getAvailableLocations(): List<WarehouseLocation> {
        return locationRepository.findLocationsWithSpaceAvailable()
    }

    fun getAvailableLocationsByType(type: LocationType): List<WarehouseLocation> {
        return locationRepository.findAvailableLocations(type)
    }
}
