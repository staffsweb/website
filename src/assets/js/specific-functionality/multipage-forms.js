let multipageFormInit = function() {

    // CG: Check each field in turn when the user clicks off it
    $(".crm-form input, .crm-form select, .crm-form textarea").on("blur change ifChanged", function() {

        if($(this).attr("data-required") == "true") {
            var fieldId = $(this).attr("id");
            var $label = $("label[for='" + fieldId + "']");

            if(!isValid($(this))) {
                $(this).addClass("sys_cms-form-error");
                if(fieldId == "ENQUIRY")
                {
                    $(this).attr("placeholder","Please enter your enquiry");
                } else {
                    $(this).attr("placeholder","Please complete this field");
                }
            } else {
                $(this).removeClass("sys_cms-form-error");
                $(this).removeAttr("placeholder");
            }
            
            // CG: Activate the "submit" button only if all required fields have been completed
            checkForInvalidFields();
        }
    });

    $("[data-tooltip='true']").on("mouseover focusin", function() {
        // CG: Show the tooltips where appropriate
        $("#instructions-" + $(this).attr("id")).slideDown("fast");
    }).on("mouseout focusout", function() {
        $("#instructions-" + $(this).attr("id")).slideUp("fast");
    });

    function checkForInvalidFields() {
        // CG: Count the invalid fields, then enable / disable the "submit" button as appropriate
        var invalidFieldCount = 0;
        var radioButtonNames = [];

        $(".crm-form input:visible[data-required='true']:not([type='radio']), .crm-form select:visible[data-required='true'], .crm-form textarea:visible[data-required='true']").each(function() {
            if(!isValid($(this))) {
                invalidFieldCount++;
                //console.log($(this).attr("id") + " is invalid");
            }
        });

        // CG: Check radio buttons separately:
        // CG: ================================
                    
        $(".crm-form input[data-required='true'][type=radio]").each(function() {
            // CG: Get the names of all radio buttons that are required
            radioButtonNames.push($(this).attr("name"));
        });

        // CG: Reduce to only the unique names
        radioButtonNames = radioButtonNames.filter(onlyUnique);
                
        for(var i = 0; i < radioButtonNames.length; i++) { 
            // CG: Check that at least one radio button with that name has been selected 
            if (!$(".crm-form input[name='" + radioButtonNames[i] + "']:checked").val()) {
                invalidFieldCount++;
                //console.log("Missing radio button " + radioButtonNames[i]);
            }
        }

        console.log(invalidFieldCount + " fields are invalid");

        if(invalidFieldCount > 0) {
            $("#submit-btn").attr("disabled","disabled");
        } else {
            $("#submit-btn").removeAttr("disabled");
        }
    }

    function onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
    }

    // CG: Validate a single field
    function isValid($obj) {
        var valueToCheck = "";

        // CG: Handle <select> elements differently
        if($obj.prop("tagName") == "SELECT") {
            valueToCheck = $obj.find(":selected").val();
        } else {
            valueToCheck = $obj.val();
        }
        
        // CG: Specific check for email fields
        if($obj.attr("type") == "email") {
            // CG: Apply regex for email address
            if(!validateEmail($obj.val())) {
                return false;
            }
        }

        // CG: Check all other types of fields
        if(valueToCheck == "") {
            //console.log($obj.prop("id") + " is invalid");
            return false;
        } else {
            return true;
        }
    }

    $("#submit-btn").click(function() {        

        // CG: Show the preloader when the form is submitted
        $(this).hide();
        $("#submit-preload").show();
    });

    // CG: Strip all non-numeric spaces from Phone no
    $('#MOBILENO').on("blur change",function() {													
        $(this).val($(this).val().replace(/\D/g, ''));	
    });

    // CG: Reveal the GDPR fields when the relevant option is selected
    $('#keep-in-touch-yes').on('change', function() {	
        $('#gdpr-fields').slideDown();
        // CG: Add the 'required' attribute
        $('#gdpr-fields input').attr('required','required');
    });

    $('#keep-in-touch-no').on('change', function() {	
        $('#gdpr-fields').slideUp();
        // CG: Remove the 'required' attribute and deselect
        $('#gdpr-fields input').removeAttr('required').prop('checked',false);
        $('input[id *= cd_PREF').val('No');	
    });

    // CG: Change the value of the relevant hidden field when a 'PREF' radio button is selected. This allows a default of 'no'
    $('input[id *= PREF_]').on('change ifChanged',function() {        
        var elementToChangeId = '#cd_' + $(this).attr('name');
        var valueToPass = $(this).val();
        $(elementToChangeId).val(valueToPass);
    });

    $('#prev-student-yes').on('ifChecked', function(event){
        $("#graduation-year-selector").slideDown();
        // CG: Make "year of graduation" compulsory
        $("#GRADUATION_YEAR").attr("data-required","true");
        checkForInvalidFields();
    });

    $('#prev-student-no').on('ifChecked', function(event){
        $("#graduation-year-selector").slideUp();
        // CG: Make "year of graduation" optional
        $("#GRADUATION_YEAR").removeAttr("data-required");
        checkForInvalidFields();
    });

    function validateEmail(address) {
        var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(address);
    }

    // CG: Prevent the "whole page" form from being submitted if the user presses ENTER
    $('#dotmailer-form, .crm-form').keyup(function (e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);

        if (keycode == '13') {
            console.log("ENTER key pressed");
            $('#form1').on('submit', function (e) {
                e.preventDefault();
            });
            e.stopImmediatePropagation();
        }
        e.preventDefault();
    });
