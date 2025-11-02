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
