package com.retail.inventory.service;

import com.retail.inventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.math.BigDecimal;

@Service
public class DashboardService {

    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private SupplierRepository supplierRepository;
    @Autowired private WarehouseRepository warehouseRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private InventoryRepository inventoryRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", productRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("totalSuppliers", supplierRepository.count());
        stats.put("totalWarehouses", warehouseRepository.count());
        stats.put("totalCustomers", customerRepository.count());
        stats.put("totalOrders", orderRepository.count());
        
        long pendingOrders = orderRepository.findAll().stream()
                .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus()))
                .count();
        stats.put("pendingOrders", pendingOrders);
        
        stats.put("lowStockProducts", inventoryRepository.findLowStock().size());
        
        long totalInventoryQuantity = inventoryRepository.findAll().stream()
                .mapToLong(inv -> inv.getQuantity() != null ? inv.getQuantity() : 0)
                .sum();
        stats.put("totalInventoryQuantity", totalInventoryQuantity);
        
        return stats;
    }
}
