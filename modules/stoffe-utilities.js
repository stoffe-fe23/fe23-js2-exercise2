/*
    General utility functions
    By Kristoffer Bengtsson
*/


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Set an event listener on the element(s) matching the targetIdentifier selector, if any exist.
// Return an array with all matching elements. 
export function setEventListener(targetSelector, eventType, eventCallback) {
    const eventTargets = document.querySelectorAll(targetSelector);
    const targetElements = [];
    if ((eventTargets !== undefined) && (eventTargets !== null)) {
        eventTargets.forEach((eventTarget) => {
            eventTarget.addEventListener(eventType, eventCallback);
            targetElements.push(eventTarget);
        });
    }
    return targetElements;
}


///////////////////////////////////////////////////////////////////////////////////////////
// Convert a timestamp number to a displayable date string using the formatting of the
// specified language locale (e.g. 'sv-SE', 'en-US' etc), or the browser language 
// if none is specified. 
export function timestampToDateTime(timestamp, isMilliSeconds = true, locale = null) {
    const dateObj = new Date(isMilliSeconds ? timestamp : timestamp * 1000);
    const formatLocale = (locale ?? navigator.language);
    const formatOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    };

    return new Intl.DateTimeFormat(formatLocale, formatOptions).format(dateObj);
    // return `${dateObj.toLocaleDateString(formatLocale)} ${dateObj.toLocaleTimeString(formatLocale)}`;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Return a string cropped down to a maximum number of characters. The function will cut off the
// string at the closest space character before the max-length to avoid cutting in the middle of words.
export function getTruncatedString(truncText, maxLength) {
    if (maxLength < truncText.length) {
        let cutOffLength = truncText.lastIndexOf(" ", maxLength);
        if (cutOffLength < 1) {
            cutOffLength = maxLength;
        }
        truncText = truncText.slice(0, cutOffLength) + "…";
    }
    return truncText;
}


