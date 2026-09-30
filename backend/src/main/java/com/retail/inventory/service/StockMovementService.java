package com.retail.inventory.service;

import com.retail.inventory.model.StockMovement;
import com.retail.inventory.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
