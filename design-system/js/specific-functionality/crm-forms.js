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

function isValidEmailAddress(address) {
	var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return regex.test(address);
}

function isValidPhoneNo(no) {
	// CG: Validates a UK telephone no.
	var regex = /^\s*(([+]\s?\d[-\s]?\d|0)?\s?\d([-\s]?\d){9}|[(]\s?\d([-\s]?\d)+\s*[)]([-\s]?\d)+)\s*$/;
	return regex.test(no);
}

function isValidPostcode(postcode)
{
	var regex = /^[a-zA-Z]{1,2}\d[a-zA-Z\d]? ?\d[a-zA-Z]{2}$/;
	return regex.test(postcode);
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
		if(!isValidEmailAddress($obj.val())) {
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

// CG: Only allow the user to change "pages", or submit, if the required fields are completed
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
	if(errorsFound) {
		// CG: Scroll to the first invalid field
		$("html, body").animate({
				scrollTop: $(".form--invalid:first").offset().top - 30
			}, 500
		);
	}
	return !errorsFound;
}

function fieldIsValid(field) {
	// CG: Get the field DOM object based on the name
	var $field = $("[name='" + field.name + "']");
	var $label = $("label[for='" + field.id + "']");

	$field.removeClass("form--invalid");
	$label.removeClass("form--invalid");
	
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

		if(!isValidEmailAddress($field.val())) {
			$field.addClass("form--invalid");
			
			$container.append("<p class=crm-form__error-msg>Please enter a valid email address</p>");
			//$field.attr("placeholder","Please enter a valid email address");
			return false;
		} else {
			$container.remove(".crm-form__error-msg");
		}
	}

	if($field.val() == "") {
		$field.addClass("form--invalid")	
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

let crmFormsInit = function() {
	
	// CG: Validation: check each field in turn when the user clicks off it
    $(".crm-form input, .crm-form select, .crm-form textarea").on("blur change", function() {

        if($(this).attr("data-required") == "true") {
            var fieldId = $(this).attr("id");
            var $label = $("label[for='" + fieldId + "']");

            if(!isValid($(this))) {
                $(this).addClass("form--invalid");
                if(fieldId == "ENQUIRY")
                {
                    $(this).attr("placeholder","Please enter your enquiry");
                } else {
                    $(this).attr("placeholder","Please complete this field");
                }
            } else {
                $(this).removeClass("form--invalid");
                $(this).removeAttr("placeholder");
            }
            
            // CG: Activate the "submit" button only if all required fields have been completed
            checkForInvalidFields();
        }
	});
	
	// CG: Strip all non-numeric spaces from Phone no
    $('#MOBILENO').on("blur change",function() {													
        $(this).val($(this).val().replace(/\D/g, ''));	
    });
	
    $("#consent-to-all-btn").on("click", function(e) {
		e.preventDefault();
		// CG: Set all buttons to "yes"
		$("#pref-sms-yes, #pref-email-yes, #pref-mail-yes, #pref-tel-yes").prop("checked", true);
	});
};