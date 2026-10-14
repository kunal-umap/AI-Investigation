package com.company.opsinvestigator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

import java.util.TimeZone;

@SpringBootApplication
@ConfigurationPropertiesScan
public class OpsInvestigatorApplication {

    public static void main(String[] args) {
        // Enforce UTC timezone globally across entire runtime
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(OpsInvestigatorApplication.class, args);
    }
}
