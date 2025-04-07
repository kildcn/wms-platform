package com.wmsplatform

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class WmsPlatformApplication

fun main(args: Array<String>) {
    runApplication<WmsPlatformApplication>(*args)
}
