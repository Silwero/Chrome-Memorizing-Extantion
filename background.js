getTranslations();

function getTranslations() {
  const xhr = new XMLHttpRequest();

  xhr.open('GET', 'https://memorizing-bc6a4.firebaseio.com/words.json', true);
  xhr.send();

  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;
    if (xhr.status != 200) {
      console.log(xhr.status + ': ' + xhr.statusText);
      alert(xhr.status + ': ' + xhr.statusText);
    } else {
      setStoreage(xhr.responseText);
    }
  }
}

function setStoreage(data) {
  chrome.storage.local.set({memorizing: JSON.parse(data)});
}