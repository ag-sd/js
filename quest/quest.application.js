'use strict';

console.log("Initializing chapter data...")

var fs              = require('fs');
var chapterData     = readFileJson(__dirname + "/views/json/index.json");
var configuration   = readFileJson(__dirname + "/env.json");
var chapterCount    = Object.keys(chapterData.chapters).length;
var totalCount      = 0;


/**
 *  Returns the configuration that has been loaded
 *
 **/
exports.config = getConfig();

// Preload the chapters
preloadChapters();
console.log("Chapter data loaded. Found " + totalCount + " pages in " + chapterCount + " chapters");


/**
 *  Will return the total count of chapters that have been loaded
 *
 **/
exports.getTotalChapterCount = function getTotalChapterCount() {
    return chapterCount;
}


/**
 *  Returns the first context to start the quest-ionnaire
 *
 **/
exports.getFirstContext = function () {
    return getContext(0, 0);
}

/**
 *  Returns the next context based on the previous context
 *
 **/
exports.getNextContext = function (currChapterNo, currPageNo) {
    return getNextContext(currChapterNo, currPageNo)
}

/************************** Private Methods **************************/

/**
 *  Preloads all the chapters into memory
 *
 **/
function preloadChapters() {
    console.log("Preloading chapters...");
    var context = getContext(0 , 0);
    do {
        var context = getNextContext(context.current.chapter , context.current.page);
    } while (context != undefined && !context.completed);
    console.log("Preloading chapters...completed");
}

function getNextContext(currChapterNo, currPageNo) {
    // Identify the chapter and current page
    var chapter = getChapter(currChapterNo);
    var nextPage = currPageNo + 1;
    if ( nextPage < chapter.forms.length ) {
        // return the next page in the chapter
        return getContext(currChapterNo , nextPage);
    } else {
        
        // New Chapter
        var nextChapter = currChapterNo + 1;
        if ( nextChapter < chapterCount ) {
            // Next chapter, page 0
            return getContext(nextChapter, 0);
        }
    }
    // All chapters over
    var context = {};
    context.completed = true;
    return context;
}

/**
 *  Will create the context for the current page in the chapter
 *  The context comprises the page being served, its location in
 *  the questionnaire and the from that comprises the questions on this page
 *
 **/
function getContext(chapterNo, pageNo) {
    var context = {};
    context.current = {};
    context.current.chapter=chapterNo;
    context.current.page=pageNo;
    context.current.duration = totalCount;
    
    var chapter = getChapter(chapterNo);
    var form = chapter.forms[pageNo];
    context.current.title=chapter.title;
    context.current.description=chapter.description;
    context.form=form;
    
    context.static = {};
    context.quest = {};
    context.quest.title = chapterData.title;
    context.quest.description = chapterData.description;
    ///console.log("Context created. Context is...");
    console.log(context);
    
    return context;
}

/**
 *  Get the chapter that is requested. Assembe it if required
 *
 **/
function getChapter(chapterNo) {
    // A chapter does not exist
    if ( chapterNo >= chapterCount || chapterNo < 0) {
        return undefined; 
    }
    
    console.log("Returning chapter " + chapterNo);
    var chapter = chapterData.chapters[chapterNo];
    
    return assembleChapter(chapter);
}
/**
 *  Initialises a chapter and assembles its contents if needed
 *  Once a chapter has been read, its contents are
 *  cached in memory. The first time a chapter is accessed, it will be reaad from disk.
 *
 *  A chapter comprises of many pages each page is a form. 
 *  Based on Quest Survey guidelines, the system will move to the next page only if the previous page is validated and saved.
 *  Each page is referenced by an index to the chapter and page
 *  1.3 will represent Chapter 1, page 3
 *
 **/
function assembleChapter(chapter) {
    
    if ( chapter.pages != 'processed' ) {
        console.log("First time loading chapter");
        
        var forms = [];
        for(var i = 0; i < chapter.pages.length; i++) {
            console.log(chapter.pages[i].page);
            forms[i] = readFileJson(__dirname + chapter.pages[i].page);
            totalCount++;
        }

        chapter.forms = forms;
        chapter.pages = 'processed';
        
    }
    return chapter;
}

/**
 *  Will read a file and return it as json
 *
 **/
function readFileJson(file) {
    console.log("Reading file " + file);
    var data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
}

/**
 *  Returns the correct configuration
 *
 **/
function getConfig() {
    var node_env = process.env.NODE_ENV || 'development';
    switch(node_env) {
        case 'development':
            return configuration.dev;
            
        case 'production':
            return configuration.prod;
            
        default:
            console.log('Unknown config requested ' + node_env + ' will return undefined!');
            return undefined;
            break;
    }   
}