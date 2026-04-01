const fs = require('fs');

fetch('https://deadbydaylight.fandom.com/wiki/Killers').then(r=>r.text()).then(t=>{
  const matches = [...t.matchAll(/<img[^>]+data-src=\"(https:\/\/static\.wikia\.nocookie\.net\/deadbydaylight_gamepedia_en\/images\/[^\"]+)\"[^>]+alt=\"([^\"]+)/g)];
  matches.forEach(m => console.log(m[2].trim() + ' : ' + m[1]));
}).catch(console.error);
