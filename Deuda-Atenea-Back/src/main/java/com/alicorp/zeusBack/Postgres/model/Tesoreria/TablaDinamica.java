package com.alicorp.zeusBack.Postgres.model.Tesoreria;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class TablaDinamica {
    private final List<Map<String, Object>> filas;

    public TablaDinamica() {
        filas = new ArrayList<>();
    }

    public void agregarFila(Map<String, Object> fila) {
        filas.add(fila);
    }

    public List<Map<String, Object>> getFilas() {
        return filas;
    }
}
