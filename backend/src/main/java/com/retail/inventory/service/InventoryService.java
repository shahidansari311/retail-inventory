package com.retail.inventory.service;

import com.retail.inventory.model.Inventory;
import com.retail.inventory.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository repository;

    public List<Inventory> getAll() {
        return repository.findAll();
    }

    public Optional<Inventory> getById(Long id) {
        return repository.findById(id);
    }

    public List<Inventory> getByWarehouseId(Long warehouseId) {
        return repository.findByWarehouseId(warehouseId);
    }

    public List<Inventory> getLowStock() {
        return repository.findLowStock();
    }

    public Inventory create(Inventory inventory) {
        return repository.save(inventory);
    }

    public Inventory update(Long id, Inventory details) {
        Optional<Inventory> optional = repository.findById(id);
        if (optional.isPresent()) {
            Inventory existing = optional.get();
            existing.setProduct(details.getProduct());
            existing.setWarehouse(details.getWarehouse());
            existing.setQuantity(details.getQuantity());
            existing.setReorderLevel(details.getReorderLevel());
            return repository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
