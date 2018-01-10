$(document).ready(function() {
     $("#form_content").alpaca(context.form);
});


$(function() {
    $("#submit_btn").click(function(event){

        // Compile the data to send back
        var data = {};
        data.current = context.current;
        data.form = $( "form" ).serialize();

        $.ajax({
            type: "POST",
            url: "/processpage",
            data: data,
            success: function(data) {
                var response = JSON.parse(data);
                if( response.success ) {
                    // Success
                    console.log("Return success....");
                    context = response;
                    $("#form_content").empty();
                    $("#form_content").alpaca(context.form);
                    //$("#form_content").alpaca(response.form);
                } else {
                    // Error
                    console.log("Return faulure....");
                }
            },
            error: function() {
                // There was an error
                console.log("Return faulure....");
            }
        });

    });
});

var context = {{{page_context}}};