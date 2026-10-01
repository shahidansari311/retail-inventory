package com.retail.inventory.service;

import com.retail.inventory.model.Supplier;
import com.retail.inventory.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository repository;

    public List<Supplier> getAll() {
        return repository.findAll();
    }

    public Optional<Supplier> getById(Long id) {
        return repository.findById(id);
    }

    public Supplier create(Supplier entity) {
        return repository.save(entity);
    }

    public Supplier update(Long id, Supplier entityDetails) {
        Optional<Supplier> optional = repository.findById(id);
        if (optional.isPresent()) {
            Supplier existing = optional.get();
            existing.setName(entityDetails.getName());
            existing.setContactEmail(entityDetails.getContactEmail());
            existing.setContactPhone(entityDetails.getContactPhone());
            existing.setAddress(entityDetails.getAddress());
            return repository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
