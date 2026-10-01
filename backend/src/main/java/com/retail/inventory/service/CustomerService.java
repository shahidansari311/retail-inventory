package com.retail.inventory.service;

import com.retail.inventory.model.Customer;
import com.retail.inventory.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository repository;

    public List<Customer> getAll() {
        return repository.findAll();
    }

    public Optional<Customer> getById(Long id) {
        return repository.findById(id);
    }

    public Customer create(Customer entity) {
        return repository.save(entity);
    }

    public Customer update(Long id, Customer entityDetails) {
        Optional<Customer> optional = repository.findById(id);
        if (optional.isPresent()) {
            Customer existing = optional.get();
            existing.setName(entityDetails.getName());
            existing.setEmail(entityDetails.getEmail());
            existing.setPhone(entityDetails.getPhone());
            existing.setAddress(entityDetails.getAddress());
            return repository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
