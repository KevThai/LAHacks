//Multithread 
const os = require('os');
const child_process = require('child_process')

//Global variables for thread count
const numOfCores = os.cpus().length;
const numOfThreads = numOfCores * 2;

/**
 * Multithreaded API call for book reviews
 * Note:API calls for Google Books are limited to around 30
 * @param {Array} bookList Array of book titles for query search
 * @return {Promise} Promise of array of object containing book reviews
 */
function asyncBookRequest(bookList) {
    let bookNames = bookList.join("#,")
    let numOfBooks = bookList.length

    //Container for all promises
    let allPromises = [];

    //Remaining books to account for uneven amount 
    let bookRemainders = numOfBooks % numOfThreads;

    //Spawn child processes based on number of available threads
    for(let threadIndex = 0; threadIndex < numOfThreads; threadIndex++) {
        //Spawn threads only if needed 
        if(threadIndex < numOfBooks) {
            allPromises.push(new Promise(res => {
                //Split books based upon number of available threads
                let subBookList = (threadIndex + 1 <= bookRemainders) ? bookList.splice(0, Math.floor(numOfBooks/numOfThreads) + 1): bookList.splice(0, Math.floor(numOfBooks/numOfThreads))

                //Join names with unique separater to rejoin as array later
                bookNames = subBookList.join("#,")

                //Fork child process
                let workerProcess = child_process.fork('findBookReviews.js', [bookNames]);

                workerProcess.once('message', function (result) {
                    res(result)
                })
                
            }))
        } else {
            break;
        }
            
    }
 
    //Return promise with array of resolved promises
    return Promise.all(allPromises).then((values) => {
        //Unnest nested arrays
        let unnestedList = [];
        values.forEach(subBookReviews => {
            subBookReviews.forEach(bookReview => {
                unnestedList.push(bookReview)
            })
            
        })
        
        return unnestedList;
    })


}

module.exports = asyncBookRequest