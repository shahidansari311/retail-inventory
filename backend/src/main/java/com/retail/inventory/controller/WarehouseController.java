package com.retail.inventory.controller;

import com.retail.inventory.model.Warehouse;
import com.retail.inventory.service.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {

    @Autowired
    private WarehouseService service;

    @GetMapping
    public List<Warehouse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<Warehouse> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Warehouse create(@RequestBody Warehouse entity) {
        return service.create(entity);
    }

    @PutMapping("/{id}")
    public Warehouse update(@PathVariable Long id, @RequestBody Warehouse entityDetails) {
        return service.update(id, entityDetails);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
