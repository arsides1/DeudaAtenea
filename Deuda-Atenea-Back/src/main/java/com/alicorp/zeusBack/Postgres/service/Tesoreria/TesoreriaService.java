package com.alicorp.zeusBack.Postgres.service.Tesoreria;

import com.alicorp.zeusBack.Postgres.model.Tesoreria.*;
import com.alicorp.zeusBack.Postgres.repo.Tesoreria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.sql.Array;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TesoreriaService {
    private final OpcionesComboRepo opcionesComboRepo;
    private final SubsidiariaRepo subsidiariaRepo;
    private final MonedaRepo monedaRepo;
    private final FacturaCompletoRepo facturaCompletoRepo;
    private final ContraparteRepo contraparteRepo;
    private final UsuarioRolRepo usuarioRolRepo;
    private final CuponOCRepo cuponOCRepo;
    private final TipoOCRepo tipoOCRepo;
    private final ModificationHistoryRepo modificationHistoryRepo;

    public List<OpcionesCombo> listaCombo(int codigo){
        List<OpcionesCombo> lista;
        lista = opcionesComboRepo.listaCombo(codigo);
        return lista;
    }

    public List<Moneda> listaMonedas(){
        return new ArrayList<>(monedaRepo.findAll(Sort.by(Sort.Direction.ASC, "t064Id")));
    }

    public List<List<Acreedor>> listaAcreedor(){
        List<Acreedor> listAcreedorSubsidiaria;
        listAcreedorSubsidiaria = subsidiariaRepo.findAll().stream()
                .filter(Subsidiaria::getT453Status)
                .map(e -> {
                    Acreedor auxAcreedor = new Acreedor();
                    auxAcreedor.setId(e.getT453Id());
                    auxAcreedor.setDescription(e.getT453DescriptionTreasury());
                    auxAcreedor.setCountry(e.getT453Country());
                    return  auxAcreedor;
                })
                .collect(Collectors.toList());
        List<Acreedor> listAcreedorContraparte;
        listAcreedorContraparte = contraparteRepo.findAll().stream()
                .filter(Contraparte::getT459_status)
                .map(e -> {
                    Acreedor auxAcreedor = new Acreedor();
                    auxAcreedor.setId(e.getT459_id());
                    auxAcreedor.setDescription(e.getT459_description());
                    auxAcreedor.setCountry(e.getT459_country());
                    return  auxAcreedor;
                })
                .collect(Collectors.toList());
        List<List<Acreedor>> listAcreedor = new ArrayList<>();
        listAcreedor.add(listAcreedorSubsidiaria);
        listAcreedor.add(listAcreedorContraparte);
        return  listAcreedor;
    }

    public List<Map<String, Object>> guardarCO(FacturaCompleto objOC, List<CuponOC> listCuponOC, Boolean flgDesembolso){
        //long nuevoID = facturaCompletoRepo.findAll().stream().filter(e -> e.getT454_id().startsWith(objOC.getT454_id())).count() + 1;
        List<String> listIDs = facturaCompletoRepo.findAll().stream().map(FacturaCompleto::getT454_id).filter(t454Id -> t454Id.startsWith(objOC.getT454_id())).collect(Collectors.toList());

        String regex = objOC.getT454_id() + "0*";

        int mayorID = listIDs.stream()
                .map(str -> Integer.parseInt(str.replaceAll(regex, "")))
                .max(Integer::compareTo)
                .orElse(Integer.MIN_VALUE);

        String idOC = objOC.getT454_id().concat(String.valueOf(mayorID + 1));
        objOC.setT454_id(idOC);
        facturaCompletoRepo.save(objOC);

        for (CuponOC objCupon: listCuponOC) {
            objCupon.setId_co(idOC);
            cuponOCRepo.save(objCupon);
        }

        List<Map<String, Object>> listaDeMapasOrdenados;
        listaDeMapasOrdenados = obtenerTablaCorreoRegistroINT_PRE(idOC);

        TablaDinamica tablaCompleta = new TablaDinamica();

        for (Map<String, Object> fila : listaDeMapasOrdenados) {
            tablaCompleta.agregarFila(fila);
        }

        List<String> roles = new ArrayList<>();
        roles.add("RegistroIntercompany;SaludoCuerpo");
        List<UsuarioRol> usuario = usuarioRolRepo.listaUsuariosPorRoles(roles);

        Map<String, Object> nuevaFila = new HashMap<>();
        nuevaFila.put("UsuarioSaludo", usuario);

        if (idOC.startsWith("INT")){
            Map<String, String> cuerpoCorreo = null;
            cuerpoCorreo = facturaCompletoRepo.cuerpoCorreoRegistroIntercompany(idOC, flgDesembolso);
            nuevaFila.put("CuerpoCabecera", cuerpoCorreo.get("01_Cabecera"));
            nuevaFila.put("CuerpoPie", cuerpoCorreo.get("02_Pie"));
            nuevaFila.put("DestinatariosCuerpo", cuerpoCorreo.get("03_Destinatarios"));
        }

        tablaCompleta.agregarFila(nuevaFila);

        return tablaCompleta.getFilas();
    }

    public List<Map<String, Object>> obtenerTablaCorreoRegistroINT_PRE(String idOC){
        List<Map<String, Object>> resultados = null;

        if (idOC.startsWith("PRE")){
            resultados = facturaCompletoRepo.tablaCorreoRegistroPrestamo(idOC);
        }
        else if (idOC.startsWith("INT")){
            resultados = facturaCompletoRepo.tablaCorreoRegistroIntercompany(idOC);
        }

        // Obtener todas las columnas presentes en los mapas
        Set<String> todasLasColumnas = new HashSet<>();
        assert resultados != null;
        for (Map<String, Object> mapa : resultados) {
            todasLasColumnas.addAll(mapa.keySet());
        }

        // Construir un orden ascendente de las columnas
        List<String> ordenColumnas = new ArrayList<>(todasLasColumnas);
        Collections.sort(ordenColumnas);

        // Crear un nuevo mapa para cada mapa existente con columnas ordenadas
        List<Map<String, Object>> listaDeMapasOrdenados = new ArrayList<>();
        for (Map<String, Object> mapa : resultados) {
            Map<String, Object> nuevoMapa = new LinkedHashMap<>();
            for (String columna : ordenColumnas) {
                if (mapa.containsKey(columna)) {
                    nuevoMapa.put(columna.substring(columna.indexOf("_") + 1), mapa.get(columna));
                }
            }
            listaDeMapasOrdenados.add(nuevoMapa);
        }
        return listaDeMapasOrdenados;
    }

    public List<TipoOC> listaTipoOC(){
        return tipoOCRepo.findAll().stream().filter(e -> e.getT445_status() && (Objects.equals(e.getT445_id(), "INTER") || Objects.equals(e.getT445_id(), "PREST"))).collect(Collectors.toList());
    }

    public void guardarControlCambios(List<ModificationHistory> listModificationHistory){
        ZoneId zoneId = ZoneId.of("America/Lima");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        LocalDateTime fechaHoraAtual = now.toLocalDateTime();
        listModificationHistory.forEach(obj -> obj.setT486_register_date(fechaHoraAtual));
        modificationHistoryRepo.saveAll(listModificationHistory);
    }

    public List<FacturaCompleto> listaIntercompanies(){
        return facturaCompletoRepo.findAll().stream().filter(e -> Objects.equals(e.getT454_id_type_co(), "INTER")).collect(Collectors.toList());
    }

    public List<CuponOC> listaCuponeraPorIntercompany(String id_co){
        return cuponOCRepo.findAll().stream().filter(e -> Objects.equals(e.getId_co(), id_co)).collect(Collectors.toList());
    }

    public List<Map<String, Object>> editarOC(FacturaCompleto objOC, List<CuponOC> listCuponOC){
        facturaCompletoRepo.save(objOC);
        cuponOCRepo.saveAll(listCuponOC);
        return obtenerTablaCorreoRegistroINT_PRE(objOC.getT454_id());
    }
}
