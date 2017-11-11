
function appendEvents(events, elementId) {
  if (events.items.length > 0) {
    const outlet = document.getElementById(elementId);
    const header = document.createElement('h4');
    header.innerText = events.summary;
    outlet.appendChild(header);
    events.items.forEach(event => {
      const container = document.createElement('p');
      const date = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date + ' (CET)');
      let text = `${formatDateTime(date)} ${event.summary}`;
      if (event.description) {
        text += ` (${event.description})`;
      }
      container.textContent = text;
      outlet.appendChild(container);
    });
  }
}

function formatDateTime(aDate) {
  const time = formatTime(aDate);
  const hasTime = time !== '0:00';
  const date = formatDate(aDate);
  return hasTime ? `${date} ${time}` : date;
}

function formatDate(date) {
  return date.toLocaleDateString('cs-CZ');
}

function formatTime(date) {
  const time = date.toLocaleTimeString('cs-CZ');
  return time.substring(0, time.length - 3);
}

function appendMessages(files, elementId) {
  const outlet = document.getElementById(elementId);
  files.forEach(file => {
    const meta = parseFile(file);
    const message = document.createElement('p');
    const text = `${formatDateTime(meta.date)} ${meta.title} (${meta.author})`;
    const link = document.createElement('a');
    link.appendChild(document.createTextNode(text));
    link.title = text;
    link.href = file.webContentLink.substring(0, file.webContentLink.indexOf('&export='));
    link.target = '_blank';
    message.appendChild(link);
    outlet.appendChild(message);
  });
}

function parseFile(file) {
  const meta = {
    file: file.name
  };
  const parts = file.name.substring(0, file.name.length - 4).split(/-/, -1);
  const dateRaw = parts.shift();
  meta.date = new Date(
    dateRaw.substring(0, 4),
    dateRaw.substring(4, 6) - 1,
    dateRaw.substring(6, 8));
  meta.author = parts.shift();
  meta.title = parts.shift();
  meta.tags = [];
  parts.forEach(part => {
    if (part.startsWith('#')) {
      meta.tags.push(part.substring(1));
    }
  });
  return meta;
}

const ga = new GoogleAccess(
  'cblistna',
  '122939969451-nm6pc9104kg6m7avh3pq8sn735ha9jja.apps.googleusercontent.com',
  'iFas6FSxexJ0ztqx6QfUH8kK',
  '1/4tbmdLZ3tItmdMx1zIoc9ZdlBZ8E854-t1whajGynYw'
);

ga.init()
  .then(() => {
    const now = new Date();
    const eventsBaseQuery = {
      timeMin: now.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 10
    };

    const regularEventsQuery = Object.assign({
        timeMax: (new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)).toISOString()
      },
      eventsBaseQuery);

    ga.eventsOf('cblistna@gmail.com', regularEventsQuery)
      .then((events) => appendEvents(events, 'regularEvents'))

    ga.eventsOf('seps8o249ihvkvdhgael78ofg0@group.calendar.google.com', eventsBaseQuery)
      .then((events) => appendEvents(events, 'irregularEvents'))

    ga.eventsOf('852scvjhsuhhl97lv3kb8r7be8@group.calendar.google.com', eventsBaseQuery)
      .then((events) => appendEvents(events, 'otherEvents'))

    const messagesQuery =  {
      orderBy: 'name desc',
      pageSize: 10,
      q: "mimeType='audio/mp3' and trashed=false",
      fields: 'files(id, name, webViewLink, webContentLink)'
    };

    ga.files(messagesQuery)
      .then((res) => appendMessages(res.files, 'messages-list'))

  })
  .catch(console.error);
