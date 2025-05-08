let plan = []

document.addEventListener("DOMContentLoaded", function() {
    async function loadWeatherData() {
        try {
            const weatherData = await getDataFromCSV();
            window.weatherData = weatherData.slice(0, 20);
            showTable(window.weatherData);
        } catch (error) {
            console.error('Error with loading data:', error);
        }
    }

    loadWeatherData();

    document.querySelector('#confirm-filters').addEventListener('click', showFilteredTable);
    document.querySelector('#reset-filters').addEventListener('click', resetFilters);
    document.querySelector('#confirm-plan').addEventListener('click', confirmPlan);

    updatePlanVisibility();
});

async function getDataFromCSV() {
    const res = await fetch('weather_Small.csv');
    const csv = await res.text();
    const parsedWeatherData = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true
    });

    return parsedWeatherData.data.map(dataRow => ({
        id: dataRow.ID,
        temperature: Number(dataRow.Temperature),
        humidity: Number(dataRow.Humidity),
        wind_speed: Number(dataRow.WindSpeed),
        precipitation: Number(dataRow.Precipitation),
        cloud_cover: dataRow.CloudCover,
        atmospheric_pressure: Number(dataRow.AtmosphericPressure),
        uv_index: Number(dataRow.UVIndex),
        season: dataRow.Season,
        visibility: Number(dataRow.Visibility),
        location: dataRow.Location,
        weather_type: dataRow.WeatherType
    }));
}

function showTable(weatherData) {
    const tbody = document.querySelector('#weather-table');

    tbody.innerHTML = ''; 
    
    for (const data of weatherData) {
        const isInPlan = plan.includes(data.id);
        const buttonText = isInPlan ? "Remove" : "Add";
        const buttonClass = isInPlan ? "button-remove" : "button-add";
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${data.id}</td>
            <td>${data.temperature}</td>
            <td>${data.humidity}</td>
            <td>${data.wind_speed}</td>
            <td>${data.precipitation}</td>
            <td>${data.cloud_cover}</td>
            <td>${data.atmospheric_pressure}</td>
            <td>${data.uv_index}</td>
            <td>${data.season}</td>
            <td>${data.visibility}</td>
            <td>${data.location}</td>
            <td>${data.weather_type}</td>
            <td><button class="${buttonClass}" onClick="toggleAddToPlan('${data.id}', this)">${buttonText}</button></td>
        `;
        tbody.appendChild(row);
    }
}

function showFilteredTable() {
    const selectedSeason = document.querySelector('#filter-season').value;
    const selectedWeather = document.querySelector('#filter-weather-type').value;
    const minTemp = parseFloat(document.querySelector('#filter-temp-min').value) || -Infinity;
    const maxTemp = parseFloat(document.querySelector('#filter-temp-max').value) || Infinity;
    const minWindSpeed = parseFloat(document.querySelector('#filter-wind-min').value) || -Infinity;
    const maxWindSpeed = parseFloat(document.querySelector('#filter-wind-max').value) || Infinity;
    const filteredData = window.weatherData.filter(data => {
        const seasonMatches = selectedSeason ? data.season === selectedSeason : true;
        const weatherMatches = selectedWeather ? data.weather_type === selectedWeather : true;
        const tempMatches = data.temperature >= minTemp && data.temperature <= maxTemp;
        const windSpeedMatches = data.wind_speed >= minWindSpeed && data.wind_speed <= maxWindSpeed;

        return seasonMatches && weatherMatches && tempMatches && windSpeedMatches;
    });

    showTable(filteredData.slice(0, 20));
}

function resetFilters() {
    document.querySelector('#filter-season').selectedIndex = 0;
    document.querySelector('#filter-weather-type').selectedIndex = 0;
    document.querySelector('#filter-temp-min').value = '';
    document.querySelector('#filter-temp-max').value = '';
    document.querySelector('#filter-wind-min').value = '';
    document.querySelector('#filter-wind-max').value = '';

    showTable(window.weatherData);
}


function toggleAddToPlan(dataID, button) {
    const isInPlan = plan.includes(dataID);

    if (!isInPlan) {
        plan.push(dataID);
        addToPlan(dataID);
        button.innerText = "Remove";
        button.classList.remove('button-add');
        button.classList.add('button-remove'); 
    } else {
        const index = plan.indexOf(dataID);
        plan.splice(index, 1);
        removeFromPlan(dataID);
        button.innerText = "Add";
        button.classList.remove('button-remove');
        button.classList.add('button-add');
    }

    button.innerText = plan.includes(dataID) ? "Remove" : "Add";

    updatePlanVisibility();
}

function addToPlan(dataID) {
    const tbody = document.querySelector('#plan-table');
    const data = window.weatherData.find(d => d.id == dataID);
    const row = document.createElement('tr');

    row.setAttribute('data-id', data.id);
    row.innerHTML = `
        <td>${data.id}</td>
        <td>${data.temperature}</td>
        <td>${data.season}</td>
        <td>${data.weather_type}</td>
    `;

    tbody.appendChild(row);
}

function removeFromPlan(dataID) {
    const tbody = document.querySelector('#plan-table');
    const row = tbody.querySelector(`tr[data-id="${dataID}"]`);
    if (row) {
        row.remove();
    }
}

function confirmPlan() {
    const allButtons = document.querySelectorAll('#weather-table button');

    allButtons.forEach(button => {
        button.innerText = "Add";
        button.classList.remove('button-remove');
        button.classList.add('button-add');
    });

    if (plan.length == 1){
        alert(`You have successfully planned ${plan.length} day!`);
    } else {
        alert(`You have successfully planned ${plan.length} days!`);
    }

    tbody = document.querySelector('#plan-table');
    tbody.innerHTML = '';

    plan = [];

    updatePlanVisibility();
}

function updatePlanVisibility() {
    const aside = document.querySelector('aside');
    const table = aside.querySelector('table');
    const button = aside.querySelector('button');

    if (plan.length === 0) {
        table.style.display = 'none';
        button.style.display = 'none';
    } else {
        table.style.display = 'table';
        button.style.display = 'inline-block';
    }
}