///////////////////////////////////////////////////////////////////////////////////////////
// Get the first parent of the start element that has the specified class
export function getFirstParentElementByClass(startElement, className, maxDepth = 10) {
    let checkElement = startElement.parentElement;
    while ((!checkElement.classList.contains(className)) && (maxDepth > 0)) {
        maxDepth--;
        checkElement = checkElement.parentElement;
    }
    return (checkElement.classList.contains(className) ? checkElement : null);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Set the content of an element to a string that may only contain whitelisted HTML elements
// contentString = string with the content to assign to the element
// contentElement = the HTML element to assign the content to
// allowedTags = array with the names of tags that are allowed to be used in the content (i.e. ['strong', 'em'])
// allowedAttributes = array with the names of attributes that may be used on allowed tags in the content
export function setContentWithTagFilter(contentString, contentElement, allowedTags = null, allowedAttributes = null) {
    const tempElement = document.createElement("template");
    tempElement.innerHTML = contentString;

    if ((contentElement === undefined) || (contentElement === null)) {
        contentElement = document.createElement("div");
    }

    if ((allowedTags === undefined) || (allowedTags === null) || (allowedTags.length < 1)) {
        allowedTags = ['strong', 'em', 'b', 'i', 'a', 'blockquote'];
    }
    if ((allowedAttributes === undefined) || (allowedAttributes === null) || (allowedAttributes.length < 1)) {
        allowedAttributes = ['href', 'src', 'alt', 'class', 'id', 'target'];
    }

    allowedTags = allowedTags.map((elem) => elem.toUpperCase());
    allowedAttributes = allowedAttributes.map((elem) => elem.toLowerCase());

    copyContentWithFilteredTags(tempElement.content, contentElement, allowedTags, allowedAttributes);
    return contentElement;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper function for setContentWithFilteredTags(), step through the baseElement and copy allowed child elements
// to the target element and add the test as text. 
function copyContentWithFilteredTags(baseElement, copyElement, allowedTags, allowedAttributes) {
    if (baseElement.childNodes.length > 0) {
        baseElement.childNodes.forEach((checkChild) => {
            if (checkChild.nodeType == Node.ELEMENT_NODE) {
                let currElement;
                if (allowedTags.includes(checkChild.tagName)) {
                    currElement = document.createElement(checkChild.tagName);
                    for (const attrib of checkChild.attributes) {
                        if (allowedAttributes.includes(attrib.name)) {
                            currElement.setAttribute(attrib.name, attrib.value);
                        }
                    }
                    copyElement.appendChild(currElement);
                }
                else {
                    currElement = copyElement;
                }
                copyContentWithFilteredTags(checkChild, currElement, allowedTags, allowedAttributes);
            }
            else if (checkChild.nodeType == Node.TEXT_NODE) {
                const currElement = document.createTextNode(checkChild.textContent);
                copyElement.appendChild(currElement);
            }
        });
    }
}


///////////////////////////////////////////////////////////////////////////////////////////
// Split up a string into the specified tag, and everything else, returned as an array.
// I.e:
// const chunks = splitStringByTag(myString, '<a class="text-link" ', '</a>')
// ... would return an array where links starting with '<a class="text-link' and are closed by
// '</a>' are split out from the rest of the text. 
export function splitStringByTag(textString, openTag, closeTag, tagName = 'tag') {
    const fragments = [];

    let openIdx = 0;
    let closeIdx = 0;
    let prevIdx = 0;
    while (prevIdx < textString.length) {
        openIdx = textString.indexOf(openTag, closeIdx);

        if (openIdx == -1) {
            openIdx = textString.length;
            closeIdx = openIdx;
            fragments.push({ value: textString.substring(prevIdx, openIdx), type: "text" });
        }
        else {
            closeIdx = textString.indexOf(closeTag, openIdx) + closeTag.length;
            fragments.push({ value: textString.substring(prevIdx, openIdx), type: "text" });
            fragments.push({ value: textString.substring(openIdx, closeIdx), type: tagName });
        }

        prevIdx = closeIdx;
    }

    return fragments;
}


///////////////////////////////////////////////////////////////////////////////////////////
// OLD: Use setContentWithTagFilter() instead if possible... 
// Allow a specific tag but not other kinds of HTML in the textString string, setting it as
// the content of the targetElement. 
// I.e:
// setTextWithTag(myElement, myString, 'a', '<a class="text-link" ', '</a>')
// ... would set the content of the myElement DOM element to the content of myString, where
// if it contains anchor tags starting with '<a class="text-link' those will be treated as
// HTML, while the rest of the string is treated as text. 
// If allowedAttributes is set to an array the attributes listed within will be copied over
// to the tag. 
// Remember to set white-space: pre-wrap; on the container/target element to preserve
// newlines in the text (if desired, similar to innerText). 
export function setTextWithTag(targetElement, textString, tagName, openTag, closeTag, allowedAttributes = null) {
    const textFragments = splitStringByTag(textString, openTag, closeTag);
    allowedAttributes = (allowedAttributes ?? ['href', 'src', 'target']);
    targetElement.innerHTML = "";

    for (const fragment of textFragments) {
        if (fragment.type == "tag") {
            const newSubElement = document.createElement(tagName);
            const tempElement = document.createElement("template");
            tempElement.innerHTML = fragment.value;

            newSubElement.innerText = tempElement.content.firstElementChild.innerText;
            newSubElement.className = tempElement.content.firstElementChild.className;
            newSubElement.id = tempElement.content.firstElementChild.id;

            if (getIsValidArray(allowedAttributes, 1)) {
                for (const attributeName of allowedAttributes) {
                    if ((tempElement.content.firstElementChild[attributeName] !== undefined) && (tempElement.content.firstElementChild[attributeName] !== null)) {
                        newSubElement[attributeName] = tempElement.content.firstElementChild[attributeName];
                    }
                }

            }
            tempElement.remove();
            targetElement.appendChild(newSubElement);
        }
        else {
            targetElement.appendChild(document.createTextNode(fragment.value));
        }
    }
}



///////////////////////////////////////////////////////////////////////////////////////////
// Utility to determine if a text variable has been set and assigned a value.
export function getIsValidText(text, lengthLimit = 1) {
    return ((text !== undefined) && (text !== null) && (text.length !== undefined) && (text.length >= lengthLimit));
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Kontrollera om angiven parameter är ett giltigt nummer
export function getIsValidNumber(number) {
    return (number !== undefined) && (number !== null) && !isNaN(number);
}


///////////////////////////////////////////////////////////////////////////////////////////
// Utility to determine if a variable is an array with content
export function getIsValidArray(arr, lengthLimit = 1) {
    return ((arr !== undefined) && (arr !== null) && (Array.isArray(arr)) && (arr.length !== undefined) && (arr.length >= lengthLimit));
}


///////////////////////////////////////////////////////////////////////////////////////////
//  Utility to determine if a variable is an object with properties set
export function getIsValidObject(obj, requiredProperties = 1) {
    return ((obj !== undefined) && (obj !== null) && (typeof obj == "object") && (Object.keys(obj).length >= requiredProperties));
}


///////////////////////////////////////////////////////////////////////////////////////////
// Attempt to determine if the specified URL points toward an image depending on its MIME type
// Returns a promise resolving to a boolean value indicating if the URL points to an image. 
export async function getUrlIsImage(imageUrl) {
    const response = await fetch(imageUrl);

    if (!response.ok) {
        return false;
    }

    const result = await response.blob();
    return result.type.startsWith('image/') ?? false;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Toggle page Dark Mode on and off
export function toggleDarkMode(enableDarkMode) {
    const toggleDark = document.querySelector("#darkmode-toggle-dark");
    const toggleLight = document.querySelector("#darkmode-toggle-light");

    if (enableDarkMode) {
        document.body.classList.add("darkmode");
        if ((toggleDark !== undefined) && (toggleDark !== null)) {
            toggleDark.checked = true;
        }

    }
    else {
        document.body.classList.remove("darkmode");
        if ((toggleLight !== undefined) && (toggleLight !== null)) {
            toggleLight.checked = true;
        }
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Set page Dark mode depending on the user's system darkmode setting
export function setDarkmodeBySystemSetting() {
    // Set default value depending on user darkmode system setting
    toggleDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Change value if the user changes their darkmode system setting.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
        toggleDarkMode(event.matches);
    });
}


///////////////////////////////////////////////////////////////////////////////////////////
// Show an error message to the user. If the autoCloseAfter parameter is set to a number
// of milliseconds the error message will automatically close after that amount of time.
// If showInPopup is set to true the error will also be shown in an alert box. 
export function showErrorMessage(errorText, showInPopup = false, autoCloseAfter = 15000, errorBoxIdentifier = '#errors') {
    const errorBox = document.querySelector(errorBoxIdentifier);
    const errorMsg = document.createElement("div");

    errorBox.classList.add("show");
    errorMsg.innerText = errorText;
    errorBox.appendChild(errorMsg);
    errorBox.scrollIntoView();

    if (showInPopup) {
        alert(errorText);
    }

    if (autoCloseAfter > 1000) {
        setTimeout((errorMsg, errorBox) => {
            errorMsg.remove();
            if (errorBox.children.length <= 0) {
                errorBox.classList.remove("show");
            }
        }, autoCloseAfter, errorMsg, errorBox);
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Add CSS class(es) to a DOM element
export function addClassToElement(targetElement, classesToAdd) {
    if ((targetElement !== undefined) && (targetElement !== null)) {
        if (classesToAdd.length > 0) {
            if (Array.isArray(classesToAdd)) {
                targetElement.classList.add(...classesToAdd);
            }
            else if (getIsValidText(classesToAdd)) {
                targetElement.classList.add(classesToAdd);
            }
        }
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Create and return a new DOM element with text content, optionally appending it to a parent element.
//  * elementText can either be a string holding the content of the tag or the ALT of an img tag, or an array of strings 
//    with the options for UL, OL and SELECT tags. In the latter case the string can also be formated like: value|textlabel|optgroup
//  * elementClass can ba a string or an array of strings. 
//  * The elementAttributes parameter can be an object with a property for each attribute to set on the HTML element. 
// Set CSS "white-space: pre-wrap;" on element if allowHTML is true and you wish to keep newlines displayed like innerText. 
export function createHTMLElement(elementType, elementText, parentElement = null, elementClass = '', elementAttributes = null, allowHTML = false) {
    const newElement = document.createElement(elementType);

    elementType = elementType.toLowerCase();

    // Set any attributes on the element
    if (getIsValidObject(elementAttributes, 1)) {
        for (const attributeName in elementAttributes) {
            newElement.setAttribute(attributeName, elementAttributes[attributeName]);
        }
    }

    // Set CSS class(es) on the element
    addClassToElement(newElement, elementClass);

    // Set content of element, if specified
    if (getIsValidArray(elementText)) {
        // If type is a list and text is an array, build list items
        if ((elementType == 'ul') || (elementType == 'ol')) {
            for (const listItemText of elementText) {
                const newListItem = document.createElement("li");
                setElementContent(newListItem, listItemText, allowHTML);
                newElement.appendChild(newListItem);
            }
        }
        // If type is a select form element and text is an array, build select option list
        else if (elementType == 'select') {
            for (const optionItemText of elementText) {
                const [optValue, optLabel, optGroup] = optionItemText.split('|');
                const newOptionItem = document.createElement("option");

                setElementContent(newOptionItem, (optLabel ?? optValue), allowHTML);
                newOptionItem.value = optValue;

                if (optGroup !== undefined) {
                    let optionGroup = newElement.querySelector(`optgroup[label="${optGroup}"]`);
                    if ((optionGroup === undefined) || (optionGroup === null)) {
                        optionGroup = document.createElement("optgroup");
                        optionGroup.label = optGroup;
                        newElement.appendChild(optionGroup);
                    }
                    optionGroup.appendChild(newOptionItem);
                }
                else {
                    newElement.appendChild(newOptionItem);
                }
            }
        }
        else {
            setElementContent(newElement, elementText[0], allowHTML);
        }
    }
    else if (getIsValidText(elementText, 1)) {
        if (elementType == 'img') {
            newElement.alt = elementText;
        }
        else {
            setElementContent(newElement, elementText, allowHTML);
        }
    }


    // Append to parent, if set
    if ((parentElement !== undefined) && (parentElement !== null)) {
        parentElement.appendChild(newElement);
    }
    return newElement;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Sets the content of an element as text or HTML depending on the allowHTML parameter. 
export function setElementContent(element, content, allowHTML) {
    if (allowHTML) {
        element.innerHTML = content;
    }
    else {
        element.innerText = content;
    }
}
