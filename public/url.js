var omdbUrl = 'https://www.omdbapi.com/';
var apiKey = 'a04790d0'; // don't do this...
var totalResults, indexedData;

function sendData(searchType) {

    // Create a new XML http request
    var request = new XMLHttpRequest();

    // Grab the title from the form
    var term = document.getElementById('search').value;

    // Build out URL params
    var urlParams = {
        search: 's',
        title: 't'
    };

    // Populate our request
    request.open('GET', omdbUrl + '?' + urlParams[searchType] + '=' + term + '&apikey=' + apiKey + '&plot=full');

    // Convert response to JSON
    request.responseType = 'json';

    // Sent data that the user provided in the form
    request.send();

    request.onload = function () {
        var response = request.response;

        // Index response data
        indexedData = {};

        // Rename keys to imdb IDs for easier reference
        response.Search.forEach(function (item) {
            var oid = item.imdbID;
            indexedData[oid] = item;
        });

        populateResults(indexedData);
    }
}

// Access the form element & take over its submit event
var form = document.getElementById('searchForm');

form.addEventListener('submit', function (event) {
    event.preventDefault();
    sendData('search');
});

function populateResults(indexedData, faves) {

    var section = document.querySelector('section');
    var results = document.getElementById('results');
    totalResults = 0;

    // Clear old results
    while (section.firstChild) {
        section.removeChild(section.firstChild);
    }

    results = document.createElement('div');
    results.setAttribute('id', 'results');
    var resultsHeading = document.createElement('h3');
    resultsHeading.setAttribute('id', 'resultsheading');

    section.appendChild(resultsHeading);
    section.appendChild(results);

    for (var oid in indexedData) {
        var result = indexedData[oid];
        var title = document.createElement('h3');
        var fave = document.createElement('a');
        var poster = new Image(200, 280);
        var heart = new Image(20, 18);
        var article = document.createElement('article');
        var a = document.createElement('a');

        a.appendChild(title);
        a.title = result.Title;
        a.href = '#';
        a.setAttribute('onclick', 'getDetails(this.id);return false;');

        fave.href = '#';
        fave.appendChild(heart);
        heart.src = faves ? 'heart-full.png' : 'heart-empty.png';
        heart.setAttribute('class', 'heart');
        fave.setAttribute('id', result.imdbID);
        fave.setAttribute('onclick', 'saveFave(this);return false;');
        fave.title = 'Favorite this';
        fave.appendChild(heart);

        title.textContent = result.Title;
        poster.src = (result.Poster !== 'N/A' ? result.Poster : 'movie.png');
        article.setAttribute('class', 'result');
        a.setAttribute('id', result.imdbID);
        a.appendChild(poster);
        a.appendChild(title);

        article.appendChild(fave);
        article.appendChild(a);
        results.appendChild(article);

        totalResults++;

        resultsHeading.textContent = 'Results:' + totalResults;

    };
}

function getDetails(id) {
    var request = new XMLHttpRequest();
    request.open('GET', omdbUrl + '?' + 'i=' + id + '&apikey=' + apiKey);

    // Convert response to JSON
    request.responseType = 'json';

    request.send();

    request.onload = function () {
        var response = request.response;
        populateDetails(id, response);
    }

}

function populateDetails(id, plotData) {
    modal.style.display = 'block';
    var clicked = document.getElementById(id);
    var title = document.getElementById('title');

    var plot = document.getElementById('plot');
    var details = document.getElementById('details');

    title.textContent = plotData.Title;

    plot.textContent = plotData.Plot;
    details.textContent = 'Featuring ' + plotData.Actors + ' — ' + plotData.Runtime + ' — ' + plotData.Year + ' — ' + plotData.Rated;

};

function saveFave(node) {
    var selectedFave = indexedData[node.id];
    node.children[0].src = 'heart-full.png';

    var request = new XMLHttpRequest();
    request.open('POST', '/favorites', true)

    //Send the proper header information along with the request
    request.setRequestHeader('Content-type', 'application/json');

    var data = JSON.stringify(selectedFave);
    request.send(data);

}

document.getElementById('faves').onclick = function () {

    var request = new XMLHttpRequest();
    request.open('GET', '/favorites');

    // Convert response to JSON
    request.responseType = 'json';

    request.send();

    request.onload = function () {
        var response = request.response;
        populateResults(response, 'faves');
    }

};

// Get the modal
var modal = document.getElementById('modal');

// Get <span> element that closes the modal
var span = document.getElementsByClassName('close')[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = 'none';
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
