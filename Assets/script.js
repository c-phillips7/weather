
var searchBar = $("<h2>").text("Search for a City").addClass("searchBar");
var userInput = $("<input>").attr("type", "text").addClass("w-100");
var searchBtn= $("<button>").text("Search").attr("type", "submit").addClass("search-btn w-100");

// Creating divs
var sidebarSearch = $("<div>").addClass("sidebar-search").append(searchBar, userInput, searchBtn);
var sidebarResults = $("<div>").addClass("sidebar-results");
var sidebar = $("<div>").addClass("column col-3 sidebar").append(sidebarSearch).append(sidebarResults);


// Changeable variables
let myCity = "New York"
let days = [1, 2, 3, 4, 5]
let cities =  []


fetchData = (city) => {
    // First find cities lon and lat
    var cityApi = "https://api.openweathermap.org/geo/1.0/direct?q="+city+"&limit=1&appid=021317329977ca6d14196271d5be63a3"
    fetch(cityApi).then(function(response){
        if(response.ok) {
            response.json().then(function(data){
                var lat = (data[0].lat)
                var lon = (data[0].lon)

                // fetch forecast using lat and lon found
                var weatherApi = "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=alerts,minutely&appid=021317329977ca6d14196271d5be63a3";
            
                fetch(weatherApi).then(function(response){
                if(response.ok) {
                    response.json().then(function(data) {
                        generateCurrentWeather(data, city)
                        generateForecast(data)
                    })
                } else {
                    $(conditionsContainer).text("information not available")
                }
            })
            })
        }
    })
}

// Create button of city previously searched
generatePastSearchBtn = (city) => {
    var pastCityBtn = $("<button>").addClass("past-city-btn w-100").attr("type", "click").text(city);
    $(sidebarResults).prepend(pastCityBtn);
    $(pastCityBtn).on("click", function (event){
        pastSeachBtnHandler(city)
    });
}

// Get search history from local storage
searchHistory = JSON.parse(localStorage.getItem("searchHistory"))
if (searchHistory){
    cities = searchHistory
    for (var i=0; i<cities.length; i++) {
        var oldCity = cities[isSecureContext]
        generatePastSearchBtn(oldCity)
    }
}

// Past searches button replaces current display with selected city
submitBtnHandler = (city) => {
    var newCity = userInput[0].value
    if(newCity) {
        $(currentContainer).html("");
        $(future).html("");
        fetchData(newCity);
        generatePastSearchBtn(newCity);
        cities.push(newCity);
        localStorage.setItem("searchHistory", JSON.stringify(cities));
        userInput[0].value = "";
    }
}

pastSeachBtnHandler = (city) => {
    var newCity = city
    if (newCity) {
    $(currentContainer).html(""); 
    $(future).html("");
    fetchData(newCity);
    }
}


// Generate card for next 5 days
generateForecast = (data) => {
    for (var i=0; i < days.length; i++) {
        // Set variables from data in JSON
        var weatherIconForecast = $("<i>").addClass("day-icon")
        var weatherForecast = data.daily[i].weather[0].main;
        updateIcons(weatherIconForecast, weatherForecast);
        var kTempForecast = data.daily[i].temp.day;
        var fTempForecast = (1.8*(kTempForecast -273)+32).toFixed(2);
        var windForecast = data.daily[i].wind_speed;
        var humidityForecast = data.daily[i].humidity;

        // Create Div and append data for each day
        var dayHeader = $("<h2>").addClass("day-header").text("(" +moment().add(i+1, 'days').format('L')+")")
        var dayTemp = $("<li>").text("Temp: "+fTempForecast+"\u00B0"+"F")
        var dayWind = $("<li>").text("Wind: "+windForecast+" MPH")
        var dayHumidity = $("<li>").text("Humidity: "+humidityForecast+"%")
        var dayUl = $("<ul>").addClass("forecast-ul").append(dayTemp, dayWind, dayHumidity)
        var day = $("<div>").addClass("card day").append(dayHeader, weatherIconForecast, dayUl)
        $(future).append(day)
    }
}

// Set to display default city
fetchData(myCity)

var forecastHeader =$("<h2>").text("5-day Forecast:").addClass("forecast-header")
var future = $("<div>").addClass("future");
var currentContainer = $("<div>")
var conditionsContainer = $("<div>").addClass("flex-column col-8 conditions-container").append(currentContainer, forecastHeader, future);
var headerText = $("<h1>").addClass("headerText").text("Weather Dashboard");
var header = $("header").addClass("header");
$("header").append(headerText);
var row = $("<div>").addClass("row main-container").append(sidebar, conditionsContainer);
$("body").append(row)

// Update Weather Icons
updateIcons = (icon, weather) => {
    if (weather=== "Clouds") {
        $(icon).html("<img src=http://openweathermap.org/img/w/03d.png>")
    } else if (weather=== "Rain") {
        $(icon).html("<img src=http://openweathermap.org/img/w/10d.png>")
    } else if (weather=== "Snow") {
        $(icon).html("<img src=http://openweathermap.org/img/w/13d.png>")
    } else if (weather=== "Drizzle") {
        $(icon).html("<img src=http://openweathermap.org/img/w/09d.png>")
    } else if (weather=== "Thunderstorm") {
        $(icon).html("<img src=http://openweathermap.org/img/w/11d.png>")
    } else if (weather=== "Clear") {
        $(icon).html("<img src=http://openweathermap.org/img/w/01d.png>")
    } else {
        $(icon).html("<img src=http://openweathermap.org/img/w/50d.png>")
    }
}

// Current day's weather
generateCurrentWeather = (data, city) => {
    // set values from data fetched, named current to differentiate from forecast vars
    var fTempCurrent = (1.8*(data.current.temp -273)+32).toFixed(2);
    var humidityCurrent = data.current.humidity;
    var windCurrent = data.current.wind_speed;
    var currentUv = data.current.uvi;
    var currentIcon = $("<i>");
    var currentWeather = data.current.weather[0].main;

    // formatted data for appending later
    var currentTemp = $("<li>").text("Temp: "+fTempCurrent+"\u00B0"+"F");
    var currentWind = $("<li>").text("Wind: "+windCurrent+" MPH");
    var currentHumidity = $("<li>").text("Humidity: "+humidityCurrent+"%");
    var uvSpan = $("<span>").text(currentUv);
    // Color code UV
    if (currentUv<2.01) {
        $(uvSpan).addClass("uv-green")
    }
    else if (currentUv<7) {
        $(uvSpan).addClass("uv-yellow")
    }
    else {
        $(uvSpan).addClass("uv-red")
    }
    // Set icons by current weather
    updateIcons(currentIcon, currentWeather);

    // append to html (done out of order so prepended to main container)
    var currentUl = $("<ul>").addClass("current-ul").append(currentTemp, currentWind, currentHumidity, currentUv);
    var currentHeader = $("<h2>").addClass("current-header").text(city + " (" +moment().format('L')+") ").append(currentIcon);
    var currentDiv = $("<div>").addClass("current").append(currentHeader, currentUl);
    $(currentContainer).prepend(currentDiv)
    $(searchBtn).on("click",function (event){
        submitBtnHandler()
    });

}