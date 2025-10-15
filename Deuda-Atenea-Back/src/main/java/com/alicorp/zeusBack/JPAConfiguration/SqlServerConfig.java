
package com.alicorp.zeusBack.JPAConfiguration;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

@Configuration
@EnableJpaRepositories(
        basePackages = "com.alicorp.zeusBack.SQL",
        entityManagerFactoryRef = "sqlserverEntityManagerFactory",
        transactionManagerRef = "sqlserverTransactionManager"
)
public class SqlServerConfig {
    @Primary
    @Bean(name = "sqlserverDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.sqlserver")
    public DataSource sqlserverDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Primary
    @Bean(name = "sqlserverEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean sqlserverEntityManagerFactory(
            EntityManagerFactoryBuilder builder, @Qualifier("sqlserverDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages("com.alicorp.zeusBack.SQL")
                .persistenceUnit("sqlserver")
                .build();
    }
    @Primary
    @Bean(name = "sqlserverTransactionManager")
    public PlatformTransactionManager sqlserverTransactionManager(
            @Qualifier("sqlserverEntityManagerFactory") EntityManagerFactory sqlserverEntityManagerFactory) {
        return new JpaTransactionManager(sqlserverEntityManagerFactory);
    }
}
