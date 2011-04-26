// Copyright (c) 2009 The Chromium Authors. All rights reserved.
// Copyright (c) 2010 Jacopo Corbetta. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var cachedGmailUrl = "";
var windowOptions = "";
var listenersAdded = false;

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

function rewriteMailtosOnPage() {
  // Find all the A mailto links.
  var result = document.evaluate(
      '//a[contains(@href, "mailto:")]',
      document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
  rewriteMailtos(result);
  
  // Find all the AREA mailto links.
  var result = document.evaluate(
      '//area[contains(@href, "mailto:")]',
      document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
  rewriteMailtos(result);

  listenersAdded = true;
}

function rewriteMailtos(allofthem) {
  var item;
  var nodes = [];
  // cannot change the NODE_ITERATOR nodes' attributes in this loop itself
  // since iterateNext will invalidate the state; Need to store temporarily.
  while (item = allofthem.iterateNext()) {
    nodes.push(item);
  }
  
  for (var i = 0; i < nodes.length; i++) {
    nodes[i].setAttribute('rel', 'noreferrer');
    nodes[i].addEventListener('click', creaListener(nodes[i].getAttribute('href')), false);
  }
}

function creaListener(originalUrl)
{
  return function(ev) {
    window.open(cachedGmailUrl + encodeForMailto(originalUrl), "_blank", windowOptions);
    ev.preventDefault();
  };
}


if (cachedGmailUrl != "") {
  rewriteMailtosOnPage();
}
  
var bgPort = chrome.extension.connect({name: "GmailUrlConn"});
bgPort.postMessage({req: "OptionsPlease"});
bgPort.onMessage.addListener(
function(msg) {
  //console.log("Got message from bg page - " + msg.windowOptions);
  cachedGmailUrl = msg.gmailDomainUrl;
  windowOptions = msg.windowOptions;
  
  if (!listenersAdded)
    rewriteMailtosOnPage();
});
