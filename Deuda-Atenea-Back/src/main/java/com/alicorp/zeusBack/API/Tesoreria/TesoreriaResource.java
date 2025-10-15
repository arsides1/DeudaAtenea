package com.alicorp.zeusBack.API.Tesoreria;

import com.alicorp.zeusBack.Postgres.model.Tesoreria.*;
import com.alicorp.zeusBack.Postgres.service.Tesoreria.TesoreriaService;
import com.alicorp.zeusBack.SQL.model.Tesoreria.Holiday;
import com.alicorp.zeusBack.SQL.service.Tesoreria.TesoreriaServiceSQL;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import org.springframework.web.client.RestTemplate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/Tesoreria")
@CrossOrigin(origins = "*") //@CrossOrigin(origins = "http://localhost:8080")
public class TesoreriaResource {
    private final String apiUrlFlask = "http://127.0.0.1:5000";
    private final TesoreriaService tesoreriaService;
    private final TesoreriaServiceSQL tesoreriaServiceSQL;
    @GetMapping("/getListaCombo")
    public List<OpcionesCombo> listaCombo(int codigo) throws Exception{
        List<OpcionesCombo> lista;
        lista = tesoreriaService.listaCombo(codigo);
        return lista;
    }

    @GetMapping("/getListaMonedas")
    public List<Moneda> listMonedas() throws Exception{
        List<Moneda> listMonedas;
        listMonedas = tesoreriaService.listaMonedas();
        return listMonedas;
    }

    @PostMapping("/postGuardarCO_Cuponera")
    public List<Map<String, Object>> guardarCO_Cuponera(@RequestBody CuponOC_FacturaCompleto oc_cupones) throws Exception{
        return tesoreriaService.guardarCO(oc_cupones.getObjCO(), oc_cupones.getListCupon(), oc_cupones.getFlgDesembolso());
    }

    @GetMapping("/getListaFeriados")
    public List<Holiday> listaFeriados() throws Exception{
        return tesoreriaServiceSQL.listaFeriados();
    }

    @GetMapping("/getListaAcreedor")
    public List<List<Acreedor>> listaAcreedor() throws Exception{
        return tesoreriaService.listaAcreedor();
    }

    @GetMapping("/getListaTipoOC")
    public List<TipoOC> listaTipoOC() throws Exception{
        return tesoreriaService.listaTipoOC();
    }

    @PostMapping("/invoke-flask-envio-correo")
    public String invokeFlaskApiEnvioCorreo(@RequestBody Object inputCorreo) {
        System.out.println("Se invocó al Envío de correos");
        RestTemplate restTemplate = new RestTemplate();
        String apiUrl = apiUrlFlask + "/api/envioCorreo"; // Cambia la URL según tu API Flask
        String response = restTemplate.postForObject(apiUrl, inputCorreo, String.class);
        return response;
    }

    @PostMapping("/postGuardarControlCambios")
    public void guardarControlCambios(@RequestBody List<ModificationHistory> listModificationHistory) throws Exception{
        tesoreriaService.guardarControlCambios(listModificationHistory);
    }

    @GetMapping("/getListaIntercompanies")
    public List<FacturaCompleto> listaIntercompanies() throws Exception{
        return tesoreriaService.listaIntercompanies();
    }

    @PostMapping("/postEditarOC")
    public List<Map<String, Object>> editarOC(@RequestBody CuponOC_FacturaCompleto oc_cupones) throws Exception{
        return tesoreriaService.editarOC(oc_cupones.getObjCO(), oc_cupones.getListCupon());
    }

    @GetMapping("/getCuponeraPorIntercompany")
    public List<CuponOC> listaCuponeraPorIntercompany(String idOC) throws Exception{
        return tesoreriaService.listaCuponeraPorIntercompany(idOC);
    }

}
