// src/app/models/Tesoreria/Deuda/models.ts

/**
 * Modelo para el request de registro/edición de deuda
 */
export interface DebtRequest {
  // Campos de producto
  productClassId: string;
  productTypeId: string;

  // Entidades principales
  subsidiaryDebtorId: number | null;
  creditorType: string;
  subsidiaryCreditorId: number | null;
  counterpartCreditorId: number | null;

  // Información del préstamo
  loanTypeId: number | null;
  validityStartDate: number | null;
  disbursementDate: number | null;
  interestStartDate: number | null;
  maturityDate: number | null;
  amortizationStartDate: number | null;

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
  rateExpressionTypeId: string;
  amortizationMethodId: number | null;
  amortizationTypeId: string;
  roundingTypeId: number | null;
  interestStructureId: number | null;

  // Campos descriptivos
  portfolio: string;
  project: string;
  assignment: string;
  internalReference: string;
  characteristics: string;

  // ========== CAMPOS ADICIONALES (TRM) - NUEVOS ==========
  subsidiaryGuarantorId: number | null;
  merchant: string;
  valuationCategory: string;
  externalReference: string;
  structuringCost: number | null;
  // ========== FIN CAMPOS ADICIONALES (TRM) ==========

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
  status?: boolean;
  registeredBy?: string;
  paymentDisplayLabel?: string;
  paymentTypeId?: number;
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
  registeredBy: string;
  paymentDisplayLabel: string | null;
}

/**
 * Modelo para la respuesta con ID y campos adicionales
 */
export interface DebtResponse extends Omit<DebtRequest, 'schedules'> {
  seleccionado: boolean;
  id: string;
  status: boolean;
  registrationDate: string;
  subsidiaryDebtorName?: string;
  subsidiaryCreditorName?: string;
  counterpartCreditorName?: string;
  loanTypeName?: string;
  periodsName?: string;
  rateClassificationName?: string;
  basisName?: string;
  rateTypeName?: string;
  amortizationMethodName?: string;
  roundingTypeName?: string;
  interestStructureName?: string;

  // ========== CAMPOS ADICIONALES (TRM) - NUEVOS ==========
  subsidiaryGuarantorName?: string;
  // ========== FIN CAMPOS ADICIONALES (TRM) ==========

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
  status: boolean;
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
// Enumeraciones
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
    registeredBy: schedule.registeredBy ?? '',
    paymentDisplayLabel: schedule.paymentDisplayLabel ?? ''
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
    status: schedule.status !== undefined ? schedule.status : true,
    registeredBy: schedule.registeredBy
  };
}

export interface DebtSearchRequest {
  // Búsqueda por texto libre
  searchText?: string;

  // Filtros de texto
  productClassId?: string;
  productTypeId?: string;
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

  // ========== FILTROS NUEVOS - CAMPOS ADICIONALES (TRM) ==========
  subsidiaryGuarantorId?: number;
  merchant?: string;
  valuationCategory?: string;
  externalReference?: string;
  structuringCostMin?: number;
  structuringCostMax?: number;
  // ========== FIN FILTROS NUEVOS ==========

  // Rangos de fechas (formato YYYYMMDD)
  validityStartDateFrom?: string;
  validityStartDateTo?: string;
  disbursementDateFrom?: string;
  disbursementDateTo?: string;
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
  status?: boolean;
  registeredBy?: string;
  registrationDateFrom?: string;
  registrationDateTo?: string;

  // Paginación
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}
