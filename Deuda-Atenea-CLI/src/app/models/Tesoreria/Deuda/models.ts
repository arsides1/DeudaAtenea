// src/app/models/Tesoreria/Deuda/models.ts

/**
 * Modelo para el request de registro/edición de deuda
 */
export interface DebtRequest {
  // Campos de producto
  productClassId: string;
  productTypeId: string;
  productNameId?: number | null;
  productName?: string;

  // Fechas y tipos
  amortizationStartDate?: number | null;
  rateExpressionTypeId?: number | null;
  amortizationTypeId?: number | null;

  // Entidades principales
  subsidiaryDebtorId: number | null;
  creditorType: string;
  subsidiaryCreditorId: number | null;
  counterpartCreditorId: number | null;

  // Información del préstamo
  loanTypeId?: number | null;
  validityStartDate: number | null;
  disbursementDate: number | null;
  interestStartDate: number | null;
  maturityDate: number | null;

  // Información financiera
  currencyId: string;
  nominal: number | null;
  amortizationRate: number | null;
  amortizationStartPayment: number | null;
  periodsId: number | null;

  // Información de tasas
  rateClassificationId: number | null;
  fixedRatePercentage: number | null;
  referenceRate: string;
  rateAdjustment: number | null;
  applicableMargin: number | null;
  others: number | null;

  // Excepciones
  applyAmortizationException: boolean;
  amortizationExceptions: AmortizationExceptionRequest[];

  // Configuración adicional
  operationTrm: number | null;
  basisId: number | null;
  rateTypeId: string;
  amortizationMethodId: number | null;
  roundingTypeId: number | null;
  interestStructureId: number | null;

  // Campos descriptivos
  portfolio: string;
  project: string;
  assignment: string;
  internalReference: string;
  characteristics: string;

  // ========== CAMPOS ADICIONALES (TRM) ==========
  subsidiaryGuarantorId: number | null;
  merchant: string;
  valuationCategory: string;
  externalReference: string;
  structuringCost: number | null;

  // ========== NUEVOS CAMPOS TRM (2025-11-14) ==========
  financialProject?: string;
  netPresentValueCalc?: string;
  costAmount?: number | null;
  structuringCostCurrency?: string;
  // ========== FIN NUEVOS CAMPOS TRM ==========
  // ========== FIN CAMPOS ADICIONALES (TRM) ==========

  // Estado de la deuda
  debtStatus?: number;  // 0=INACTIVO, 1=ACTIVO, 2=PAGADO

  registeredBy: string;
  schedules: DebtScheduleBackend[];
}

/**
 * Modelo del cronograma como lo maneja el FRONTEND internamente
 * Este es el modelo que usa la aplicación Angular internamente
 */
export interface DebtScheduleRequest {
  seq?: number;
  periodDate?: number;
  paymentDate?: number;
  paymentNumber?: number;
  currency?: string;
  nominalOpening?: number;
  nominalClosing?: number;
  nominal?: number;
  prepayment?: number;
  amortizationPrinc?: number;
  interestPaid?: number;
  rate?: number;
  rateType?: string;
  referenceRate?: string;
  variableRateDate?: number | null;
  interestRate?: number;
  rateAdjustment?: number;
  applicableMargin?: number;
  fee?: number;
  finalGuarantor?: number | string;
  insurance?: number;
  provider?: string;
  acceptanceDate?: number | null;
  fees?: number;
  status?: number;  // 0=INACTIVO, 1=ACTIVO
  registeredBy?: string;
  paymentDisplayLabel?: string;

  // Campos de tipo de pago
  paymentTypeId?: number;  // 1=NORMAL, 2=PREPAGO_PARCIAL, 3=PREPAGO_TOTAL
  prepaymentDescription?: string | undefined;
  prepaymentDate?: number;
}

/**
 * Modelo del cronograma como lo espera el BACKEND Java (camelCase)
 * IMPORTANTE: El backend Java usa camelCase, NO snake_case
 */
export interface DebtScheduleBackend {
  paymentNumber: number | null;
  calculationDate: number | null;
  paymentDate: number | null;
  initialBalance: number | null;
  finalBalance: number | null;
  amortization: number | null;
  interest: number | null;
  interestRate: number | null;
  variableRateDate: number | null;
  appliedRate: number | null;
  rateAdjustment: number | null;
  applicableMargin: number | null;
  installment: number | null;
  finalGuarantor: string;
  rateType: string;
  referenceRate: string;
  provider: string;
  acceptanceDate: number | null;
  fees: number | null;
  insurance: number | null;
  status?: number;  // 0=INACTIVO, 1=ACTIVO
  registeredBy: string;
  paymentDisplayLabel: string | null;

