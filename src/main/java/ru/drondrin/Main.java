package ru.drondrin;

import ru.drondrin.service.LocationService;

public class Main {
    public static final ConfigReader CONFIG = new ConfigReader("src/main/resources/config.properties");
    public static LocationService locationService;

    public static void main(String[] args) {
        locationService = new LocationService();
    }
}