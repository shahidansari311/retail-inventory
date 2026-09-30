package com.retail.inventory.controller;

import com.retail.inventory.model.Inventory;
import com.retail.inventory.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService service;

    @GetMapping
    public List<Inventory> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<Inventory> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/warehouse/{warehouseId}")
    public List<Inventory> getByWarehouseId(@PathVariable Long warehouseId) {
        return service.getByWarehouseId(warehouseId);
    }

    @GetMapping("/low-stock")
    public List<Inventory> getLowStock() {
        return service.getLowStock();
    }

    @PostMapping
    public Inventory create(@RequestBody Inventory inventory) {
        return service.create(inventory);
    }

    @PutMapping("/{id}")
    public Inventory update(@PathVariable Long id, @RequestBody Inventory details) {
        return service.update(id, details);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
