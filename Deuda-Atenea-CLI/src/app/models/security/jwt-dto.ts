import { HorizontalMenu } from "src/app/shared/services/horizontal-nav.service";

export class JwtDTO {
    token: string;
    type: string;
    nombreUsuario: string;
    authorities: string[];
    nombre: string;
    id: number;
    // menu: HorizontalMenu[];
}