// =====================================================================
//            CG: New forms functionality, December 2019
// =====================================================================

// CG: UG Open Day booking form: Show matching courses when the user chooses a subject area, or if it's pre-selected
    $("body").on("change", ".crm-form--ug-open-day-booking #subject, .crm-form--prospectus-request #subject", revealCourseSelector);

    if(getQueryVariable("subject") != "") {
        revealCourseSelector();
    }

    var noOfPages = $(".crm-form__page").length;
    var currentPage = 1;

    $(".crm-form__next-btn").on("click", function(e) {
        e.preventDefault();

        var targetPageNo = $(this).attr("data-target");

        // CG: Perform validation if the "next" button is clicked
        if($(this).hasClass("right")) {
            var fields = $(document).find(".crm-form__page:visible input[data-required='true'], .crm-form__page:visible select[data-required='true']:visible, .crm-form__page:visible textarea[data-required='true']");

            if(requiredFieldsCompleted(fields)) {
                switchToPage(targetPageNo);
            }
        }
    });

    $(".crm-form__prev-btn").on("click", function(e) {
        e.preventDefault();
        var targetPageNo = $(this).attr("data-target");
        switchToPage(targetPageNo);
    });

    $("#crm-form__final-btn").on("click", function(e) {
        // CG: "Dummy" submit button that allows us to validate the last page of the form
        e.preventDefault();

        // CG: Perform validation if the "next" button is clicked
        var fields = $(".crm-form__page:visible").find("input[data-required='true'], select[data-required='true']:visible, textarea[data-required='true']");

        if(requiredFieldsCompleted(fields)) {
            $(this).hide();
            $("#submit-btn").show().click();
            showLoadingSpinner("Sending - please wait");
        }

        return false;
    });

    // CG: Prevent the "whole page" form from being submitted if the user presses ENTER
    $('.crm-form').keyup(function (e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);

        if (keycode == '13') {
            console.log("ENTER key pressed");
            $('#form1').on('submit', function (e) {
                e.preventDefault();
            });
            e.stopImmediatePropagation();
        }
        e.preventDefault();
    });

    // CG: Enquiry form: show matching courses only if "Undergraduate" has been selected as the level
    $(".crm-form--enquire-online #subject, .crm-form--enquire-online #level-of-study, .crm-form--international-enquiry #subject, .crm-form--international-enquiry #level-of-study").on("change", function() {
        if($("#level-of-study").find(":selected").text() == "Undergraduate" || $("#level-of-study").find(":selected").text() == "Bachelor degree")
        {
            revealCourseSelector();
        } else {
            hideCourseSelector();
        }
    });


    // CG: UG Open Day booking form: Show matching courses when the user chooses a subject area, or if it's pre-selected
    $(".crm-form--ug-open-day-booking #course").on("change", revealLocation);

    $("#location-selector").on("check ifChecked", function() {
        showLoadingSpinner();
        var location = $(this).find(":checked").val();	
        console.log("location = " + location);	
        showAvailableDates(location);
    });

    // CG: PG Event form: if a previous student, show the year of graduation
    $(".crm-form--pg-open-event-booking input[name='PREV-STUDENT']").on("ifChecked", function(e) {
        if($(this).attr("id") == "prev-student-yes") {
            // Show the graduation year
            $("#prev-student-graduation-year").slideDown();
        } else {
            // Hide the graduation year
            $("#prev-student-graduation-year").slideUp();
            // Revert to "blank" option
            $("#graduation-year").prop("selectedIndex", 0);
        }
    });

    // CG: OHD form: additional validation step because it's a single page
    $(".crm-form--ohd-booking").on("change", "input", function() {
        // If there are no errors, enable the "submit" button
        if($(".sys_cms-form-error").length == 0 && $("input[name='openday-event-code']:checked").length > 0) {
            $("#ohd-form__book-btn").removeAttr("disabled")
        } else {
            $("#ohd-form__book-btn").attr("disabled","disable");
        }
    });

    /*// CG: OHD form: additional validation step for when a date is selected
    $(".crm-form--ohd-booking").on("change", "input[name='openday-event-code']", function() {
        // If at least one date is selected, enable the "submit" button
        if($("input[name='openday-event-code']:checked").length > 0 && $(".sys_cms-form-error").length == 0) {
            $("#ohd-form__book-btn").removeAttr("disabled")
        }
    });*/
    $("#ohd-form__book-btn").on("click", function() {
        $(this).text("Sending - please wait...").attr("disabled","disabled");
    })

    // CG: All forms: show the address fields when the postcode is focussed on
    $(".crm-form #postcode").on("focus", function() {
        $("#address-confirmation").slideDown("fast");
    });

    // CG: SUL forms: Automatically select the level of study and the subject, based on which course has been selected
    $("body").on("change", ".crm-form--london #course, .crm-form--london #course-ldn", function() {
        var levelKey = $(this).find(":selected").data("study-level");
        $("#study-level").val(levelKey);

        var subjectArea = $(this).find(":selected").data("subject-area");
        $("#subject-area").val(subjectArea);
    });

    function switchToPage(no) {
        $(".crm-form__page:visible").fadeOut(200, function() {
            $(".crm-form__page[data-page-no='" + no + "']").fadeIn("fast");
        });

        // CG: Update the progress indicator
        $(".crm-form__step").removeClass("current").removeClass("completed");
        for(var i = 1; i < no; i++) {
            $(".crm-form__step[data-page-no='" + i + "']").addClass("completed");
        }
        $(".crm-form__step[data-page-no='" + no + "']").addClass("current");

        // CG: Scroll to the top of the form
        if($('html').offset().top < $('.crm-form').offset().top) {
            $("html, body").animate({
                    scrollTop: $('.crm-form').offset().top
                }, 500
            );
        }
    }

    // CG: Automatically select nationality based on country
    $(".crm-form--international-enquiry #country-selector").on("change", function(e) {
        // CG: International enquiry form: hide nationality for UK-based users
        var countryName = $(this).find(":selected").attr("data-country-id");
        console.log("countryName = " + countryName);
        // CG: UK has ID of 0
        if(countryName == "000")
        {
            $("#nationality-selector").val("");
            $("#nationality-selector-container").slideUp();
            
            console.log("route = UK");

            $("#mobile-hint").text("");
            $("#level-of-study").empty().html("<option value='' selected='selected'>Please select a level</option><option value='215500000'>Undergraduate</option><option value='215500001'>Postgraduate</option><option value='215500002'>Continuing Professional Development</option><option value='215500003'>Apprenticeship</option><option value='215500004'>Conversion</option><option value='215500005'>Higher and Degree Apprenticeships</option><option value='215500006'>Other</option>");
            $("#mode-of-study").empty().html("<option value='' selected=''>Please choose a mode of study</option><option value='215500002'>Conventional 3 year degree</option><option value='215500003'>Sandwich degree</option><option value='215500000'>Part time</option><option value='215500004'>Distance learning</option><option value='215500005'>2 year accelerated</option><option value='215500006'>Blended learning</option>");
        }
        else
        {
            // CG: Non-UK route
            var nationalityName = $(this).find(":selected").data("citizen-name");
            console.log("Nationality = " + nationalityName);

            $("#nationality-selector-container").slideDown();
            $("#nationality-selector").val(nationalityName);
            console.log("route = Non-UK");
            // CG: Add the note about the country code to the phone no.
            $("#mobile-hint").text("Please include the country code, e.g. +44");
            // Change level of study
            $("#level-of-study").empty().html("<option value='' selected='selected'>Please select a level</option><option value='215500000'>Bachelor degree</option><option value='215500001'>Master degree</option>"); // Bachelor degree or Master degree
            // Change mode of study
            $("#mode-of-study").empty().html("<option value='' selected='selected'>Please choose a mode of study</option><option value='215500002'>On campus</option><option value='215500004'>Online</option>"); // On campus / online
        }
        
    });

    $(document).on("change", ".crm-form--international-enquiry #nationality-selector", function(e) {
        // CG: International enquiry form: hide nationality for UK-based users
        var nationalityName = $(this).find(":selected").val();
        console.log("Nationality = " + nationalityName);
    });

    $("#enter-address-btn, .btn--enter-address").on("click", function(e) {
        e.preventDefault();
        $("#address-confirmation").slideDown("slow");
    });

    $("#consent-to-all-btn").on("click", function(e) {
        e.preventDefault();
        // CG: Set all buttons to "yes"
        $("#pref-sms-yes, #pref-email-yes, #pref-mail-yes, #pref-tel-yes").iCheck("check");
    });

    $(".crm-form input[type='submit']").on("click", function(e) {        
        // CG: Change the text when the form is submitted, and show the "loading" spinner
        $(this).text("Please wait...").attr("disabled", "disabled");
        showLoadingSpinner();
    });

    // CG: Set up the the page indicators
    if(noOfPages > 1) {
        $(".crm-form__page").each(function(index, el) {
            var pageNo = index + 1;
            var pageTitle = $(this).find(".crm-form__page-title").text();
            var activeClass = pageNo == 1 ? "current" : "";
            //$(".crm-form__progress-indicator").append('<div class="crm-form__step-no ' + activeClass + ' flex-col" data-page-no="' + pageNo + '">' + pageNo + '. ' + pageTitle + '</div>');
            $(".crm-form__progress-indicator").append('<li class="crm-form__step ' + activeClass + ' flex-col" data-page-no="' + pageNo + '"><span class="crm-form__step-no">' + pageNo + '</span> ' + pageTitle + '</li>');
        });
    }

    // CG: Populate the UTMZ cookie fields
    var cookieContent = readCookie('__utmz');

    if(cookieContent != "") {	
        $('#cookie-content').text(cookieContent);				

        var pattern = new RegExp("utmccn=[^\|]*");
        var campaign = pattern.exec(cookieContent).toString().replace("utmccn=","");
        $('#MARKETING_CAMPAIGN').val(campaign);	

        pattern = new RegExp("utmcsr=[^\|]*");
        var source = pattern.exec(cookieContent).toString().replace("utmcsr=","");				
        $('#MARKETING_SOURCE').val(source);

        pattern = new RegExp("utmcmd=[^\|]*");
        var medium = pattern.exec(cookieContent).toString().replace("utmcmd=","");				
        $('#MARKETING_MEDIUM').val(medium);
    }

    // CG: Only allow the user to change "pages" if the required fields are completed
    function requiredFieldsCompleted(fields) {
        var errorsFound = false;
        $(".crm-form__error-msg").remove();

        $.each(fields, function(i, field) {
            if(!fieldIsValid(field)) {
                errorsFound = true;

                // CG: Reveal the address fields if the postcode is missing, otherwise the user won't see what's causing the problem
                if(field.name == "ADD1") {
                    $("#address-confirmation").slideDown();
                }
            }
        });
        if(errorsFound && $(".crm-form--prospectus-request-lead-gen").length == 0) {
            // CG: Scroll to the first invalid field
            $("html, body").animate({
                    scrollTop: $(".sys_cms-form-error:first").offset().top - 30
                }, 500
            );
        }
        return !errorsFound;
    }

    function fieldIsValid(field) {
        // CG: Get the field DOM object based on the name
        var $field = $("[name='" + field.name + "']");
        var $label = $("label[for='" + field.id + "']");

        $field.removeClass("sys_cms-form-error");
        $label.removeClass("sys_cms-form-error");
        
        // CG: Validate checkboxes / radio buttons
        // Get all the inputs with the same name, and check if at least one of them is checked
        if($field.attr("type") == "checkbox" || $field.attr("type") == "radio") {

            var $fieldset = $field.closest("fieldset");

            if($("[name='" + field.name + "']:checked").length == 0) {
                // CG: Add error message to the <fieldset>, if there isn't one already
                if($fieldset.find(".crm-form__error-msg").length == 0)
                {
                    $fieldset.append("<p class=crm-form__error-msg>Please select an option</p>");
                }
                console.log(field.name + " is invalid");

                return false;
            }
        }

        // CG: Validate email fields
        if($field.attr("type") == "email") {
            // CG: Apply regex for email address
            var $container = $field.parent();

            if(!validateEmail($field.val())) {
                $field.addClass("sys_cms-form-error");
                
                $container.append("<p class=crm-form__error-msg>Please enter a valid email address</p>");
                //$field.attr("placeholder","Please enter a valid email address");
                return false;
            } else {
                $container.remove(".crm-form__error-msg");
            }
        }

        if($field.val() == "") {
            $field.addClass("sys_cms-form-error")	
            if($field.prop("tagName") != "SELECT") {
                // CG: Check for an existing placeholder, and use that if it's present
                var placeHolderText = $field.attr("data-invalid-message");
                if(placeHolderText != "")
                {
                    $field.attr("placeholder", placeHolderText);
                } else {
                    $field.attr("placeholder", "Please complete this field");
                }
            }

            return false;
        }
        return true;
    }

    function showAvailableDates(location) {
        var noOfDates = 0;

        $("#date-selector").empty().show();

        // CG: Get the dates for the appropriate location
        $.getJSON("/site-elements/razor/lookup/look-up-open-day-by-location.cshtml?studyLevel=Undergraduate&location=" + location, function(data) {

            noOfDates = data.length;
            var selectedText = '';

            if(noOfDates == 0) {
                $("#date-selector").append("<p>Sorry, there are no open day dates available for " + location + ".</p>");
            } else {
                $("#date-selector").append("<p><strong>Which date would you like to attend? *</strong></p>");
                $.each(data, function(key,val) {
                    // CG: Select the first upcoming date by default
                    if(key == 0) {
                        selectedText = 'checked="checked"';
                    } else {
                        selectedText = '';
                    }
                    $("#date-selector").append('<label for="date-' + key + '"><input type="radio" name="OPENDAY_EVENT_CODE" id="date-' + key + '" value="' + val['eventCode'] + '" required="required" data-required="true" ' + selectedText + ' /> ' + val['date'] + ' <span class="date-selector__time">' + val['startTime'] + '-' + val['endTime'] + '</span></label><br />');
                });
            }
        }).done(function() {
            $("#date-selector").find("input").iCheck();
            $("#loading-spinner").hide();
        });
    }

    function revealCourseSelector() {
        var subjectKey = $("#subject").find(":selected").data("subject-key");
        $("#date-selector").empty();
        $("#location-selector").hide();
        $("#course-selector-hidden").fadeOut("fast");
        $(".crm-form #course").empty().append("<option value='' selected>Please choose a course</option>");
        showLoadingSpinner("Loading courses - please wait");

        $.getJSON("/site-elements/razor/lookup/look-up-course-by-subject.cshtml?subjectArea=" + subjectKey, function(data) {

            $.each(data, function(key,val) {
                // CG: If a course has been pre-selected via the URL string, flag the appropriate one, and show the available dates
                if(getQueryVariable("course") == val['courseTitle']) {
                    $(".crm-form #course").append('<option value="' + val['courseTitle'] + '" data-marketing-group="' + val['marketingGroup'] + '" selected>' + val['courseTitle'] + '</option>');
                    revealLocation();
                } else {
                    $(".crm-form #course").append('<option value="' + val['courseTitle'] + '" data-marketing-group="' + val['marketingGroup'] + '">' + val['courseTitle'] + '</option>');
                }
            });			
        }).done(function() {
            $("#loading-spinner").hide();
        });
        
        $("#location-name").slideUp("fast");
            
        $("#course-selector-hidden").fadeIn("fast");
    }

    function showLoadingSpinner(message) {
        if(message === undefined)
        {
            message = "Loading - please wait";
        }
        $("#loading-spinner__text").html(message + "&hellip;");
        $("#loading-spinner").show();
    }

    function hideCourseSelector() {
        $("#course-selector-hidden").fadeOut("fast");
        $("#course").prop("selectedIndex", 0);
    }

    function revealLocation() {
        // CG: Get the location of the course
        var marketingGroup = $("#course").find(":selected").data("marketing-group");
        var noOfLocations = 0;
        $("#location-selector").empty().show();
        showLoadingSpinner("Loading locations - please wait");

        // CG: Get the location(s) for the appropriate course, via Marketing Group
        $.getJSON("/site-elements/razor/lookup/look-up-locations-by-course.cshtml?marketingGroup=" + marketingGroup, function(data) {
            noOfLocations = data.length;

            if(noOfLocations == 1) {
                // CG: If there is only one location, skip straight to the dates
                var location = data[0].location;
                $("#location-name").show().text("This course is based at our " + location);
                showAvailableDates(location);
            } else {
                $("#location-name").show().text("This course is offered at multiple campuses - please choose one:");
                $.each(data, function(key,val) {
                    $("#location-selector").append('<input type="radio" class="label--padded" name="LOCATION" id="location-' + key + '" value="' + val['location'] + '" required data-required=true> <label for="location-' + key + '">' + val['location'] + '</label>');								
                });
            }

        }).done(function() {
            $("#location-selector").find("input").iCheck();
            $("#loading-spinner").hide();
        });
    }

    // CG: Populate the relevant form fields from the '__utmz' cookie
    function readCookie(name) {
        var regex = new RegExp("[; ]" + name + "=([^\\s;]*)");
        var match = (" " + document.cookie).match(regex);
        if (name && match) {
            return unescape(match[1]);
        } else {
            return "";
        }
    }

    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }

    // CG: Retrieve the value of a GET variable from the URL string. From css-tricks.com.
    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                if(pair[0] == variable){return decodeURI(pair[1]);}
        }
        return(false);
    }

    function validateEmail(address) {
        var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(address);
    }

    // CG: Hide the loading spinner on the UG Open Day form once everything is loaded
    $("#initial-loading-spinner").hide();
};