export class DeudaPost {
    subsidiaryId!: number;
    creditorName!: string;
    loanTypeId!: number;
    startValidityDate!: string;
    disbursementDate!: string;
    interestStartDate!: string;
    maturityDate!: string;
    currencyId!: string;
    nominal!: number;
    amortizationRate!: number;
    firstAmortizationQuota!: number;
    periodicityId!: number;
    rateClassificationId!: number;
    referenceRate!: string;
    rateAdjustment!: number;
    applicableMargin!: number;
    percentage!: number;
    basisId!: number;
    nominalEffective!: string;
    operationTrm!: string;
    amortizationExcId!: number | null;
    variableRateDates!: string[];
}