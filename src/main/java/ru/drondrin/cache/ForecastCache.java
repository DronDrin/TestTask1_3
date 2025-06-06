package ru.drondrin.cache;

import ru.drondrin.entity.Forecast;

import java.util.LinkedHashMap;
import java.util.Optional;

import static java.lang.System.currentTimeMillis;

public class ForecastCache {
    private final LinkedHashMap<LocationDto, Value> cache;
    private final int lifeTime;

    public ForecastCache(int lifeTime) {
        this.lifeTime = lifeTime;
        cache = new LinkedHashMap<>();
    }

    public Optional<Forecast> tryGet(double lat, double lon) {
        synchronized (this) {
            var loc = new LocationDto(lat, lon);
            Value cachedValue = cache.get(loc);
            if (cachedValue == null)
                return Optional.empty();
            if (cachedValue.timestamp < currentTimeMillis() - lifeTime) {
                cache.remove(loc);
                return Optional.empty();
            }
            return Optional.of(cachedValue.forecast);
        }
    }

    public void save(double lat, double lon, Forecast forecast) {
        synchronized (this) {
            cache.put(new LocationDto(lat, lon), new Value(forecast, currentTimeMillis()));
        }
    }

    private record LocationDto(double lat, double lon) {
    }

    private record Value(Forecast forecast, long timestamp) {
    }
}
