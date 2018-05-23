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

  const url = 'https://memorizing-bc6a4.firebaseio.com/words.json?auth=' + settings.userInfo.idToken + '&orderBy="userId"&equalTo="' + settings.userInfo.localId + '"';

  xhr.open('GET', url, true);
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

updateToken();

function updateToken() {

  const xhr = new XMLHttpRequest();

  console.log(settings.userInfo);

  let url = 'https://securetoken.googleapis.com/v1/token?key=AIzaSyAQGCNngi5zGARnGq1JXCD2GHrcuL8vVXA&grant_type=refresh_token&refresh_token=' + settings.userInfo.refreshToken;

  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send();

  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;
    if (this.status != 200) {
      console.log(this.status + ': ' + this.statusText);
      return;
    }

    saveUser(JSON.parse(xhr.responseText));
  }
}

checkAuthTimeout();

function checkAuthTimeout() {
  if (!settings.isAuth) return;

  let expTime = (new Date(settings.userInfo.expiresIn).getTime() - new Date().getTime());

  setTimeout(() => {
    updateToken();
  }, expTime);
}

  /* SAVE USER */
  function saveUser(info) {

    settings.userInfo.expiresIn = new Date(new Date().getTime() + info.expires_in * 1000);
    settings.userInfo.idToken = info.id_token;
    settings.userInfo.refreshToken = info.refresh_token;
    localStorage.setItem('userInfo', JSON.stringify(settings.userInfo));
    console.log(settings.userInfo.expiresIn);
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