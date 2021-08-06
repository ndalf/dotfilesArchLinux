// Open reader
function startChromeReader(tab) {
  var tabId = tab ? tab.id : null;
  chrome.tabs.executeScript(tabId, { file: "javascripts/readability.js" });
  chrome.tabs.executeScript(tabId, { file: "javascripts/jquery-3.4.1.min.js" });
  chrome.tabs.executeScript(tabId, { file: "javascripts/screenfull.min.js" });
  chrome.tabs.executeScript(tabId, { file: "javascripts/articulate.min.js" });
  chrome.tabs.executeScript(tabId, {
    file: "javascripts/app.js"
  });

  // Add a badge to signify the extension is in use
  chrome.browserAction.setBadgeBackgroundColor({color:[242, 38, 19, 230]});
  chrome.browserAction.setBadgeText({text:"on"});
  setTimeout(function() {
    chrome.browserAction.setBadgeText({text:""});
  }, 2000);
}

// Listen for the extension's click
chrome.browserAction.onClicked.addListener(function (tab) {
  startChromeReader(tab);
});

// Listen for the keyboard shortcut
chrome.commands.onCommand.addListener(function(command) {
  if(command == "start-chrome-reader") {
    startChromeReader(tab);
  }
});

// Create contextMenu for user text selection
chrome.contextMenus.create({
  title: "View this selection in ReaderMode",
  contexts:["selection"],
  onclick: function(info, tab) {
    startChromeReader(tab);
  }
});

// Create contextMenu for when user want to link with CR automatically
linkCMId = chrome.contextMenus.create({
  title: "View the linked page using ReaderMode",
  id: "cr-context-menu",
  contexts:["link"],
  onclick: function(info, tab) {
    chrome.tabs.create(
      { url: info.linkUrl, active: false },
      function(newTab) {
        startChromeReader(newTab);
      }
    );
  }
});

// AutoRun setting if url match saved rules
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
  if (info.status === 'complete') {
    var url = new URL(tab.url);
    var protocol = url.protocol // http: or https:
    var domain = url.hostname; // domain name
    var pathname = url.pathname.substring(1); // use substring to remove '/' at the beginning

    /*
    * Checker List
    * if (pathname.indexOf("post") > -1)
    * pathname.indexOf(url_does_not_contain) === -1
    * pathname.startsWith("post")
    * pathname.endsWith("hunt")
    */

    chrome.storage.sync.get(['cr_auto_run_rules'], function(result) {
      let default_val = result.cr_auto_run_rules
      if (default_val) {
        rules = JSON.parse(default_val);

        for (var key in rules) {
          var id = rules[key]["id"];

          var domain_is = rules[key]["domain_name_is"];
          var url_is = rules[key]["url_is"];
          var url_is_not = rules[key]["url_is_not"];
          var url_contains = rules[key]["url_contains"];
          var url_does_not_contain = rules[key]["url_does_not_contain"];
          var url_starts_with = rules[key]["url_starts_with"];
          var url_ends_with = rules[key]["url_ends_with"];
          var url_rule_in_sentence = rules[key]["url_rule_in_sentence"];

          if ( (domain_is != "") && (url_is != "") && (url_is_not != "") && (url_contains != "") && (url_contains != "") &&
            (url_does_not_contain != "") && (url_starts_with != "") && (url_ends_with != "")
          ) {
            if ( (domain == domain_is) &&
              (url == url_is) &&
              (url != url_is_not) &&
              (pathname.indexOf(url_contains) > -1 ) &&
              (pathname.indexOf(url_does_not_contain) === -1 ) &&
              (pathname.startsWith(url_starts_with)) &&
              (pathname.endsWith(url_ends_with))
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") && (url_is != "") && (url_is_not != "") && (url_contains != "") && (url_contains != "") && (url_does_not_contain != "") && (url_starts_with != "") ) {
            if ( (domain == domain_is) &&
              (url == url_is) &&
              (url != url_is_not) &&
              (pathname.indexOf(url_contains) > -1 ) &&
              (pathname.indexOf(url_does_not_contain) === -1 ) &&
              (pathname.startsWith(url_starts_with))
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") && (url_is != "") && (url_is_not != "") && (url_contains != "") && (url_contains != "") && (url_does_not_contain != "") ) {
            if ( (domain == domain_is) &&
              (url == url_is) &&
              (url != url_is_not) &&
              (pathname.indexOf(url_contains) > -1 ) &&
              (pathname.indexOf(url_does_not_contain) === -1 )
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") && (url_is != "") && (url_is_not != "") && (url_contains != "") && (url_contains != "") ) {
            if ( (domain == domain_is) &&
              (url == url_is) &&
              (url != url_is_not) &&
              (pathname.indexOf(url_contains) > -1 )
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") && (url_is != "") && (url_is_not != "") ) {
            if ( (domain == domain_is) &&
              (url == url_is) &&
              (url != url_is_not)
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") && (url_is != "") ) {
            if ( (domain == domain_is) &&
              (url == url_is)
            ){
              startChromeReader(tab);
            }
          } else if ( (domain_is != "") ) {
            if ( (domain == domain_is) ){
              startChromeReader(tab);
            }
          } else {
          }
        }
      }
    });
  }
});
