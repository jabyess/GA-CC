// start with an IIFE so code gets executed automatically on page load
// w, d are window and document arguments, for brevity because we use them a lot.
// see very bottom of function where we pass them in
(function(w, d) {

	w.omdbGlobals = {
		searchResults: {}
	};

	function favoriteEventListeners() {
		// add a change event to all checkboxes
		// for favoriting movies
		var favorites = d.querySelectorAll('.results-item__fav input');
		for(var i = 0; i < favorites.length; i++) {
			favorites[i].addEventListener('change', handleFavoriteChange);
		}
	}

	

	function handleFavoriteChange(event) {
		// do it up
		var checked = event.target.checked;
		var title = event.target.value;

		// add or remove from favorites depending on checked state
		if(checked) {
			console.log('checked', title);
			addToFavorites(title);
		}
		else {
			console.log('unchecked', title);
			removeFromFavorites(title);
		}
	}

	function addToFavorites(title) {
		handleFavoriteAjax(title, 'add');
	}

	function removeFromFavorites(title) {
		handleFavoriteAjax(title, 'remove');
	}

	function handleFavoriteAjax(title, action) {
		var params = { title: title }
		var request = new XMLHttpRequest();
		var verb = action === 'add' ? 'POST' : 'DELETE';

		request.open(verb, '/favorites', true);
		request.onload = function() {
			console.log('added or removed:', title);
		};
		request.send(JSON.stringify(params));
	}

	// actually do the ajax call for search
	function handleSearchAjax(searchText) {
		
		// build params object for extensibility later
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

	function appendResults(results) {
		var container = d.getElementById('results-container');
		container.innerHTML = results;

		favoriteEventListeners();
	}

	function appendMetaResults() {
		
	}

	function createResultItem(values) {
		var template = '<div class="results-item">'+
		'<div class="results-item__fav">'+
			'<input type="checkbox" value="'+values.title+'">' +
		'</div>' +
		'<div class="results-item__title" data-id="'+values.id+'">' + values.title + '</div>'+
		'<div class="results-item__img">'+
			'<img src="'+values.poster+'" alt="">'+
		'</div>'+
		'</div>';

		return template;
	}

	function init() {
		// verify init is firing
		formEventListeners();
	}
	
	d.addEventListener('DOMContentLoaded', init);

})(window, document); 
// pass in references to global window and document objects
