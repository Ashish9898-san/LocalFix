package com.localfix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * LocalFixApplication
 *
 * This is the entry-point class for the entire Spring Boot backend application.
 *
 * Concepts Explained:
 * 1. @SpringBootApplication: A composite annotation that combines three key annotations:
 *    - @Configuration: Marks this class as a source of bean definitions for the application context.
 *    - @EnableAutoConfiguration: Tells Spring Boot to automatically configure dependencies based
 *      on the JARs found on the classpath (e.g. setting up an embedded Tomcat server for Spring Web).
 *    - @ComponentScan: Tells Spring to scan this package ('com.localfix') and all of its sub-packages
 *      (like 'controller', 'service', 'repository') for components, controllers, and services.
 *
 * 2. main() method: The standard Java entry point required by the JVM to launch any Java program.
 *
 * 3. SpringApplication.run(): Bootstraps the application by creating the Spring ApplicationContext,
 *    performing classpath scanning, and starting the embedded Apache Tomcat web server on port 8080.
 */
@SpringBootApplication
public class LocalFixApplication {

    public static void main(String[] args) {
        SpringApplication.run(LocalFixApplication.class, args);
    }

}
