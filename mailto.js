// Copyright (c) 2009 The Chromium Authors. All rights reserved.
// Copyright (c) 2010 Jacopo Corbetta. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var cachedGmailUrl = "";
var windowOptions = "";
var listenersAdded = false;
var enableShortcut = false;

function encodeForMailto(inUrl) {
  // GMail unescapes most of the string in the first step,
  // so "%2B" would get replaced with "+". Unfortunately,
  // the next step still tries to decode the string, and
  // plus is interpreted as space.
  // The same is true for "#" (interpreted as start of fragment)
  // Workaround: double encoding for + and #.
  inUrl = inUrl.replace(/\+/g,"%2B", "g")
  inUrl = inUrl.replace(/#/g,"%23", "g")
  return encodeURIComponent(inUrl);
}

function registerDocumentListener() {
  document.addEventListener("click", function(ev) {
    var nod = ev.target;
    while (nod) {
      if (nod.href && (nod.href.substr(0,7) == "mailto:")) {
        window.open(cachedGmailUrl + encodeForMailto(nod.href), "_blank", windowOptions);
        ev.preventDefault();
        ev.stopPropagation();
      }
      if (nod.href)
	  break;
      nod = nod.parentNode;
    }
  }, false);

  listenersAdded = true;
}

function keyupListener(ev)
{
  if (ev.ctrlKey && ev.shiftKey && (ev.keyCode == 77))
    bgPort.postMessage({req: "EmailThisPage"});
}


if (cachedGmailUrl != "") {
  registerDocumentListener();
}

var bgPort = chrome.extension.connect({name: "GmailUrlConn"});
bgPort.postMessage({req: "OptionsPlease"});
bgPort.onMessage.addListener(
function(msg) {
  //console.log("Got message from bg page - " + msg.windowOptions);
  cachedGmailUrl = msg.gmailDomainUrl;
  windowOptions = msg.windowOptions;
  enableShortcut = msg.enableShortcut;

  if (!listenersAdded)
    registerDocumentListener();

  if (enableShortcut)
    window.addEventListener("keyup", keyupListener, false);
  else window.removeEventListener("keyup", keyupListener, false);
});
