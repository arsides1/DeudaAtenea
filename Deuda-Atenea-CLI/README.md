# Deuda-Atenea-CLI

# 📘 Registro de Cambios – DEUDA ATENEA

Este documento detalla los cambios realizados en el módulo de cálculo de cuotas y fechas de amortización, organizados cronológicamente.

---

## 🗓️ 01/11/2025

### ✅ Función `registro-deuda.html`, `registro-deuda.ts`
- Se realizó el ordenamiento de campos consecutivos: `fecha de desembolso, fecha inicio de pago de interes, fecha de vencimiento, periodicidad de pagos, # cuota de inicio de amortizacion, fecha inicio de amortizacion`.
- Se adiciono `MAT_DATE_FORMATS` para el formato de fecha dd/MM/yyyy en los datepicker

- Se agregó validación para evitar que fechas `null` o inválidas se conviertan en `19691231`.
- Se modificó el retorno a `string | null` para mayor seguridad.

### ✅ Construcción de `searchRequest`
- Se adaptó para convertir `null` a `undefined` usando `?? undefined`, cumpliendo con el tipo `string | undefined`.

---

## 🗓️ 06/11/2025
### ✅ `bono.html`, `bono.ts`
- Se adiciono en HTML columna check para seleccion
- Se adiciono en HTML boton de "Eliminar"
- Se agrego estilo para pintar la fila al ser seleccionada con el check.
- Se agrego en TS metodo para seleccionar todas las filas

### ✅ `registro-deuda.html`, `registro-deuda.ts`
- Se quito la obligatoriedad en HTML y TS a los campos adicionales (Operation TMR, Basis, Tasa Nominal/Efectiva, Forma de aortizacion, tipo de redondeo y periodicidad)
- Se adiciono en TS la condicion para BULLET, los campos  Fecha Inicio Amortizacion, Tasa de Amortizacion seran no visibles cuando se seleccione BULLET en Tipo de Amortizacion

## 🗓️ 09/11/2025
### ✅ `registro-deuda.html`, `registro-deuda.ts`
- Modificacion de HTML de prepago con campo necesarios para el recalculo.
- Modificacion de TS para realizar los calculos del los datos para el prepago.
