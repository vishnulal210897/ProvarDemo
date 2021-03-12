// This script is expecting 1 argument and that is a webElement.
// If the webElement tag is '<div>' with class 'span.pencil' we will perform click event.

var webElement = arguments[0];
var callBack = arguments[arguments.length-1];
var callBackFlag = true;


if (webElement.tagName === 'DIV' && webElement.querySelector('span.pencil')) {
	webElement.click();
	setTimeout(()=> {webElement.click(); callBack();},500);
	callBackFlag = false;
}

callBackFlag && callBack();
