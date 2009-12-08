// Copyright (c) 2009 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// common utils for extensions for Google Apps
var gmail_url = "https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=";

function rewriteMailtoToGMailUrl(inUrl) {
  var retUrl = inUrl;
  retUrl = retUrl.replace("?", "&");
  retUrl = retUrl.replace(/subject=/i, "su=");
  retUrl = retUrl.replace(/CC=/i, "cc=");
  retUrl = retUrl.replace(/BCC=/i, "bcc=");
  retUrl = retUrl.replace(/Body=/i, "body=");
  retUrl = retUrl.replace("mailto:", gmail_url);
  return retUrl;
}

// Content Scripts
function rewriteMailtosOnPage() {
  // Find all the mailto links.
  var result = document.evaluate(
      '//a[contains(@href, "mailto:")]',
      document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

  var item;
  var nodes = [];
  // cannot change the NODE_ITERATOR nodes' attributes in this loop itself
  // since iterateNext will invalidate the state; Need to store temporarily.
  while (item = result.iterateNext()) {
    nodes.push(item);
  }
  
  for (var i = 0; i < nodes.length; i++) {
    var mailto_str = nodes[i].getAttribute('href');
    mailto_str = rewriteMailtoToGMailUrl(mailto_str);
    nodes[i].setAttribute('href', mailto_str);
    nodes[i].setAttribute('target', "_blank");
  }
}

if (window == top) {
  rewriteMailtosOnPage();
  window.addEventListener("focus", rewriteMailtosOnPage);
}
