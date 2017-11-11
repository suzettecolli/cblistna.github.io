'use strict';

function appendEvents(events, elementId) {
  if (events.items.length > 0) {
    var outlet = document.getElementById(elementId);
    var header = document.createElement('h4');
    header.innerText = events.summary;
    outlet.appendChild(header);
    events.items.forEach(function (event) {
      var container = document.createElement('p');
      var date = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date + ' (CET)');
      var text = formatWeekDay(date) + ' ' + formatDateTime(date) + ' ' + event.summary;
      if (event.description) {
        text += ' (' + event.description + ')';
      }
      container.innerHTML = text;
      if (event.attachments && event.attachments.length > 0) {
        container.appendChild(document.createTextNode(" ["));
        event.attachments.forEach(function(attachment, index) {
          var title = attachment.title.substring(0, attachment.title.length - 4);
          var url = attachment.fileUrl;
          var link = document.createElement('a');
          link.appendChild(document.createTextNode(title));
          link.title = title;
          link.href = url;
          link.target = '_blank';
          if (0 < index) {
            container.appendChild(document.createTextNode(", "));
          }
          container.appendChild(link);
        });
        container.appendChild(document.createTextNode("]"));
      }
      outlet.appendChild(container);
    });
  }
}

function formatDateTime(aDate) {
  var time = formatTime(aDate);
  var hasTime = time !== '0:00';
  var date = formatDate(aDate);
  return hasTime ? date + ' ' + time : date;
}

function formatDate(date) {
  return date.toLocaleDateString('cs-CZ');
}

function formatTime(date) {
  var time = date.toLocaleTimeString('cs-CZ');
  return time.substring(0, time.length - 3);
}

function formatWeekDay(date) {
  var weekDays = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
  var weekDay = weekDays[date.getDay()];
  return weekDay;
}

function appendMessages(files, elementId) {
  var outlet = document.getElementById(elementId);
  files.forEach(function (file) {
    var meta = parseFile(file);
    var message = document.createElement('p');
    var text = formatDateTime(meta.date) + ' ' + meta.title + ' (' + meta.author + ')';
    var link = document.createElement('a');
    link.appendChild(document.createTextNode(text));
    link.title = text;
    link.href = file.webContentLink.substring(0, file.webContentLink.indexOf('&export='));
    link.target = '_blank';
    message.appendChild(link);
    outlet.appendChild(message);
  });
}

function parseFile(file) {
  var meta = {
    file: file.name
  };
  var parts = file.name.substring(0, file.name.length - 4).split(/-/, -1);
  var dateRaw = parts.shift();
  meta.date = new Date(dateRaw.substring(0, 4), dateRaw.substring(4, 6) - 1, dateRaw.substring(6, 8));
  meta.author = parts.shift();
  meta.title = parts.shift();
  meta.tags = [];
  parts.forEach(function (part) {
    if (part.startsWith('#')) {
      meta.tags.push(part.substring(1));
    }
  });
  return meta;
}

var ga = new GoogleAccess('cblistna', '122939969451-nm6pc9104kg6m7avh3pq8sn735ha9jja.apps.googleusercontent.com', 'iFas6FSxexJ0ztqx6QfUH8kK', '1/4tbmdLZ3tItmdMx1zIoc9ZdlBZ8E854-t1whajGynYw');

ga.init().then(function () {
  var now = new Date();
  var eventsBaseQuery = {
    timeMin: now.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 10
  };

  var regularEventsQuery = Object.assign({
    timeMax: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }, eventsBaseQuery);

  ga.eventsOf('cblistna@gmail.com', regularEventsQuery).then(function (events) {
    return appendEvents(events, 'regularEvents');
  });

  ga.eventsOf('seps8o249ihvkvdhgael78ofg0@group.calendar.google.com', eventsBaseQuery).then(function (events) {
    return appendEvents(events, 'irregularEvents');
  });

  ga.eventsOf('852scvjhsuhhl97lv3kb8r7be8@group.calendar.google.com', eventsBaseQuery).then(function (events) {
    return appendEvents(events, 'otherEvents');
  });

  var messagesQuery = {
    orderBy: 'name desc',
    pageSize: 10,
    q: "mimeType='audio/mp3' and trashed=false",
    fields: 'files(id, name, webViewLink, webContentLink)'
  };

  ga.files(messagesQuery).then(function (res) {
    return appendMessages(res.files, 'messages-list');
  });
}).catch(console.error);