package com.alicorp.zeusBack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.concurrent.Executor;

@SpringBootApplication
@EnableAsync
public class ZeusBackApplication {

	@Bean(name = "asyncExecutor")
	public Executor asyncExecutor(){
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(3);
		executor.setMaxPoolSize(6);
		executor.setQueueCapacity(100);
		executor.setThreadNamePrefix("AsyncThread-");
		executor.initialize();
		return executor;
	}

	public static void main(String[] args) {
		SpringApplication.run(ZeusBackApplication.class, args);
	}

	//@Bean
	//public CorsFilter corsFilter() {
	//	CorsConfiguration corsConfiguration = new CorsConfiguration();
//		corsConfiguration.setAllowCredentials(true);
//		corsConfiguration.setAllowedOrigins(Arrays.asList("http://10.54.64.98:4200"));
//		//corsConfiguration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
//		corsConfiguration.setAllowedHeaders(Arrays.asList("Origin", "Access-Control-Allow-Origin", "Content-Type",
//				"Accept", "Authorization", "Origin, Accept", "X-Requested-With",
//				"Access-Control-Request-Method", "Access-Control-Request-Headers"));
//		corsConfiguration.setExposedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization",
//				"Access-Control-Allow-Origin", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"));
//		corsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//		UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
//		urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);
//		return new CorsFilter(urlBasedCorsConfigurationSource);
//	}
}


