package com.retail.inventory.service;

import com.retail.inventory.model.Product;
import com.retail.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    public List<Product> getAll() {
        return repository.findAll();
    }

    public List<Product> getByCategoryId(Long categoryId) {
        return repository.findByCategoryId(categoryId);
    }

    public List<Product> getBySupplierId(Long supplierId) {
        return repository.findBySupplierId(supplierId);
    }

    public List<Product> searchByName(String name) {
        return repository.findByNameContainingIgnoreCase(name);
    }

    public Optional<Product> getById(Long id) {
        return repository.findById(id);
    }

    public Product create(Product product) {
        return repository.save(product);
    }

    public Product update(Long id, Product productDetails) {
        Optional<Product> optional = repository.findById(id);
        if (optional.isPresent()) {
            Product existing = optional.get();
            existing.setName(productDetails.getName());
            existing.setSku(productDetails.getSku());
            existing.setDescription(productDetails.getDescription());
            existing.setPrice(productDetails.getPrice());
            existing.setCategory(productDetails.getCategory());
            existing.setSupplier(productDetails.getSupplier());
            return repository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
