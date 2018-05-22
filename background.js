let settings = {
  isAuth: false
}
checkAuth();

if (settings.isAuth) {
  getTranslations();
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.msg === 'WORD_SAVED') {
    chrome.storage.local.get(['memorizing'], function(result) {
      const newMemorizing = {...result.memorizing}
      newMemorizing[request.name] = {...request.data};
      setStoreage(newMemorizing);
    });
  }
});

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
      setStoreage(JSON.parse(xhr.responseText));
    }
  }
}

function setStoreage(data) {
  chrome.storage.local.set({memorizing: data});
  chrome.runtime.sendMessage({
    msg: 'TRANSLATIONS_RECEIVED'
  });
}

function checkAuth() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (userInfo) {
    settings.userInfo = {...userInfo}

    if (settings.userInfo.idToken) {
      settings.isAuth = true;
    }
  }
}

/* ---------------------------- MESSAGING ----------------------------*/
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.msg === 'SETTINGS_REQUEST') {
      if (request.data && request.data !== 'logout') {
        settings.userInfo = request.data;
        settings.isAuth = true;
        getTranslations();
      } else if (request.data && request.data === 'logout') {
        delete settings.userInfo;
        settings.isAuth = false;
      }
      sendResponse(settings);
    }
  });