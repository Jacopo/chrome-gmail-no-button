summaryText();
//window.addEventListener("mouseup", summaryText);

// In the first version, the summary that is sent is not taken as input
// from the user, but the selected phrase is considered the note.
// TODO: Take explicit input from user.
function summaryText() {
  console.log("Being Called");
  chrome.extension.sendRequest(
      window.getSelection().toString()
  );
}
