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
        return caretPos;
    }



    // Capture 'on key up' event for auto-correction
    this.keyup(function(e) {
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
        var valueOfField = e.currentTarget.innerHTML;
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
        // Set caret's position
        $(this).html(this.value);

        var node = this;
        node.focus();
        var textNode = node.firstChild;
        var caret = caretPosition + (stringToReplace.length - stringToSearch.length);
        var range = document.createRange();
        range.setStart(textNode, caret);
        range.setEnd(textNode, caret);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

    });
};
