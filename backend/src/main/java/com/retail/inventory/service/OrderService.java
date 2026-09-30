package com.retail.inventory.service;

import com.retail.inventory.model.*;
import com.retail.inventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private StockMovementRepository stockMovementRepository;

    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    public Optional<Order> getById(Long id) {
        return orderRepository.findById(id);
    }

    @Transactional
    public Order createOrder(Order requestOrder) {
        Customer customer = customerRepository.findById(requestOrder.getCustomer().getId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItem item : requestOrder.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            
            // Check inventory (assuming single warehouse for simplicity, or getting first available)
            List<Inventory> inventories = inventoryRepository.findAll(); // Simplified for learning
            Inventory inventory = null;
            for (Inventory inv : inventories) {
                if (inv.getProduct().getId().equals(product.getId()) && inv.getQuantity() >= item.getQuantity()) {
                    inventory = inv;
                    break;
                }
            }

            if (inventory == null) {
                throw new RuntimeException("Insufficient inventory for product: " + product.getName());
            }

            // Decrease inventory
            inventory.setQuantity(inventory.getQuantity() - item.getQuantity());
            inventoryRepository.save(inventory);

            // Create stock movement
            StockMovement movement = new StockMovement();
            movement.setProduct(product);
            movement.setWarehouse(inventory.getWarehouse());
            movement.setType("SALE");
            movement.setQuantity(item.getQuantity());
            movement.setMovementDate(LocalDateTime.now());
            stockMovementRepository.save(movement);

            item.setOrder(order);
            item.setProduct(product);
            item.setUnitPrice(product.getPrice());
            
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setItems(requestOrder.getItems());
        order.setTotalAmount(totalAmount);
        
        return orderRepository.save(order);
    }

    public Order updateStatus(Long id, String status) {
        Optional<Order> optional = orderRepository.findById(id);
        if (optional.isPresent()) {
            Order order = optional.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }

    public void delete(Long id) {
        orderRepository.deleteById(id);
    }
}
