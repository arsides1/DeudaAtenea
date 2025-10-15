import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { FacturaCompleto } from "./facturaCompleto";
import { Moneda } from "./moneda";
import { Holiday } from "./holiday";
import { Acreedor } from "./acreedor";
import { Cuponera } from "./cuponera";
import { TipoOC } from "./tipoOC";
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { HistoricoModificacion } from "./historicoModificacion";
import { OpcionesCombo } from "./opcionesCombo";

@Injectable({
    providedIn: 'root'
})
export class TesoreriaService {
    private socket: WebSocket;
    private apiServerUrl=environment.apiBaseUrl;

    public messages$: WebSocketSubject<string>;

    constructor(private http: HttpClient){
        try{
            this.messages$ = webSocket('ws://127.0.0.1:8765');
        }
        catch(e){
            console.log("Error conexión WS: " + e);
        }
    }

    public getListaCombo(codigo: number):Observable<OpcionesCombo[]>{
        return this.http.get<OpcionesCombo[]>(`${this.apiServerUrl}/Tesoreria/getListaCombo?codigo=${codigo}`);
    }

    public getListaMonedas(): Observable<Moneda[]>{
        return this.http.get<Moneda[]>(`${this.apiServerUrl}/Tesoreria/getListaMonedas`);
    }

    public postGuardarControlCambios(listModificationHistory: HistoricoModificacion[]){
        return this.http.post<Moneda[]>(`${this.apiServerUrl}/Tesoreria/postGuardarControlCambios`, listModificationHistory);
    }

    public postGuardarCO_Cuponera(objCO: FacturaCompleto, listCuponCO: Cuponera[], flgDesembolso: boolean){
        const body = {objCO: objCO, listCupon: listCuponCO, flgDesembolso: flgDesembolso}
        return this.http.post<any[]>(`${this.apiServerUrl}/Tesoreria/postGuardarCO_Cuponera`, body);
    }

    public postEditarOC(objCO: FacturaCompleto, listCuponCO: Cuponera[]){
        const body = {objCO: objCO, listCupon: listCuponCO}
        return this.http.post<any>(`${this.apiServerUrl}/Tesoreria/postEditarOC`, body);
    }

    public getCuponeraPorIntercompany(idOC: string){
        return this.http.get<Cuponera[]>(`${this.apiServerUrl}/Tesoreria/getCuponeraPorIntercompany?idOC=${idOC}`);
    }

    public getListaFeriados(): Observable<Holiday[]>{
        return this.http.get<Holiday[]>(`${this.apiServerUrl}/Tesoreria/getListaFeriados`);
    }

    public getListaAcreedor(): Observable<Array<Array<Acreedor>>>{
        return this.http.get<Array<Array<Acreedor>>>(`${this.apiServerUrl}/Tesoreria/getListaAcreedor`);
    }

    public getListaTipoOC(): Observable<TipoOC[]>{
        return this.http.get<TipoOC[]>(`${this.apiServerUrl}/Tesoreria/getListaTipoOC`);
    }

    public postEnvioCorreoJava(INPUTS){
        return this.http.post(`${this.apiServerUrl}/Tesoreria/invoke-flask-envio-correo`, INPUTS, {responseType:'text'});
    }

    public getListaIntercompanies(): Observable<FacturaCompleto[]>{
        return this.http.get<FacturaCompleto[]>(`${this.apiServerUrl}/Tesoreria/getListaIntercompanies`);
    }
}
