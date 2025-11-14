package com.alicorp.zeusBack.SQL.security.dto;
import java.io.*;
import java.sql.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Inserción masiva t465_factores
 * Se ejecuta directamente desde IntelliJ
 */
public class FactoresInserter {

    private static final String DB_URL = "jdbc:postgresql://localhost:5432/db_Treasury_Risk_2402025";
    private static final String DB_USER = "postgres";
    private static final String DB_PASSWORD = "admin";

    private static final String INSERT_SQL =
            "INSERT INTO public.t465_factores (" +
                    "t465_id, t465_factor, t465_indicador, t465_moneda_1, t465_moneda_2, " +
                    "t465_pais, t465_plazo, t465_ticket, t465_fecha, t465_spot, " +
                    "t465_file_name, t465_status) " +
                    "OVERRIDING SYSTEM VALUE VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    public static void main(String[] args) {
        String archivo = "t465_factores.sql";

        System.out.println("╔═══════════════════════════════════════════════╗");
        System.out.println("║   INSERCION MASIVA t465_factores             ║");
        System.out.println("║   Sistema Atenea - Alicorp                   ║");
        System.out.println("╚═══════════════════════════════════════════════╝");

        Connection conn = null;
        PreparedStatement pstmt = null;
        BufferedReader reader = null;

        int totalInsertado = 0;
        int batch = 0;
        long inicio = System.currentTimeMillis();