  // Campos de tipo de pago
  paymentTypeId?: number;  // 1=NORMAL, 2=PREPAGO_PARCIAL, 3=PREPAGO_TOTAL
  prepaymentDescription?: string;
  prepaymentDate?: number;
}

/**
 * Modelo para la respuesta con ID y campos adicionales
 */
export interface DebtResponse extends Omit<DebtRequest, 'schedules'> {
  seleccionado: boolean;
  id: string;
  debtStatus: number;  // 0=INACTIVO, 1=ACTIVO, 2=PAGADO
  registrationDate: string;

  // Descripciones
  subsidiaryDebtorName?: string;
  subsidiaryCreditorName?: string;
  counterpartCreditorName?: string;
  productNameName?: string;
  currencyName?: string;
  loanTypeName?: string;
  periodsName?: string;
  rateClassificationName?: string;
  basisName?: string;
  rateTypeName?: string;
  amortizationMethodName?: string;
  roundingTypeName?: string;
  interestStructureName?: string;
  subsidiaryGuarantorName?: string;
  productClassName?: string;
  productTypeName?: string;

  // Datos de próxima cuota
  nextPaymentNumber?: number;
  nextPaymentDate?: number;
  nextInterestAmount?: number;
  nextInstallmentAmount?: number;
  nextAppliedRate?: number;

  schedules: DebtScheduleRequest[];
}

/**
 * Modelo para el detalle completo con cronograma
 */
export interface DebtDetail extends DebtResponse {
  schedules: DebtScheduleResponse[];
}

export interface DebtScheduleResponse extends DebtScheduleRequest {
  id: number;
  debtRegistryId: string;
  status: number;  // 0=INACTIVO, 1=ACTIVO
  registrationDate: string;
}

