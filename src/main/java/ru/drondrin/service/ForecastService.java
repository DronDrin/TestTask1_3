package ru.drondrin.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import ru.drondrin.Main;
import ru.drondrin.cache.ForecastCache;
import ru.drondrin.entity.Forecast;
import ru.drondrin.entity.Location;

import java.net.HttpURLConnection;
import java.net.URI;
import java.util.Optional;

import static ru.drondrin.Main.CONFIG;

public class ForecastService {
    private final ForecastCache cache;

    public ForecastService() {
        cache = new ForecastCache(Main.CONFIG.intProperty("cache.forecast.lifetime"));
    }

    private final ObjectMapper jsonMapper = new ObjectMapper();

    @SneakyThrows
    public Forecast getForecast(Location location) {
        Optional<Forecast> cached = cache.tryGet(location.lat(), location.lon());
        if (cached.isPresent()) {
            return cached.get();
        }

        var connection = (HttpURLConnection) URI.create(getForecastApiUrl(location)).toURL().openConnection();
        connection.setRequestProperty("Accept", "application/json");
        var in = connection.getInputStream();
        var hourly = jsonMapper.readTree(in).get("hourly");
        Forecast forecast = Forecast.create(hourly.get("time").valueStream().map(JsonNode::asText).toList(),
                hourly.get("temperature_2m").valueStream().map(JsonNode::asDouble).toList());
        in.close();
        connection.disconnect();
        cache.save(location.lat(), location.lon(), forecast);
        return forecast;
    }

    private String getForecastApiUrl(Location location) {
        return CONFIG.stringProperty("forecast-api")
                .replaceAll("__LAT__", String.valueOf(location.lat()))
                .replaceAll("__LON__", String.valueOf(location.lon()));
    }
}
