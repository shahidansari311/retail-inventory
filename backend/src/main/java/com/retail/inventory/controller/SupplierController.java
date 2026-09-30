package com.retail.inventory.controller;

import com.retail.inventory.model.Supplier;
import com.retail.inventory.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService service;

    @GetMapping
    public List<Supplier> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<Supplier> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Supplier create(@RequestBody Supplier entity) {
        return service.create(entity);
    }

    @PutMapping("/{id}")
    public Supplier update(@PathVariable Long id, @RequestBody Supplier entityDetails) {
        return service.update(id, entityDetails);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