export interface DebtPageResponse {
  content: DebtResponse[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

/**
 * Modelo para respuestas de la API
 */
export interface DebtApiResponse {
  success: boolean;
  message: string;
  data: any;
  error?: string;
  code?: number;
  timestamp?: string;
}

/**
 * Modelo para las excepciones como las espera el backend
 */
export interface AmortizationExceptionRequest {
  cuotaExc: number | null;
  amortizationRate: number | null;
  resultado: number | null;
  registeredBy: string;
}

/**
 * Enumeraciones para tipos
 */
export enum TipoDeuda {
  BONOS_LOCALES = 1,
  DEUDA_BANCARIA_CORTO_PLAZO = 2,
  DEUDA_BANCARIA_LARGO_PLAZO = 3,
  ARRENDAMIENTO_NIIF16 = 4,
  BONO_GLOBAL = 5,
  OTRAS_OBLIGACIONES = 6
}

export enum MetodoAmortizacion {
  LINEAL = 1,
  FRANCES = 2,
  BULLET = 3,
  AMERICANO = 4
}

export enum TipoRedondeo {
  SIN_DECIMALES = 1,
  DOS_DECIMALES = 2,
  CUATRO_DECIMALES = 3
}

export enum Base {
  ACTUAL_ACTUAL = 1,
  ACTUAL_360 = 2,
  ACTUAL_365 = 3,
  BASE_30_360 = 4
}

export enum Periodicidad {
  MENSUAL = 1,
  BIMESTRAL = 2,
  TRIMESTRAL = 3,
  CUATRIMESTRAL = 4,
  SEMESTRAL = 6,
  ANUAL = 12
}

export enum ClasificacionTasa {
  FIJA = 1,
  VARIABLE = 2
}

export enum TipoAcreedor {
  SUBSIDIARY = 'SUBSIDIARY',
  COUNTERPART = 'COUNTERPART'
}

export enum DebtStatus {
  INACTIVO = 0,
  ACTIVO = 1,
  PAGADO = 2
}

export enum PaymentType {
  NORMAL = 1,
  PREPAGO_PARCIAL = 2,
  PREPAGO_TOTAL = 3
}

/**
 * Helper function para mapear del modelo frontend al backend
 */
export function mapScheduleToBackend(schedule: DebtScheduleRequest): DebtScheduleBackend {
  return {
    paymentNumber: schedule.paymentNumber ?? null,
    calculationDate: schedule.periodDate ?? null,
    paymentDate: schedule.paymentDate ?? null,
    initialBalance: schedule.nominalOpening ?? null,
    finalBalance: schedule.nominalClosing ?? null,
    amortization: schedule.amortizationPrinc ?? null,
    interest: schedule.interestPaid ?? null,
    interestRate: schedule.interestRate ?? schedule.rate ?? null,
    installment: schedule.fee ?? null,
    variableRateDate: schedule.variableRateDate || null,
    appliedRate: schedule.rate ?? null,
    rateAdjustment: schedule.rateAdjustment ?? null,
    applicableMargin: schedule.applicableMargin ?? null,
    finalGuarantor: String(schedule.finalGuarantor ?? ''),
    rateType: schedule.rateType ?? '',
    referenceRate: schedule.referenceRate ?? '',
    provider: schedule.provider ?? '',
    acceptanceDate: schedule.acceptanceDate ?? null,
    fees: schedule.fees ?? null,
    insurance: schedule.insurance ?? null,
    status: schedule.status ?? 1,
    registeredBy: schedule.registeredBy ?? '',
    paymentDisplayLabel: schedule.paymentDisplayLabel ?? '',
    paymentTypeId: schedule.paymentTypeId ?? 1,
    prepaymentDescription: schedule.prepaymentDescription,
    prepaymentDate: schedule.prepaymentDate
  };
}

/**
 * Helper function para mapear del backend al modelo frontend
 */
export function mapScheduleFromBackend(schedule: any): DebtScheduleRequest {
  return {
    seq: schedule.seq,
    periodDate: schedule.calculationDate,
    paymentDate: schedule.paymentDate,
    paymentNumber: schedule.paymentNumber,
    currency: schedule.currency,
    nominalOpening: schedule.initialBalance,
    nominalClosing: schedule.finalBalance,
    nominal: schedule.nominal,
    prepayment: schedule.prepayment || 0,
    amortizationPrinc: schedule.amortization,
    interestPaid: schedule.interest,
    rate: schedule.appliedRate,
    rateType: schedule.rateType,
    referenceRate: schedule.referenceRate || '',
    variableRateDate: schedule.variableRateDate,
    interestRate: schedule.interestRate,
    rateAdjustment: schedule.rateAdjustment,
    applicableMargin: schedule.applicableMargin,
    fee: schedule.installment,
    finalGuarantor: schedule.finalGuarantor,
    insurance: schedule.insurance || 0,
    provider: schedule.provider || '',
    acceptanceDate: schedule.acceptanceDate,
    fees: schedule.fees,
    status: schedule.status !== undefined ? schedule.status : 1,
    registeredBy: schedule.registeredBy,
    paymentDisplayLabel: schedule.paymentDisplayLabel,
    paymentTypeId: schedule.paymentTypeId ?? 1,
    prepaymentDescription: schedule.prepaymentDescription,
    prepaymentDate: schedule.prepaymentDate
  };
}

/**
 * Modelo para búsqueda de deudas con filtros
 */
export interface DebtSearchRequest {
  // Búsqueda por texto libre
  searchText?: string;

  // Filtros de texto
  productClassId?: string;
  productTypeId?: string;
  productNameId?: number;
  currencyId?: string;
  rateTypeId?: string;
  referenceRate?: string;
  portfolio?: string;
  project?: string;
  assignment?: string;
  internalReference?: string;

  // Filtros numéricos
  subsidiaryDebtorId?: number;
  subsidiaryCreditorId?: number;
  counterpartCreditorId?: number;
  loanTypeId?: number;
  periodsId?: number;
  rateClassificationId?: number;
  basisId?: number;
  amortizationMethodId?: number;
  roundingTypeId?: number;
  interestStructureId?: number;

  // ========== FILTROS TRM - EXISTENTES ==========
  subsidiaryGuarantorId?: number;
  merchant?: string;
  valuationCategory?: string;
  externalReference?: string;
  structuringCostMin?: number;
  structuringCostMax?: number;

  // ========== NUEVOS FILTROS TRM (2025-11-14) ==========
  financialProject?: string;
  netPresentValueCalc?: string;
  costAmountMin?: number;
  costAmountMax?: number;
  structuringCostCurrency?: string;
  // ========== FIN NUEVOS FILTROS TRM ==========
  // ========== FIN FILTROS TRM ==========

  // Rangos de fechas (formato YYYYMMDD como string)
  validityStartDateFrom?: string;
  validityStartDateTo?: string;
  disbursementDateFrom?: string;
  disbursementDateTo?: string;
  interestStartDateFrom?: string;
  interestStartDateTo?: string;
  maturityDateFrom?: string;
  maturityDateTo?: string;

  // Rangos numéricos
  nominalMin?: number;
  nominalMax?: number;
  amortizationRateMin?: number;
  amortizationRateMax?: number;
  operationTrmMin?: number;
  operationTrmMax?: number;
  rateAdjustmentMin?: number;
  rateAdjustmentMax?: number;
  applicableMarginMin?: number;
  applicableMarginMax?: number;

  // Estado y otros
  applyAmortizationException?: boolean;
  debtStatus?: number;  // 0=INACTIVO, 1=ACTIVO, 2=PAGADO
  registeredBy?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;

  // Paginación
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}
