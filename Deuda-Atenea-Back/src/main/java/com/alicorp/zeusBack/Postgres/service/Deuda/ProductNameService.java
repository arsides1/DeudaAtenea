package com.alicorp.zeusBack.Postgres.service.Deuda;

import com.alicorp.zeusBack.Postgres.model.Deuda.ProductName;
import com.alicorp.zeusBack.Postgres.repo.Deuda.ProductNameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductNameService {

    private final ProductNameRepository productNameRepository;

    /**
     * Busca o crea un nombre de producto
     * Si el nombre no existe, lo crea automáticamente con el tipo de producto asociado
     */
    @Transactional
    public Integer findOrCreateProductName(String productNameDescription, Integer productTypeId) {
        // Buscar si ya existe el nombre de producto para ese tipo
        ProductName existingProduct = productNameRepository
                .findByDescriptionAndProductTypeId(productNameDescription, productTypeId);

        if (existingProduct != null) {
            log.info("Nombre de producto existente encontrado: {} con ID: {}",
                    productNameDescription, existingProduct.getId());
            return existingProduct.getId();
        }

        // Si no existe, crear uno nuevo
        log.info("Creando nuevo nombre de producto: {} para tipo: {}",
                productNameDescription, productTypeId);

        ProductName newProductName = new ProductName();
        newProductName.setDescription(productNameDescription);
        newProductName.setProductTypeId(productTypeId);
        newProductName.setStatus(true);

        // Generar un código único si es necesario
        String code = generateProductCode(productNameDescription, productTypeId);
        newProductName.setCode(code);

        ProductName savedProduct = productNameRepository.save(newProductName);

        log.info("Nuevo nombre de producto creado con ID: {}", savedProduct.getId());
        return savedProduct.getId();
    }

    /**
     * Genera un código único para el producto
     * Ejemplo: Para "Senior Note 2027" -> "SN2027"
     */
    private String generateProductCode(String description, Integer productTypeId) {
        // Lógica simple para generar código
        String[] words = description.split(" ");
        StringBuilder code = new StringBuilder();

        // Tomar las primeras letras de cada palabra
        for (String word : words) {
            if (!word.isEmpty()) {
                // Si la palabra es un año, tomarlo completo
                if (word.matches("\\d{4}")) {
                    code.append(word);
                } else {
                    code.append(word.charAt(0));
                }
            }
        }

        // Si el código está vacío o es muy corto, usar el ID del tipo
        if (code.length() < 2) {
            code.append("PROD").append(productTypeId);
        }

        return code.toString().toUpperCase();
    }
}