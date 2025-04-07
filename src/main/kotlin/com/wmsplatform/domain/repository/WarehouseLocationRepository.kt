package com.wmsplatform.domain.repository

import com.wmsplatform.domain.model.LocationType
import com.wmsplatform.domain.model.WarehouseLocation
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface WarehouseLocationRepository : JpaRepository<WarehouseLocation, Long> {
    fun findByAisleAndRackAndShelfAndBin(aisle: String, rack: String, shelf: String, bin: String): WarehouseLocation?

    fun findByType(type: LocationType): List<WarehouseLocation>

    @Query("SELECT wl FROM WarehouseLocation wl WHERE wl.isOccupied = false AND wl.type = :type")
    fun findAvailableLocations(type: LocationType): List<WarehouseLocation>

    @Query("SELECT wl FROM WarehouseLocation wl WHERE wl.currentWeight < wl.maxWeight * 0.9")
    fun findLocationsWithSpaceAvailable(): List<WarehouseLocation>
}
