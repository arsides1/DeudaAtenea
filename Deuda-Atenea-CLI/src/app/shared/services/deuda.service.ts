import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import {
  DebtApiResponse,
  DebtDetail,
  DebtPageResponse,
  DebtRequest,
  DebtSearchRequest
} from "../../models/Tesoreria/Deuda/models";

@Injectable({
  providedIn: 'root'
})
export class DeudaService {

  private socket: WebSocket;
  private apiServerUrl = environment.apiBaseUrl;
  public messages$: WebSocketSubject<string>;


    constructor(private http: HttpClient){
        try{
            this.messages$ = webSocket('ws://127.0.0.1:8765');
        }
        catch(e){
            console.log("Error conexión WS: " + e);
        }
    }

  // Listar todas las deudas con paginación
  public listarDeudas(page?: number, size?: number): Observable<DebtPageResponse> {
    let url = `${this.apiServerUrl}/Tesoreria/Deuda/listarDeudas`;
    if (page !== undefined && size !== undefined) {
      url += `?page=${page}&size=${size}`;
    }
    return this.http.get<DebtPageResponse>(url);
  }

  // Obtener deuda por ID con su cronograma
  public obtenerDeuda(deudaId: string): Observable<DebtDetail> {
    return this.http.get<DebtDetail>(`${this.apiServerUrl}/Tesoreria/Deuda/obtenerDeuda/${deudaId}`);
  }

  // Registrar nueva deuda
  public registrarDeuda(deuda: DebtRequest): Observable<DebtApiResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<DebtApiResponse>(`${this.apiServerUrl}/Tesoreria/Deuda/registrarDeuda`, deuda, { headers });
  }

  // Editar deuda existente
  public editarDeuda(deudaId: string, deuda: DebtRequest): Observable<DebtApiResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.put<DebtApiResponse>(`${this.apiServerUrl}/Tesoreria/Deuda/editarDeuda/${deudaId}`, deuda, { headers });
  }

  public buscarDeudas(searchRequest: DebtSearchRequest): Observable<DebtPageResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<DebtPageResponse>(
      `${this.apiServerUrl}/Tesoreria/Deuda/buscarDeudas`,
      searchRequest,
      { headers }
    );
  }

  /**
   * Búsqueda simple por texto
   */
  public buscarPorTexto(
    texto?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'registrationDate',
    sortDir: string = 'DESC'
  ): Observable<DebtPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (texto) {
      params = params.set('texto', texto);
    }

    return this.http.get<DebtPageResponse>(
      `${this.apiServerUrl}/Tesoreria/Deuda/buscarPorTexto`,
      { params }
    );
  }
}
