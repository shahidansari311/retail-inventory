package com.retail.inventory.controller;

import com.retail.inventory.model.PurchaseOrder;
import com.retail.inventory.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService service;

    @GetMapping
    public List<PurchaseOrder> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Optional<PurchaseOrder> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public PurchaseOrder create(@RequestBody PurchaseOrder po) {
        return service.create(po);
    }

    @PutMapping("/{id}/status")
    public PurchaseOrder updateStatus(@PathVariable Long id, @RequestBody String status) {
        // Remove quotes if sent as JSON string
        status = status.replace("\"", "").trim();
        return service.updateStatus(id, status);
    }

    @PutMapping("/{id}")
    public PurchaseOrder update(@PathVariable Long id, @RequestBody PurchaseOrder details) {
        return service.update(id, details);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
