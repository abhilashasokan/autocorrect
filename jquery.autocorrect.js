/**
 * jQuery auto-correct plugin
 * Version 1.0
 * Copyright (c) 2009 Amit Badkas <amit@sanisoft.com>
 * Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Added custom feature to support content editable div Abhilash Asokan <abhilashasokan@icloud.com>
 */

// Wrap in a closure
jQuery.fn.autocorrect = function(options) {
    // If plugin attached to text/textarea field then don't need to proceed further
    //console.log(jQuery(this).attr("type"));
    /*
    if (0 > jQuery.inArray(jQuery(this).attr("type"), new Array("text", "textarea", "div"))) {
        return;
    }
    */
    // Default parameters for plugin with some default corrections
    $(document).click(function(e) {
        $(document).find('.actiObjectSelected').removeClass("actiObjectSelected");
        $("#" + e.target.id).addClass("actiObjectSelected");
    });
    if (typeof(Storage) !== "undefined") {
        var retrievedObject = localStorage.getItem('defaultCorrections');
        corrections = JSON.parse(retrievedObject)
    } else {
        console.log("Sorry! No Web Storage support..");
        return false;
    }

    var defaults = {
        corrections
    };

    // Merge corrections passed at run-time
    if (options && options.corrections) {
        options.corrections = jQuery.extend(defaults.corrections, options.corrections);
    }

    // Merge options passed at run-time
    var opts = jQuery.extend(defaults, options);

    // Function used to get caret's position
    getCaretPosition = function(editableDiv) {
        var selection = window.getSelection(),
            selectedText = selection.toString(),
            selectedRange = selection.getRangeAt(0);
        //console.log(selectedRange.startOffset);
        /*
        var caretPos = 0,
            sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
                if (range.commonAncestorContainer.parentNode == editableDiv) {
                    caretPos = range.endOffset;
                }
            }
        }
        */
        return selectedRange.startOffset;
    }

    function SetCaretPosition(object, pos) {
        // Get key data
        var el = object.get(0); // Strip inner object from jQuery object
        var range = document.createRange();
        var sel = window.getSelection();

        // Set the range of the DOM element
        range.setStart(el.childNodes[0], pos);
        range.collapse(true);

        // Set the selection point
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // Capture 'on key up' event for auto-correction
    this.keyup(function(e) {
        var activeElement = document.activeElement;
        var activeObject = $(activeElement).find('.actiObjectSelected');

        // If currently entered key is not 'space' then don't need to proceed further
        if (32 != e.keyCode) {
            return;
        }

        // Get caret's current position
        var caretPosition = (getCaretPosition(this) - 1);

        // If caret's current position is less than one then don't need to proceed further
        if (1 > caretPosition) {
            return;
        }

        // Value of current field
        if (activeObject.length > 0) {
            var valueOfField = activeObject[0].innerHTML;
        } else {
            var valueOfField = document.activeElement.innerHTML;
        }

        console.log(valueOfField);

        // Get value of field upto caret's current position from start 
        var stringUptoCaretPosition = (valueOfField).substr(0, caretPosition);

        // If more than one 'space' continuously then don't need to proceed further
        if (" " == stringUptoCaretPosition.charAt(caretPosition - 1)) {
            return;
        }

        // Split string into array using space
        var stringToArray = stringUptoCaretPosition.split(" ");

        // Get last index of array
        var lastIndexOfArray = (stringToArray.length - 1);

        // Get last element of array as string to search for correction
        var stringToSearch = stringToArray[lastIndexOfArray].toLowerCase();

        // If string to search don't have any matching record in corrections then don't need to proceed further
        if (!opts.corrections[stringToSearch]) {
            return;
        }
        // Build string to replace using correction
        var stringToReplace = opts.corrections[stringToSearch];

        // Store replaced string back to array as last element
        stringToArray[lastIndexOfArray] = stringToReplace;
        // Join the array to build new string
        stringUptoCaretPosition = stringToArray.join(" ");

        //console.log(stringUptoCaretPosition);
        // Get value of field upto end from caret's current position
        var stringFromCaretPositionUptoEnd = (valueOfField).substr(caretPosition);


        // Set new value of field
        this.value = (stringUptoCaretPosition + stringFromCaretPositionUptoEnd);
        //console.log(this.value);

        // Set caret's position
        if (activeObject.length > 0) {
            $(activeObject).html(this.value);
            var node = activeObject;
        } else {
            $(document.activeElement).html(this.value);
            var node = document.activeElement;
        }

        //window.getSelection().setPosition(0);
        var caret = caretPosition + (stringToReplace.length - stringToSearch.length);
        SetCaretPosition(node, caret);
    });
};
