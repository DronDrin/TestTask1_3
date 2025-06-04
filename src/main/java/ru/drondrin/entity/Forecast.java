package ru.drondrin.entity;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import static ru.drondrin.Main.CONFIG;

public record Forecast(int startHour, List<Double> hourlyTemperatures) {
    private static final DateTimeFormatter datetimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    public static Forecast create(List<String> dateTimes, List<Double> temperature) {
        var iStart = getIndexOfCurrentHour(dateTimes);
        if (iStart >= dateTimes.size())
            throw new RuntimeException("Forecast doesn't have current datetime");

        ArrayList<Double> hourlyTemperatures = new ArrayList<>();
        int size = CONFIG.intProperty("forecast-size") + 1;         // for current hour
        for (int i = iStart; i < iStart + size; i++) {
            if (i >= dateTimes.size())
                throw new RuntimeException("Forecast is too short");
            hourlyTemperatures.add(temperature.get(i));
        }

        var dateTime = LocalDateTime.parse(dateTimes.get(iStart), datetimeFormatter);
        return new Forecast(dateTime.getHour(), hourlyTemperatures);
    }

    private static int getIndexOfCurrentHour(List<String> dateTimes) {
        var now = OffsetDateTime.now(ZoneOffset.UTC);
        int currentHour = now.getHour();
        int currentDay = now.getDayOfMonth();
        int iStart = 0;

        while (iStart < dateTimes.size()) {
            var dateTime = LocalDateTime.parse(dateTimes.get(iStart), datetimeFormatter);
            if (dateTime.getDayOfMonth() == currentDay && dateTime.getHour() == currentHour)
                break;
            iStart++;
        }
        return iStart;
    }
}
