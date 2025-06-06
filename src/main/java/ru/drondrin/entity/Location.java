package ru.drondrin.entity;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public record Location(double lat, double lon, List<String> names) {
    public boolean isValid() {
        return lat <= 85 && lat >= -58;
    }

    public Location(double lat, double lon) {
        this(lat, lon, new ArrayList<>());
    }

    public static Location create(JsonNode cityInfo) {
        var latitude = cityInfo.get("latitude").asDouble();
        var longitude = cityInfo.get("longitude").asDouble();
        List<String> names = new ArrayList<>();
        extractNames(cityInfo, names, "name", "admin1", "admin2", "admin3", "admin4", "country");
        for (int i = 0; i < names.size(); i++) {
            for (int j = i + 1; j < names.size(); j++) {
                if (names.get(j).toLowerCase().contains(names.get(i).toLowerCase())) {
                    names.remove(i);
                    i--;
                    break;
                }
            }
        }
        return new Location(latitude, longitude, names);
    }

    private static void extractNames(JsonNode cityInfo, List<String> names, String... fields) {
        for (String field : fields) {
            var node = cityInfo.get(field);
            if (node != null)
                names.add(node.asText());
        }
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Location location)) return false;
        return Double.compare(lat, location.lat) == 0 && Double.compare(lon, location.lon) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(lat, lon);
    }
}
