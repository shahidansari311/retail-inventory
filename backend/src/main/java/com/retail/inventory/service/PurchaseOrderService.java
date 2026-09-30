package com.retail.inventory.service;

import com.retail.inventory.model.*;
import com.retail.inventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private StockMovementRepository stockMovementRepository;
    @Autowired
    private WarehouseRepository warehouseRepository;
    @Autowired
    private ProductRepository productRepository;

    public List<PurchaseOrder> getAll() {
        return purchaseOrderRepository.findAll();
    }

    public Optional<PurchaseOrder> getById(Long id) {
        return purchaseOrderRepository.findById(id);
    }

    @Transactional
    public PurchaseOrder create(PurchaseOrder po) {
        po.setOrderDate(LocalDateTime.now());
        po.setStatus("PENDING");
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        if (po.getItems() != null) {
            for (PurchaseOrderItem item : po.getItems()) {
                item.setPurchaseOrder(po);
                if (item.getUnitPrice() != null && item.getQuantity() != null) {
                    BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    totalAmount = totalAmount.add(itemTotal);
                }
            }
        }
        
        po.setTotalAmount(totalAmount);
        return purchaseOrderRepository.save(po);
    }

    @Transactional
    public PurchaseOrder updateStatus(Long id, String status) {
        Optional<PurchaseOrder> optional = purchaseOrderRepository.findById(id);
        if (optional.isPresent()) {
            PurchaseOrder po = optional.get();
            
            // If changing to RECEIVED, increase inventory
            if ("RECEIVED".equalsIgnoreCase(status) && !"RECEIVED".equalsIgnoreCase(po.getStatus())) {
                Warehouse warehouse = warehouseRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No warehouse found"));
                
                for (PurchaseOrderItem item : po.getItems()) {
                    Product product = item.getProduct();
                    
                    // Find or create inventory
                    Inventory inventory = inventoryRepository.findAll().stream()
                            .filter(inv -> inv.getProduct().getId().equals(product.getId()) && inv.getWarehouse().getId().equals(warehouse.getId()))
                            .findFirst()
                            .orElse(null);
                            
                    if (inventory == null) {
                        inventory = new Inventory();
                        inventory.setProduct(product);
                        inventory.setWarehouse(warehouse);
                        inventory.setQuantity(0);
                        inventory.setReorderLevel(10);
                    }
                    
                    inventory.setQuantity(inventory.getQuantity() + item.getQuantity());
                    inventoryRepository.save(inventory);
                    
                    // Create stock movement
                    StockMovement movement = new StockMovement();
                    movement.setProduct(product);
                    movement.setWarehouse(warehouse);
                    movement.setType("PURCHASE");
                    movement.setQuantity(item.getQuantity());
                    movement.setMovementDate(LocalDateTime.now());
                    stockMovementRepository.save(movement);
                }
            }
            
            po.setStatus(status);
            return purchaseOrderRepository.save(po);
        }
        return null;
    }

    public void delete(Long id) {
        purchaseOrderRepository.deleteById(id);
    }
}
