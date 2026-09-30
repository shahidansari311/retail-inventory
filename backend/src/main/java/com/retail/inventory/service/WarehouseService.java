package com.retail.inventory.service;

import com.retail.inventory.model.Warehouse;
import com.retail.inventory.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository repository;

    public List<Warehouse> getAll() {
        return repository.findAll();
    }

    public Optional<Warehouse> getById(Long id) {
        return repository.findById(id);
    }

    public Warehouse create(Warehouse entity) {
        return repository.save(entity);
    }

    public Warehouse update(Long id, Warehouse entityDetails) {
        Optional<Warehouse> optional = repository.findById(id);
        if (optional.isPresent()) {
            Warehouse existing = optional.get();
            // TODO: Update fields
            return repository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
