'use strict';
// INITALIZATION

var express = require('express');
var hbs = require('express-handlebars').create({ defaultLayout:'main', extname: '.hbs' });
var quest = require('./quest.application.js');

console.log("!!!Running in ***" + process.env.NODE_ENV + "*** mode!!!. Current configuration is ...");
console.log(quest.config);


var app = express();
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

////--------------> MIDDLEWARE <--------------////



////--------------> ROUTES <--------------////
//--------------> MAIN
app.get('/', function(req, res) {
    res.render('home'/*, {layout: 'main' }*/);
});

//--------------> ABOUT
app.get('/about', function(req, res) {
    res.render('about')
});

//--------------> SURVEY
app.get('/survey', function(req, res) {
    var context = quest.getFirstContext();
    // Set the progress to 1 so that at the final step, the progress is 100 which is more intuitive
    context.current.progress = 1;
    res.render('survey', {
                            page_context: JSON.stringify(context, null, quest.config.alpaca_json_print_separator),
                            chapter_title:context.current.title,
                            chapter_description:context.current.description,
                            quest_title:context.quest.title,
                            quest_description:context.quest.description
                         });
});

//--------------> SURVEY POST
app.post('/processpage', function(req, res) {
    
    console.log("incoming.....");
    //console.log(req.body);
    
    // Identify the current chapter
    var current = req.body.current;
    var newContext = quest.getNextContext(Number(current.chapter), Number(current.page));
    if ( newContext.completed ) {
        // Cmpleted. Redirect to the thank you page
        console.log("redirect here...");
        //res.redirect(302, "/complete");
        newContext.redirect = true;
        newContext.url = "/complete";
    } else {
        // Update the progress
        newContext.current.progress = Number(current.progress) +1;
    }
    
    newContext.success = true;
    
    if( req.xhr || req.accepts('json,html')==='json' ) {
        res.send( JSON.stringify(newContext, null, quest.config.alpaca_json_print_separator) );
    } else {
        // Redirect to a new page with some additional information
        // legacyresponse?chapter=1?form=2
    }
    
});

//--------------> SURVEY COMPLETEE
app.get('/complete', function(req, res) {
    res.render('complete');
});




////--------------> ERROR <--------------////
//--------------> 404 - Not Found
app.use(function(req, res) {
    res.status(404);
    res.render('error', {errorMsg: '404 - Not found'});
});

//--------------> 500 - Server Error
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('error', {errorMsg: '500 - Server error'});
});


//--------------> Server Start
app.listen(app.get('port'), function() {
   console.log('Express app started on port ' + app.get('port'));
});