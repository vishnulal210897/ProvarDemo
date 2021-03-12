
  var forElem = arguments[0];

  // Get the event id.
  let classAttr = forElem.getAttribute('class');
  if (!classAttr) {
    return null;
  }

  let eventType = 'Service Appointment';
  // check for event type
  if (classAttr.indexOf('NA_Break') > 0) {
	eventType = 'Resource Absence';
  }

  // Get event title
  let areaLabel = forElem.getAttribute('aria-label');
  let eventTitle = '';
  if (areaLabel) {
	eventTitle = areaLabel;
  }
  
  // Get status
  let eventStatus = '';
  let eventViolation = false;
  if (eventType === 'Service Appointment') {
    eventStatus = classAttr.split('GanttCustomStatus_')[1];
    if (eventStatus) {
      eventStatus = eventStatus.replace(/([A-Z])/g, ' $1').trim();
    }
	  const count = document.evaluate("count(.//div[contains(@class, 'violationsOnService')])", forElem, null, XPathResult.NUMBER_TYPE, null).numberValue;
	  eventViolation = count > 0 ? true : false;
  }
  
  return {
    title: eventTitle,
    type: eventType,
    violation: eventViolation,
    status: eventStatus,
  };