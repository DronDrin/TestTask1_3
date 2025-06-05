<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/home-styles.css">
    <script src="${pageContext.request.contextPath}/static/js/home-scripts.js"></script>
</head>
<body>
<main class="main">
    <div class="main__location-window location location_hidden" id="locationWindow">
        <div class="map" id="map">
            <div class="map__hovers" id="mapHovers">
                <div class="map__hover" id="mapHover"></div>
                <div class="map__scanline" id="scanLine"></div>
            </div>
            <div class="map__dots" id="mapDots">
            </div>
        </div>
    </div>
    <div class="main__glass" id="mapBlocker"></div>
    <div class="main__search-window search-window" id="searchWindow">
        <h2 class="search-window__header">Weather forecast</h2>
        <div class="search-window__body">
            <div class="search-window__form">
                <input type="text" class="search-window__input" id="searchInput" placeholder="Look for a city">
                <div class="search-window__submit hidden" id="searchButton" role="button">Go!</div>
            </div>
        </div>
    </div>
</main>
</body>
</html>