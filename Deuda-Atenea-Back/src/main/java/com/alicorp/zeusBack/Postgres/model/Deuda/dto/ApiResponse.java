package com.alicorp.zeusBack.Postgres.model.Deuda.dto;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class ApiResponse {
    private String message;
    private Object data;
}
