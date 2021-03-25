//HTTP Request Module
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

//Google API Key
const googleAPIKey = 'AIzaSyB5dC46wxo9Czc8RUB2gmkb3xltCTLH1_8';

/**
 * Searches for each individual book in bookList for reviews and other general information on the book
 * @param {Array} bookList List of book names for query search
 * @returns {Array} Contains objects with info on each book with information found
 */
function findBookReviews(bookList) {
    //Split on unique substring
    bookList = bookList.split("#,")

    let allBookReviews = []

    //Iterate through each book and search for info 
    bookList.forEach(bookRequested => {
        let searchResult = bookAPICall(bookRequested);

        if(searchResult !== null) {
            allBookReviews.push(searchResult);
        } 
    })

    process.send(allBookReviews)
}

/**
 * Sends request for information on book using bookTitle as a search parameter 
 * @param {String} bookTitle Title of book
 * @returns {Object} Object containing general information on the book(title, authors, average user review)
 */
function bookAPICall(bookTitle) {
    //Create request
    let request = new XMLHttpRequest();
    let requestURL = 'https://www.googleapis.com/books/v1/volumes?q=' + bookTitle

    //Standardized format of book info
    let bookInfo = {
        title: '',
        avgReview: 0,
        authors: []
    }

    //Synchrounous API request
    request.open("GET", requestURL, false)
    request.send(null);

    //Check for successful API request
    if(request.status == 200) {
        let bookSearchResults = JSON.parse(request.responseText);

        //Only return object if there are any search results
        if(bookSearchResults.totalItems != 0) {
            bookInfo.title = bookSearchResults.items[0].volumeInfo.title;
            bookInfo.avgReview = bookSearchResults.items[0].volumeInfo.averageRating;
            bookInfo.authors = bookSearchResults.items[0].volumeInfo.authors;

            return bookInfo;
        } else {
            return null;
        }

    } else {
        //Failed request
        console.log("ERROR:", request.status);
        return null
    }
}

//For async call
findBookReviews(process.argv[2]);

module.exports = findBookReviews