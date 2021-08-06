function save_options() {
  var url = document.getElementById('url').value;
  console.log(url);
  chrome.storage.sync.set({
    url: url
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Save complete';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    url: ''
  }, function(items) {
    document.getElementById('url').value = items.url;
  });
}

window.onload = function() {
  restore_options();
  document.getElementById('save').addEventListener('click', save_options);
}