        try {
            // 1. Buscar el archivo en resources/scripts
            File file = findSqlFile(archivo);

            System.out.println("Archivo: " + file.getAbsolutePath());
            System.out.println("Base de datos: db_Treasury_Risk_2402025");
            System.out.println();

            // 2. Cargar driver
            Class.forName("org.postgresql.Driver");
            System.out.println("[1/5] ✓ Driver PostgreSQL cargado");

            // 3. Conectar
            conn = DriverManager.getConnection(
                    DB_URL + "?reWriteBatchedInserts=true",
                    DB_USER,
                    DB_PASSWORD
            );
            conn.setAutoCommit(false);
            System.out.println("[2/5] ✓ Conexion establecida");
            System.out.println("[3/5] ✓ Archivo encontrado: " + String.format("%,d", file.length()) + " bytes");

            // 4. Preparar statement
            pstmt = conn.prepareStatement(INSERT_SQL);
            reader = new BufferedReader(new FileReader(file));
            System.out.println("[4/5] ✓ Preparando insercion");

            // 5. Regex para parsear
            Pattern pattern = Pattern.compile(
                    "VALUES\\s*\\((\\d+),\\s*'([^']*)',\\s*'([^']*)',\\s*'([^']*)',\\s*" +
                            "'([^']*)',\\s*'([^']*)',\\s*([\\d.]+),\\s*'([^']*)',\\s*'([^']*)',\\s*" +
                            "([\\d.]+),\\s*'([^']*)',\\s*(true|false)\\)",
                    Pattern.CASE_INSENSITIVE
            );

            String linea;
            int errores = 0;

            System.out.println("[5/5] ✓ Procesando registros...\n");

            // 6. Procesar líneas
            while ((linea = reader.readLine()) != null) {
                linea = linea.trim();

                if (linea.isEmpty() || linea.startsWith("--") || !linea.contains("INSERT INTO")) {
                    continue;
                }

                Matcher matcher = pattern.matcher(linea);

                if (matcher.find()) {
                    try {
                        pstmt.setInt(1, Integer.parseInt(matcher.group(1)));
                        pstmt.setString(2, matcher.group(2));
                        pstmt.setString(3, matcher.group(3));
                        pstmt.setString(4, matcher.group(4));
                        pstmt.setString(5, matcher.group(5));
                        pstmt.setString(6, matcher.group(6));
                        pstmt.setDouble(7, Double.parseDouble(matcher.group(7)));
                        pstmt.setString(8, matcher.group(8));
                        pstmt.setString(9, matcher.group(9));
                        pstmt.setDouble(10, Double.parseDouble(matcher.group(10)));
                        pstmt.setString(11, matcher.group(11));
                        pstmt.setBoolean(12, "true".equals(matcher.group(12)));

                        pstmt.addBatch();
                        batch++;

                        if (batch % 1000 == 0) {
                            pstmt.executeBatch();
                            conn.commit();
                            totalInsertado += 1000;

                            long tiempo = (System.currentTimeMillis() - inicio) / 1000;
                            double velocidad = tiempo > 0 ? totalInsertado / (double) tiempo : 0;
                            double progreso = (totalInsertado / 25000.0) * 100;

                            System.out.printf("\r[%,6d/25,000] %.1f%% | %.0f reg/seg | %ds",
                                    totalInsertado, progreso, velocidad, tiempo);

                            pstmt.clearBatch();
                        }

                    } catch (Exception e) {
                        errores++;
                        if (errores <= 3) {
                            System.err.println("\nError: " + e.getMessage());
                        }
                    }
                }
            }

            // Ejecutar pendientes
            if (batch % 1000 != 0) {
                int[] results = pstmt.executeBatch();
                conn.commit();
                totalInsertado += results.length;
            }

            long fin = System.currentTimeMillis();
            double segundos = (fin - inicio) / 1000.0;

            System.out.println("\n\n╔═══════════════════════════════════════════════╗");
            System.out.println("║          INSERCION COMPLETADA                 ║");
            System.out.println("╚═══════════════════════════════════════════════╝");
            System.out.printf("Total insertado:  %,d registros%n", totalInsertado);
            System.out.printf("Tiempo total:     %.2f segundos%n", segundos);
            System.out.printf("Velocidad:        %.0f reg/seg%n", totalInsertado / segundos);
            System.out.printf("Errores:          %d%n", errores);
            System.out.println();

        } catch (ClassNotFoundException e) {
            System.err.println("\n✗ ERROR: Driver PostgreSQL no encontrado");

        } catch (SQLException e) {
            System.err.println("\n✗ ERROR DE BD: " + e.getMessage());
            if (conn != null) {
                try {
                    conn.rollback();
                    System.err.println("✗ Rollback ejecutado");
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }

        } catch (Exception e) {
            System.err.println("\n✗ ERROR: " + e.getMessage());
            e.printStackTrace();

        } finally {
            try {
                if (reader != null) reader.close();
                if (pstmt != null) pstmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                System.err.println("Error cerrando recursos: " + e.getMessage());
            }
        }
    }

    /**
     * Busca el archivo SQL en diferentes ubicaciones posibles
     */
    private static File findSqlFile(String nombreArchivo) throws FileNotFoundException {
        // Lista de ubicaciones donde buscar
        String[] posiblesRutas = {
                // 1. Directorio actual (working directory)
                nombreArchivo,

                // 2. En resources/scripts
                "src/main/resources/scripts/" + nombreArchivo,

                // 3. Ruta absoluta del proyecto
                "D:/Deuda_Atenea/Deuda-Atenea-Back/src/main/resources/scripts/" + nombreArchivo,

                // 4. Desde classpath (si está empaquetado)
                System.getProperty("user.dir") + "/src/main/resources/scripts/" + nombreArchivo
        };

        // Buscar en cada ubicación
        for (String ruta : posiblesRutas) {
            File file = new File(ruta);
            if (file.exists() && file.isFile()) {
                return file;
            }
        }

        // Si no se encuentra, mostrar dónde buscó
        System.err.println("\n✗ Archivo no encontrado en ninguna de estas ubicaciones:");
        for (String ruta : posiblesRutas) {
            System.err.println("  - " + new File(ruta).getAbsolutePath());
        }
        System.err.println("\nDirectorio de trabajo actual: " + System.getProperty("user.dir"));

        throw new FileNotFoundException("No se encontró: " + nombreArchivo);
    }
}