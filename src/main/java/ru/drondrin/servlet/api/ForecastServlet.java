package ru.drondrin.servlet.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ru.drondrin.entity.Location;

import java.io.IOException;
import java.util.ArrayList;

import static java.lang.Double.parseDouble;
import static ru.drondrin.Main.forecastService;

public class ForecastServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            var location = new Location(parseDouble(req.getParameter("lat")), parseDouble(req.getParameter("lon")));
            resp.setContentType("application/json");
            var jsonGenerator = new ObjectMapper().createGenerator(resp.getOutputStream());
            jsonGenerator.writeObject(forecastService.getForecast(location));
            jsonGenerator.flush();
        } catch (NullPointerException | NumberFormatException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}
