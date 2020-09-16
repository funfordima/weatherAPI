const cities = [
    {
        city: 'Kiev',
        coordinates: [50.45, 30.52]
    },
    {
        city: 'Kharkov',
        coordinates: [49.98, 36.25]
    },
    {
        city: 'Dnepr',
        coordinates: [48.46, 35.04]
    },
    {
        city: 'Lvov',
        coordinates: [49.84, 24.02]
    },
    {
        city: 'Odessa',
        coordinates: [46.48, 30.73]
    }
];

function changeRandomCity(cities) {
    const { length } = cities;
    return cities[Math.floor(Math.random() * length)].city;
}

class OpenWeather {
    constructor(cities) {
        this.cities = cities;
    }

    getRequestWeather() {
        const requestWeather = this.cities.map((city) => {
            const { coordinates: [lat, lon] } = city;
            return fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&lang=ru&exclude=hourly,minutely&units=metric&appid=c9d10fdf18cb0843b77a34262a33b241`)
        });
        return Promise.all(requestWeather)
            .then((responses) => {
                return Promise.all(responses.map((r) => r.json()))
            })
            .catch((e) => console.error(e));
    }

    getAllCitiesWeather() {
        this.getRequestWeather()
            // все JSON-ответы обработаны, allCities - массив с результатами
            .then((allCities) => {
                return allCities.forEach((townWeather, i) => {
                    return townWeather.daily.forEach((item) => {
                        return {
                            city: this.cities[i].city,
                            currentDate: new Date(item.dt * 1e3).toLocaleDateString(),
                            sunrise: new Date(item.sunrise * 1e3).toLocaleTimeString().slice(0, 5),
                            sunset: new Date(item.sunset * 1e3).toLocaleTimeString().slice(0, 5),
                            temperature: `${JSON.stringify(item.temp)}°C`,
                            pressure: `${item.pressure}hPa`,
                            windSpeed: `${item.wind_speed}m / s`,
                        };
                    });
                });
            })
            .then((d) => console.log(d))
            .catch((error) => console.error(error));
    }
}

const allCities = new OpenWeather(cities);
allCities.getAllCitiesWeather();

class CityWeather extends OpenWeather {
    constructor(cities, city = changeRandomCity(cities)) {
        super(cities);
        this.city = city;
    }

    getCityWeather() {
        const myCity = this.cities.find((el) => el.city == this.city);
        const { coordinates: [lat, lon] } = myCity;
        super.getRequestWeather()
            .then(allCities => allCities.find((town) => {
                return (town.lat === lat && town.lon === lon)
            }))
            .then((myTown) => {
                myTown.daily.forEach((item) => {
                    return (
                        {
                            city: this.city,
                            currentDate: new Date(item.dt * 1e3).toLocaleDateString(),
                            sunrise: new Date(item.sunrise * 1e3).toLocaleTimeString().slice(0, 5),
                            sunset: new Date(item.sunset * 1e3).toLocaleTimeString().slice(0, 5),
                            temperature: `${JSON.stringify(item.temp)}°C`,
                            pressure: `${item.pressure}hPa`,
                            windSpeed: `${item.wind_speed}m / s`,
                            humidity: `${item.humidity}%`,
                            feelsLike: `${JSON.stringify(item.feels_like)}°C`,
                            clouds: `${item.weather[0].description}`,
                        }
                    );
                });
            })
            .catch((e) => console.error(e));
    }
}

const myCity = new CityWeather(cities, 'Kharkov');
myCity.getCityWeather();

const randomCity = new CityWeather(cities);
randomCity.getCityWeather();

window.addEventListener('unhandledrejection', (event) => console.error(event.reason));