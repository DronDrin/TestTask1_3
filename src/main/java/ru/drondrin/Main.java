package ru.drondrin;

import org.apache.catalina.LifecycleException;
import org.apache.catalina.startup.Tomcat;
import ru.drondrin.service.LocationService;
import ru.drondrin.service.ForecastService;

import java.io.File;

public class Main {
    public static final ConfigReader CONFIG = new ConfigReader("src/main/resources/config.properties");
    public static LocationService locationService;
    public static ForecastService forecastService;

    public static void main(String[] args) {
        locationService = new LocationService();
        forecastService = new ForecastService();

        var tomcat = new Tomcat();
        tomcat.setPort(CONFIG.intProperty("server.port"));
        tomcat.getConnector().setPort(CONFIG.intProperty("server.port"));
        tomcat.addWebapp("", new File("src/main/resources/").getAbsolutePath());

        try {
            tomcat.init();
            tomcat.start();
            System.out.println("Tomcat running.");
            tomcat.getServer().await();
        } catch (LifecycleException e) {
            System.err.println("Tomcat failed to initialize.");
            System.err.println(e.getMessage());
        }
    }
}