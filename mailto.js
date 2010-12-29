// Copyright (c) 2009 The Chromium Authors. All rights reserved.
// Copyright (c) 2010 Jacopo Corbetta. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var cachedGmailUrl = "";

function rewriteMailtoToGMailUrl(inUrl) {
  // GMail unescapes most of the string in the first step,
  // so "%2B" would get replaced with "+". Unfortunately,
  // the next step still tries to decode the string, and
  // plus is interpreted as space.
  // Workaround: double encoding for plus.
  inUrl = inUrl.replace("+","%2B")
  return cachedGmailUrl + encodeURIComponent(inUrl);
}

// Content Scripts
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
    var mailtoStr = nodes[i].getAttribute('href');
    mailtoStr = rewriteMailtoToGMailUrl(mailtoStr);
    nodes[i].setAttribute('href', mailtoStr);
    nodes[i].setAttribute('target', "_blank");
    nodes[i].setAttribute('rel', 'noreferrer');
  }
}


if (cachedGmailUrl != "") {
  rewriteMailtosOnPage();
  window.addEventListener("focus", rewriteMailtosOnPage);
}
  
var bgPort = chrome.extension.connect({name: "GmailUrlConn"});
bgPort.postMessage({req: "GmailUrlPlease"});
bgPort.onMessage.addListener(
function(msg) {
  //console.log("Got message from bg page - " + msg.gmailDomainUrl);
  cachedGmailUrl = msg.gmailDomainUrl;
  rewriteMailtosOnPage();
  // Not sending any response to ack.
});
