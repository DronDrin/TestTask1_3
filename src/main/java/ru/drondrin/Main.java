package ru.drondrin;

import ru.drondrin.entity.Forecast;
import ru.drondrin.entity.Location;
import ru.drondrin.service.LocationService;
import ru.drondrin.service.ForecastService;

public class Main {
    public static final ConfigReader CONFIG = new ConfigReader("src/main/resources/config.properties");
    public static LocationService locationService;
    public static ForecastService forecastService;

    public static void main(String[] args) {
        locationService = new LocationService();
        forecastService = new ForecastService();

        var moscowLocation = new Location(55.75222, 37.61556);           // грамматика против кода: писать MoscowLoc... или moscowLoc..? =)
        var forecast = forecastService.getForecast(moscowLocation);
        System.out.println(forecast);
    }
}