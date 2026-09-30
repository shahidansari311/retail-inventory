package com.retail.inventory;

import com.retail.inventory.model.Product;
import com.retail.inventory.model.User;
import com.retail.inventory.repository.ProductRepository;
import com.retail.inventory.repository.UserRepository;
import com.retail.inventory.service.ProductService;
import com.retail.inventory.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
class InventoryApplicationTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private UserService userService;

    @InjectMocks
    private ProductService productService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void contextLoads() {
        // Tests PostgreSQL connection implicitly by loading context
    }

    @Test
    void testCreateUser() {
        User user = new User();
        user.setName("John");
        user.setEmail("john@example.com");

        when(userRepository.save(any(User.class))).thenReturn(user);

        User created = userService.createUser(user);

        assertNotNull(created);
        assertEquals("John", created.getName());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testCreateProduct() {
        Product product = new Product();
        product.setName("Laptop");
        product.setPrice(new BigDecimal("1000"));

        when(productRepository.save(any(Product.class))).thenReturn(product);

        Product created = productService.create(product);

        assertNotNull(created);
        assertEquals("Laptop", created.getName());
        verify(productRepository, times(1)).save(product);
    }

    @Test
    void testGetUserById() {
        User user = new User();
        user.setId(1L);
        user.setName("Jane");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Optional<User> found = userService.getUserById(1L);

        assertNotNull(found.get());
        assertEquals("Jane", found.get().getName());
        verify(userRepository, times(1)).findById(1L);
    }
}
