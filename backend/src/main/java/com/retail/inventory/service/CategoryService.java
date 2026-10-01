package com.retail.inventory.service;

import com.retail.inventory.model.Category;
import com.retail.inventory.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository repository;

    public List<Category> getAll() {
        return repository.findAll();
    }

    public Optional<Category> getById(Long id) {
        return repository.findById(id);
    }

    public Category create(Category entity) {
        return repository.save(entity);
    }

    public Category update(Long id, Category entityDetails) {
        Optional<Category> optional = repository.findById(id);
        if (optional.isPresent()) {
            Category existing = optional.get();
            existing.setName(entityDetails.getName());
            existing.setDescription(entityDetails.getDescription());
            return repository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
