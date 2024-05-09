let leadGenInit = function() {
    var leadGenActive = readCookie("HideLeadGen") == "1" ? false : true;

    //var leadGenActive = $("#lead-gen").length > 0 ? true : false; // CG: Only if lead gen is present on the page. In the back end, it is not written to the page is the cookie "HideLeadGen" is present.
    if(leadGenActive && $("#hide-for-lead-gen").length > 0) {
        // CG: Hide the content we don't want the user to scroll past
        $("#hide-for-lead-gen, #accolade-slider, #footer-site").addClass("visually-hidden");
    } else {
        $("#lead-gen").remove();
    }

    $(document).on("scroll", function(e) {
        if(leadGenActive && $("#hide-for-lead-gen").length > 0) {
            // CG: Activate the lead gen banner when the user reaches the top of the "hidden" content
            var scrollBottom = $(window).scrollTop() + $(window).height();
            var targetDivPos = $("#hide-for-lead-gen").position().top - 100;

            if (scrollBottom >= targetDivPos && leadGenActive) {
                $("#lead-gen").slideDown("slow");
            } else {
                $("#lead-gen").slideUp("slow");
            }
        }
    });

    $("#lead-gen__submit-btn").on("click", function(e) {
        e.preventDefault();
        var fields = $("#lead-gen__form").find("input[data-required='true'], select[data-required='true']:visible, textarea[data-required='true']");

        if(requiredFieldsCompleted(fields)) {
            $("#loading-spinner--lead-gen").show();

            $.post("/api/CrmLeadGen/HandleProspectusRequest", {
                "ADD1": $("#address-1").val(),
                "ADD2": $("#address-2").val(),
                "CITYORTOWN": $("#city-or-town").val(),
                "COURSE_OF_SUBJECT": $("#COURSE_OF_SUBJECT").val(),
                "EMAIL": $("#email").val(),
                "FIRSTNAME": $("#firstname").val(),
                "LANDINGPAGE": $("#LANDINGPAGE").val(),
                "LASTNAME": $("#lastname").val(),
                "MARKETING_CAMPAIGN": $("#MARKETING_CAMPAIGN").val(),
                "MARKETING_MEDIUM": $("#MARKETING_MEDIUM").val(),
                "MARKETING_SOURCE": $("#MARKETING_SOURCE").val(),
                "MOBILENO": $("#mobileno").val(),
                "POSTCODE": $("#postcode").val(),
                "PREF_EMAIL":  $("[name='PREF_EMAIL']:checked").val(),
                "PREF_MAIL":  $("[name='PREF_MAIL']:checked").val(),
                "PREF_SMS": $("[name='PREF_SMS']:checked").val(),
                "PREF_TELEPHONE": $("[name='PREF_TELEPHONE']:checked").val(),
                "SUBJECT": $("#SUBJECT").val(),
                "YEAR_OF_ENTRY":  $("[name='YEAR_OF_ENTRY']:checked").val()
            })
            .done(function(data) {
                $("#loading-spinner--lead-gen").hide();
                // CG: Replace the form fields with the success message
                $("#lead-gen__form").html("<h2>Thank you!</h2><p class='font-3xl'>Your request has been sent.</p>");
                setCookie("HideLeadGen", 1, 30);
                setTimeout(function () {
                    $("#lead-gen-modal .modal__close").trigger("click");
                    $("#lead-gen__no-btn").trigger("click");
                }, 5000);
            })
            .fail(function() {
                $("#loading-spinner--lead-gen").hide();
                $("#lead-gen__form").html("<h2>An error occurred</h2><p class'font-3xl'>Sorry - there was a problem submitting your request. Please try again later.</p>");
            });
        } else {
            // CG: Invalid
        }
    });

    $("#lead-gen__no-btn").on("click", function(e) {
        e.preventDefault();
        $(".lead-gen").slideUp("slow");
        setCookie("HideLeadGen", 1, 30);
        leadGenActive = false;
        $("#hide-for-lead-gen, #accolade-slider, #footer-site").removeClass("visually-hidden");
        $('.slick-slider').slick('refresh');
    });
};
