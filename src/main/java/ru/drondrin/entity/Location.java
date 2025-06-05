package ru.drondrin.entity;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

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
}
