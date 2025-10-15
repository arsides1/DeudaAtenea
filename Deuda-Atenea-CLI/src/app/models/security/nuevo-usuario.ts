export class NuevoUsuario {
    id: number;
    nombre: string;
    nombreUsuario: string;
    email: string;
    password: string;
    estado: boolean;
    registradoPor: number;
    fechaRegistro: Date;
    roles: string[];
    sustentos: string[];
}
