package ru.drondrin.servlet.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ru.drondrin.entity.Location;

import java.io.IOException;
import java.util.ArrayList;

import static ru.drondrin.Main.forecastService;
import static ru.drondrin.Main.locationService;

public class WeatherServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        var city = req.getParameter("city");
        if (city == null) {
            try {
                var lat = Double.parseDouble(req.getParameter("lat"));
                var lon = Double.parseDouble(req.getParameter("lon"));
                req.setAttribute("forecast", forecastService.getForecast(new Location(lat, lon, new ArrayList<>())));
                req.setAttribute("location", new Location(lat, lon, new ArrayList<>()));
                getServletContext().getRequestDispatcher("/static/weather.jsp").forward(req, resp);
            } catch (NumberFormatException | NullPointerException e) {
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
            }
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
