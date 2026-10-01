package com.retail.inventory.controller;

import com.retail.inventory.model.StockMovement;
import com.retail.inventory.service.StockMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    @Autowired
    private StockMovementService service;

    @GetMapping
    public List<StockMovement> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<StockMovement> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/product/{productId}")
    public List<StockMovement> getByProductId(@PathVariable Long productId) {
        return service.getByProductId(productId);
    }

    @GetMapping("/warehouse/{warehouseId}")
    public List<StockMovement> getByWarehouseId(@PathVariable Long warehouseId) {
        return service.getByWarehouseId(warehouseId);
    }

    @PostMapping
    public StockMovement create(@RequestBody StockMovement movement) {
        return service.create(movement);
    }
}
