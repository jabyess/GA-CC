// start with an IIFE so code gets executed automatically on page load
// w, d are window and document arguments for brevity because we use them a lot.
// see very bottom of function where we pass them in
(function(w, d) {

	// create a global object to store search results in
	w.omdbGlobals = {};

	// event listeners to for search form elements
	function formEventListeners() {
		// attach to form submit event, instead of button click event
		// this way we can account for submit on enter key 
		// as well as button clicks
		var form = d.getElementById('search-form');
		form.addEventListener('submit', performSearchAjax);
	}

	// event listeners for the view favorites button
	function viewFavoritesEventListeners() {
		var showFavButton = d.getElementById('show-favorites');
		showFavButton.addEventListener('click', viewFavorites);
	}

	// actually runs the ajax call for searching
	function performSearchAjax() {
		// build params object for extensibility later
		event.preventDefault();
		// get value of search field to pass to ajax call
		var searchText = d.getElementById('search').value;
		var params = { text: searchText };
		// native ajax code, use xhr for IE9+ compatibility
		var request = new XMLHttpRequest();
		// http method, server url, true for async
		request.open('POST', '/search', true);
		request.setRequestHeader('Content-Type', 'application/json');
		
		// onload is where we handle the results.
		request.onload = function() {
			processResults(request.responseText);
		};
		
		// execute ajax call with post data params
		// stringify the params to transmit over the wire
		request.send(JSON.stringify(params));
	}

	// parse the results and pass them into the template
	function processResults(results) {
		var resObj = JSON.parse(results);
		
		var resultsTemplate = [];
		// if the response was successful loop over it
		// and create an html string to append to the DOM
		if(resObj.Response && resObj.Search) {
			// store search results in global variable
			resObj.Search.forEach(function(movie) {
				// store these values globally (by id) for later lookup
				// values that go into the html template

				w.omdbGlobals[movie.imdbID] = {
					title: movie.Title,
					poster: movie.Poster,
					year: movie.Year,
					imdbID: movie.imdbID
				};

				// push the rendered strings into an array
				resultsTemplate.push(
					createResultItem(w.omdbGlobals[movie.imdbID])
				);
			});
		}

		// concat the array and append the html on the page
		var resultsString = resultsTemplate.join('');
		var resultsContainer = d.getElementById('results-container');
		resultsContainer.innerHTML = resultsString;

		// fire the next set of event listeners
		metaEventListeners();
		favoriteEventListeners();
	}

	function metaEventListeners() {
		var movieTitles = d.getElementsByClassName('results-item__title');

		for(var j = 0; j < movieTitles.length; j++) {
			movieTitles[j].addEventListener('click', function(e) {
				showMetaInfo(e.target.dataset.imdbId);
			});
		}
	}

	function favoriteEventListeners() {
		// add a change event to all checkboxes
		// for favoriting movies
		var favorites = d.querySelectorAll('.results-item__fav input');
		for(var i = 0; i < favorites.length; i++) {
			favorites[i].addEventListener('change', handleFavoriteChange);
		}
	}

	// logic to see if the checkbox is checked already or not
	function handleFavoriteChange(e) {
		var checked = e.target.checked;
		if(checked) {
			addToFavorites(e.target.value);
		}
	}

	// runs on checkbox being checked
	function addToFavorites(id) {
		var payload = w.omdbGlobals[id];
		var request = new XMLHttpRequest();
		request.open('POST', '/favorites', true);
		request.setRequestHeader('Content-Type', 'application/json');
		request.onload = function() {
			console.log('added to favorites');
		}

		request.send(JSON.stringify(payload));
	}

	// fires when a movie title is clicked
	function showMetaInfo(id) {
		// lookup movie by id in global store
		var movieMeta = w.omdbGlobals[id];

		// build template
		var metaTemplate = '<ul class="meta-info">'+
		'<li class="meta-title">Title: '+movieMeta.title+'</li>' +
		'<li class="meta-year">Year: '+movieMeta.year+'</li>' +
		'<li class="meta-id">IMDB ID: '+movieMeta.imdbID+'</li>' +
		'</ul>';

		// append template to container
		var metaContainer = document.getElementsByClassName('meta-container')[0];
		metaContainer.innerHTML = metaTemplate;
	}

	// fires when show favorites button is clicked
	function viewFavorites() {
		// fetch favorites data from api
		var favReq = new XMLHttpRequest();
		favReq.open('GET', '/favorites', true);
		favReq.onload = function() {
			var favHtml = [];
			var favorites = JSON.parse(favReq.responseText);

			// loop over each result and make an html string out of it
			favorites.forEach(function(fav) {
				favHtml.push(createFavoriteItem(fav));
			});

			var favContainer = d.getElementsByClassName('favorites-titles')[0];
			var favString = favHtml.join('');
			favContainer.innerHTML = favString;
		};
		favReq.send();
	}

	// returns a string of html
	function createFavoriteItem(values) {
		var favTemplate = '<div class="favorite-item">'+
		values.title +
		'</div>';

		return favTemplate;
	}

	// returns a string of html for results values
	function createResultItem(values) {
		// template for result listings
		var template = '<div class="results-item">'+
		'<div class="results-item__fav">'+
			'<input type="checkbox" value="'+values.imdbID+'">' +
		'</div>' +
		'<div class="results-item__title" data-imdb-id="'+values.imdbID+'">' + values.title + '</div>'+
		'<div class="results-item__img">'+
			'<img src="'+values.poster+'" alt="">'+
		'</div>'+
		'</div>';

		return template;
	}

	function init() {
		formEventListeners();
		viewFavoritesEventListeners();
	} 

	d.addEventListener('DOMContentLoaded', init);

})(window, document);
