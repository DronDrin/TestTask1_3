package ru.drondrin.entity;

public record Location(double lat, double lon) {
    public boolean isValid() {
        return lat <= 85 && lat >= -58;
    }
}
