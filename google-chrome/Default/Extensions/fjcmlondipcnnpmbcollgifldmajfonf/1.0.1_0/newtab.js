window.onload = function() {
  chrome.storage.sync.get({
    url: ''
  }, function(items) {
    if (items.url) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var doc = new DOMParser().parseFromString(this.responseText, 'text/html');
          var base = doc.createElement('base');
          base.href = items.url;
          var style = doc.createElement('style');
          style.innerText = 'body { font-family: initial; font-size: initial; }';
          var head_first = doc.getElementsByTagName('head')[0].firstChild;
          doc.getElementsByTagName('head')[0].insertBefore(base, head_first);
          doc.getElementsByTagName('head')[0].insertBefore(style, head_first);
          var string = new XMLSerializer().serializeToString(doc).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&apos;/g,"'").replace(/&quot;/g,'"');
          document.open('text/html', 'replace');
          document.write(string);
          document.close();
        }
      };
      xhr.open('GET', items.url, true);
      xhr.send();
    }
  });
};
