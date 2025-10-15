export class PasswordHistorico{
    id: number;
    usuarioId: number;
    password: string;
    fechaCreacion: Date;
    fechaExpiracion: Date;
    status: boolean;
}