package com.retail.inventory.service;

import com.retail.inventory.model.StockMovement;
import com.retail.inventory.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StockMovementService {

    @Autowired
    private StockMovementRepository repository;

    public List<StockMovement> getAll() {
        return repository.findAll();
    }

    public Optional<StockMovement> getById(Long id) {
        return repository.findById(id);
    }

    public List<StockMovement> getByProductId(Long productId) {
        return repository.findByProductId(productId);
    }

    public List<StockMovement> getByWarehouseId(Long warehouseId) {
        return repository.findByWarehouseId(warehouseId);
    }

    public StockMovement create(StockMovement movement) {
        if (movement.getProduct() == null || movement.getProduct().getId() == null) {
            throw new RuntimeException("Please select a product for this stock movement.");
        }
        if (movement.getWarehouse() == null || movement.getWarehouse().getId() == null) {
            throw new RuntimeException("Please select a warehouse for this stock movement.");
        }
        if (movement.getQuantity() == null || movement.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be at least 1.");
        }
        if (movement.getType() == null || movement.getType().isBlank()) {
            movement.setType("IN");
        }
        if (movement.getMovementDate() == null) {
            movement.setMovementDate(LocalDateTime.now());
        }
        return repository.save(movement);
    }
}
