package ru.drondrin.servlet.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import static ru.drondrin.Main.forecastService;
import static ru.drondrin.Main.locationService;

public class WeatherServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        var city = req.getParameter("city");
        if (city == null) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        var locations = locationService.getLocations(city);
        if (!locations.isEmpty()) {
            resp.setContentType("application/json");
            var jsonGenerator = new ObjectMapper().createGenerator(resp.getOutputStream());
            jsonGenerator.writeObject(forecastService.getForecast(locations.getFirst()).hourlyTemperatures());
            jsonGenerator.flush();
        } else {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "This city does not exist");
        }
    }
}
