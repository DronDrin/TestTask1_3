package ru.drondrin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import ru.drondrin.entity.Location;

import java.net.HttpURLConnection;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import static ru.drondrin.Main.CONFIG;

public class LocationService {
    private final ObjectMapper jsonMapper = new ObjectMapper();

    @SneakyThrows
    public List<Location> getLocations(String query) {
        var connection = (HttpURLConnection) URI.create(getLocationApiUrl(query)).toURL().openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Accept", "application/json");
        var inputStream = connection.getInputStream();
        List<Location> locations = new ArrayList<>();
        jsonMapper.readTree(inputStream).get("results").elements().forEachRemaining(cityInfo ->
                locations.add(new Location(cityInfo.get("latitude").asDouble(), cityInfo.get("longitude").asDouble())));
        inputStream.close();
        connection.disconnect();
        return locations;
    }

    private static String getLocationApiUrl(String query) {
        return CONFIG.stringProperty("location-search-api").replaceAll("__QUERY__", query);
    }
}
