package com.alicorp.zeusBack.SQL.security.dto;

import java.io.*;
import java.sql.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Inserción masiva en t470_factor_config
 * Configuración de factores para el sistema Atenea
 */
public class FactorConfigInserter {

    private static final String DB_URL = "jdbc:postgresql://localhost:5432/db_Treasury_Risk_2402025";
    private static final String DB_USER = "postgres";
    private static final String DB_PASSWORD = "admin";

    // SQL para t470_factor_config (no necesita OVERRIDING porque usa DEFAULT nextval)
    private static final String INSERT_SQL =
            "INSERT INTO public.t470_factor_config (" +
                    "t470_id, t470_factor_type, t470_indicator, t470_currency_1, t470_currency_2, " +
                    "t470_country, t470_term, t470_ticket, t470_status) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    public static void main(String[] args) {
        String archivo = "t470_factor_config.sql";

        System.out.println("╔═══════════════════════════════════════════════╗");
        System.out.println("║   INSERCION MASIVA t470_factor_config        ║");
        System.out.println("║   Sistema Atenea - Alicorp                   ║");
        System.out.println("╚═══════════════════════════════════════════════╝");

        Connection conn = null;
        PreparedStatement pstmt = null;
        BufferedReader reader = null;

        int totalInsertado = 0;
        int batch = 0;
        long inicio = System.currentTimeMillis();

        try {
            // 1. Buscar archivo
            File file = findSqlFile(archivo);

            System.out.println("Archivo: " + file.getAbsolutePath());
            System.out.println("Base de datos: db_Treasury_Risk_2402025");
            System.out.println();

            // 2. Cargar driver
            Class.forName("org.postgresql.Driver");
            System.out.println("[1/5] ✓ Driver PostgreSQL cargado");

            // 3. Conectar con optimización para batch
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

            // 5. Regex para parsear INSERT de t470_factor_config
            Pattern pattern = Pattern.compile(
                    "VALUES\\s*\\((\\d+),\\s*'([^']*)',\\s*'([^']*)',\\s*'([^']*)',\\s*" +
                            "'([^']*)',\\s*'([^']*)',\\s*([\\d.]+),\\s*'([^']*)',\\s*(true|false)\\)",
                    Pattern.CASE_INSENSITIVE
            );

            String linea;
            int errores = 0;
            int lineNumber = 0;

            System.out.println("[5/5] ✓ Procesando registros...\n");

            // 6. Procesar líneas
            while ((linea = reader.readLine()) != null) {
                lineNumber++;
                linea = linea.trim();

                if (linea.isEmpty() || linea.startsWith("--") || !linea.contains("INSERT INTO")) {
                    continue;
                }

                Matcher matcher = pattern.matcher(linea);

                if (matcher.find()) {
                    try {
                        // Setear parámetros según t470_factor_config
                        pstmt.setInt(1, Integer.parseInt(matcher.group(1)));       // t470_id
                        pstmt.setString(2, matcher.group(2));                      // t470_factor_type
                        pstmt.setString(3, matcher.group(3));                      // t470_indicator
                        pstmt.setString(4, matcher.group(4));                      // t470_currency_1
                        pstmt.setString(5, matcher.group(5));                      // t470_currency_2
                        pstmt.setString(6, matcher.group(6));                      // t470_country
                        pstmt.setDouble(7, Double.parseDouble(matcher.group(7))); // t470_term
                        pstmt.setString(8, matcher.group(8));                      // t470_ticket
                        pstmt.setBoolean(9, "true".equals(matcher.group(9)));     // t470_status

                        pstmt.addBatch();
                        batch++;

                        // Ejecutar cada 1000 registros
                        if (batch % 1000 == 0) {
                            pstmt.executeBatch();
                            conn.commit();
                            totalInsertado += 1000;

                            long tiempo = (System.currentTimeMillis() - inicio) / 1000;
                            double velocidad = tiempo > 0 ? totalInsertado / (double) tiempo : 0;

                            System.out.printf("\r[%,7d] %.0f reg/seg | %ds transcurridos",
                                    totalInsertado, velocidad, tiempo);

                            pstmt.clearBatch();
                        }

                    } catch (Exception e) {
                        errores++;
                        if (errores <= 5) {
                            System.err.println("\nError en linea " + lineNumber + ": " + e.getMessage());
                        }
                        if (errores > 20) {
                            throw new RuntimeException("Demasiados errores, abortando");
                        }
                    }
                }
            }

            // Ejecutar registros pendientes
            if (batch % 1000 != 0) {
                int[] results = pstmt.executeBatch();
                conn.commit();
                totalInsertado += results.length;
            }

            long fin = System.currentTimeMillis();
            double segundos = (fin - inicio) / 1000.0;

            System.out.println("\n\n╔═══════════════════════════════════════════════╗");
            System.out.println("║       INSERCION COMPLETADA                    ║");
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
            e.printStackTrace();

            if (conn != null) {
                try {
                    conn.rollback();
                    System.err.println("✗ Rollback ejecutado - ningun registro insertado");
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
     * Busca el archivo SQL en diferentes ubicaciones
     */
    private static File findSqlFile(String nombreArchivo) throws FileNotFoundException {
        String[] posiblesRutas = {
                nombreArchivo,
                "src/main/resources/scripts/" + nombreArchivo,
                "D:/Deuda_Atenea/Deuda-Atenea-Back/src/main/resources/scripts/" + nombreArchivo,
                System.getProperty("user.dir") + "/src/main/resources/scripts/" + nombreArchivo
        };

        for (String ruta : posiblesRutas) {
            File file = new File(ruta);
            if (file.exists() && file.isFile()) {
                return file;
            }
        }

        System.err.println("\n✗ Archivo no encontrado en ninguna ubicacion:");
        for (String ruta : posiblesRutas) {
            System.err.println("  - " + new File(ruta).getAbsolutePath());
        }
        System.err.println("\nDirectorio actual: " + System.getProperty("user.dir"));

        throw new FileNotFoundException("No se encontro: " + nombreArchivo);
    }
}
