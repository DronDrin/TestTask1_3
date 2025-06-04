package ru.drondrin.servlet.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import static ru.drondrin.Main.locationService;

public class LocationServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String query = req.getParameter("query");
        if (query == null) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }
        resp.setContentType("application/json");
        var jsonGenerator = new ObjectMapper().createGenerator(resp.getOutputStream());
        jsonGenerator.writeObject(locationService.getLocations(query));
        jsonGenerator.flush();
    }
}
