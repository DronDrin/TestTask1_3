<%@ page import="ru.drondrin.entity.Forecast" %>
<%@ page import="java.util.stream.Collectors" %>
<%@ page import="ru.drondrin.entity.Location" %>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="forecast-temperatures" content="<%=
    ((Forecast) request.getAttribute("forecast")).hourlyTemperatures().stream().map(String::valueOf).collect(Collectors.joining(" "))
    %>">
    <meta name="forecast-starting-hour" content="<%=
    ((Forecast) request.getAttribute("forecast")).startHour()
    %>">
    <script src="${pageContext.request.contextPath}/static/js/weather-scripts.js"></script>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/weather-styles.css">
    <title>Weather forecast</title>
</head>
<body>
<main class="main">
    <div class="main__top">
        <h1 class="main__header">Weather forecast</h1>
        <h2 class="main__location"><%
            var address = request.getParameter("address");
            if (address == null) {
                var location = (Location) request.getAttribute("location");
                out.print("lat: %f; lon: %f;".formatted(location.lat(), location.lon()));
            } else {
                out.print(address.replaceAll("\\+", " "));
            }
        %></h2>
    </div>
    <div class="weather-graph__outline">
        <div class="main__graph weather-graph">
            <div class="weather-graph__body">
                <div class="weather-graph__plot">
                    <canvas class="weather-graph__canvas"></canvas>
                    <div class="weather-graph__selector-dot hidden"></div>
                    <div class="weather-graph__label hidden"></div>
                </div>
                <div class="weather-graph__times"></div>
            </div>
            <div class="weather-graph__captions"></div>
        </div>
    </div>
</main>
</body>
</html>