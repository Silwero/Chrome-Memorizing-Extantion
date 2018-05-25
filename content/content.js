$(function() {
/*---------------------------------------- EVENTS --------------------------------- */
// CLEAR APP UI ON CLICK OUT OFF APP
// DETECT SELECTED TEXT END SHOW BTN
/*----------------------------------------------------------------------------------- */

/*---------------------------------RQUESTS--------------------------------------- */
// GET TRANSLATE FROM GOOGLE
// SAVE TRANSLATE TO FIREBASE
/*----------------------------------------------------------------------------------- */

/*---------------------------------------- CLEAR UI --------------------------------- */
// CREATE SHADOW ROOT TO INCAPSULATE APP
// CREATE BTN
// CREATE POPUP
// CREATE CLOSE POPUP BTN
// DELETE UI
// STYLES
/*----------------------------------------------------------------------------------- */

let settings = {
  isAuth: false
}
let translate = {};
let memorizingApp = document.createElement('div');
createShadowRoot();


/*---------------------------------------- EVENTS --------------------------------- */
  /* CLEAR APP UI ON CLICK OUT OFF APP */
  $('body').on('mousedown', (e) => {
    if ($(e.target).closest('.memorizing-popup-btn, .memorizing-popup').length || $(e.target).is('#memorizingApp')) {
      return;
    }
    clearMemorizingElements();
  });

  /* DETECT SELECTED TEXT END SHOW BTN */
  $('body').on('mouseup', (e) => {
    if ($(e.target).closest('.memorizing-popup').length || $(e.target).hasClass('.memorizing-popup')) {
      return;
    }
    let select = '';
    select = document.getSelection();
    let word = select.toString();

    if (word) {
      let x = 0;
      let y = 0;
      let range = select.getRangeAt(0).cloneRange();
      if (range.getClientRects().length>0){
        rect = range.getClientRects()[0];
        y = rect.bottom + $(window).scrollTop();
        x = rect.right;
      }

      // Create popup btn if needed
      if (!$(e.target).closest('#memorizingApp').length) {
        createBtn(x, y);
      }
    }
  });

/*---------------------------------------- REQUESTS --------------------------------- */

  /* GET TRANSLATE FROM GOOGLE */
  function getTranslate(text, lang = 'auto') {
    // START SPINNER
    const lang2 = lang === 'ru' ? 'en' : 'ru';
    $('.memorizing-popup-btn button').attr('disabled', true);


    // REQUEST
    let request = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + lang + '&tl=' + lang2 + '&hl=ru&dt=t&dt=bd&dj=1&q=' + text;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', request, true);
    xhr.send();
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;

      if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
        alert(xhr.status + ': ' + xhr.statusText);
      } else {
        translate = JSON.parse(xhr.responseText);
        // init popup creation
        createPopup();
      }
    }
  }

  /* SAVE TRANSLATE TO FIREBASE */
  function saveTranslate() {

    const xhr = new XMLHttpRequest();

    translate.userId = settings.userInfo.localId;
    xhr.open('POST', 'https://memorizing-bc6a4.firebaseio.com/words.json', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(translate));

    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;
      if (this.status != 200) {
        console.log(this.status + ': ' + this.statusText);
        return;
      }

      chrome.runtime.sendMessage({
        msg: 'WORD_SAVED',
        name: JSON.parse(xhr.responseText).name,
        data: translate
      });
      alert('saved');
    }
  }

/*---------------------------------------- CREATE UI --------------------------------- */

  /* CREATE SHADOW ROOT TO INCAPSULATE APP */
  function createShadowRoot() {
    memorizingApp.setAttribute('id', 'memorizingApp');
    let shadow = memorizingApp.attachShadow({mode: 'open'});
    shadow.innerHTML = getStyles();

    $('body').append(memorizingApp);
  }

  /* CREATE BTN */
  function createBtn(left, top) {
    // inline svg logo
    let logo = '<svg class="memorizing-logo" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256.5 256.5"><path d="m0.2 251.2v-244c0.3-0.1 0.8-0.2 0.8-0.4 0.6-3.3 2.6-5.2 5.8-5.8 0.2 0 0.2-0.5 0.4-0.8h243c0.6 1.5 2.3 1.3 3.3 2 1 0.8 1.8 2 2.7 3v244c-0.3 0.1-0.8 0.2-0.8 0.4-0.6 3.3-2.6 5.2-5.8 5.8-0.2 0-0.2 0.5-0.4 0.8h-243c-0.6-1.5-2.3-1.3-3.3-2-1-0.8-1.8-2-2.7-3zm223-98.6v-44-9s-0.1-6 0-9c0.2-3.1-0.7-6.1-0.9-9.1-0.2-2.9-0.5-5.7-1.1-8.6-1-5.1-2.2-10-4.5-14.6-1.5-3.1-3.2-6-5.4-8.8-3.7-4.8-7.9-8.8-13.1-11.9-7.7-4.5-16.2-5.9-24.8-6.4-1.8-0.1-3.7-0.1-5.5 0-1.7 0.2-3.4 0.9-5.1 0.9-5.3 0-10.1 2-14.9 3.9-4.7 1.8-8.4 5-12.1 8.2-3.6 3-6.4 6.8-8.9 10.8-1.1 1.7-2.6 1.7-3.4-0.1-2.3-5.1-6.7-8.3-10.3-12.2-2-2.1-4.5-3.5-7-4.9-3.9-2.3-8-4.2-12.3-5.2-3.2-0.7-6.6-1-10-1.3-2-0.2-4-0.2-6 0-2 0.2-4.1 0.9-6.1 0.9-2.6 0-5.1 0.7-7.4 1.5-6.4 2.1-12.5 5-17.5 9.5-5.4 4.8-10.1 10.2-13.2 17-3.2 7-5.5 14-5.5 21.7 0 2 0.6 4.2-0.8 6 1.8 2 0.8 4.5 0.8 6.7 0.1 28.8 0.1 57.7 0.1 86.5 0 12.2 0 24.3 0 36.5 0 2.6-0.6 2.7 2.6 2.7 16.3 0 32.7 0 49 0 0.7 0 1.3 0 2 0 1.1 0.1 1.5-0.3 1.4-1.4-0.1-1.2 0-2.3 0-3.5 0-39.3 0-78.7 0-118 0-3.6 0.1-4 2-7.7 1.4-2.7 4.1-4 7-3.4 2.5 0.5 4.8 3 5 5.6 0.4 6.2 1 12.4 1 18.6 0.1 35 0 70 0 105 0 1.2 0.1 2.3 0 3.5-0.1 1.1 0.4 1.5 1.5 1.4 0.7-0.1 1.3 0 2 0 16 0 32 0 48 0 3.5 0 3.5 0 3.6-3.7 0-0.5 0-1 0-1.5 0-39.2 0-78.3 0-117.5 0-2.8 0.5-5.3 1.9-7.7 1.6-2.6 4-4 7-3.5 2.5 0.4 5.3 3 5 5.4-0.5 5 1.1 9.7 1.1 14.6 0 37 0 74 0 111 0 3 0 3 2.8 3 16.3 0 32.7 0 49 0 3.2 0 3.2 0 3.2-3.1 0-21.5 0-43 0-64.5z"/></svg>';

    let btn = $('<div class="memorizing-popup-btn" pseudo="-memorizing-popup-btn" style="left: ' + left + 'px; top: ' + top + 'px;"><button>' +
      logo + '</button></div>');
    // button event
    btn.on('click', function() {
      let text = document.getSelection().toString();
      getTranslate(text);
    });

    memorizingApp.shadowRoot.appendChild(btn[0]);
  }

  /* CREATE POPUP */
  function createPopup() {
    // remove btn
    clearMemorizingElements();
    getSettings(() => {

      const text = {
        header: 'Translation',
        btnText: 'Save translate'
      }

      // popup wrapper
      const popup = $('<div class="memorizing-popup"></div>');
      // popup header
      const header = $('<h1>').text(text.header);
      // popup save btn
      const btn = $('<button class="save-btn">' + text.btnText + '</button>');
      btn.on('click', e => {
        saveTranslate();
      });
      // popup close btn
      popup.append(createClosePopupBtn());

      // select language
      const select = $('<select class="lang-select">' +
          '<option value="auto">Auto</option>' +
          '<option value="ru">Russian</option>' +
          '<option value="en">English</option>' +
        '</select>');
      select.value = translate.src;
      select.on('change', function() {
        getTranslate(translate.sentences[0].orig, $(this).val());
      });

      // translation table
      const translateTable = $('<table class="result"></table>');
      let lang = '';
      switch(translate.src) {
        case 'ru':
          lang = 'Russian';
          break;
        case 'en':
          lang = 'English';
          break;
        default:
          lang = translate.src;
      }
      translateTable.append('<tr>' +
          '<th colspan="2"> Source language ' + lang +'</tr>');
      translateTable.append('<tr>' +
          '<td>' + translate.sentences[0].orig + '</td>' +
          '<td class="current-translate">' + translate.sentences[0].trans + '</td>' +
       +'</tr>');

      // dictionary table
      let dictTable = null;
      if (translate.dict) {
        dictTable = $('<table class="dict-table"></table>');
        dictTable.append('<tr><th colspan="2">Other variants</th></tr>');
        translate.dict.forEach((el, dictNum) => {
          let dict = el.terms.map((el, arrNum) => {
            return '<span data-arr-number="' + arrNum + '" data-dict-number="' + dictNum + '" class="change-translation">' + el + '</span>';
          });
          dictTable.append('<tr>'+
              '<td>' + el.pos +'</td>' +
              '<td>' + dict.join(', ') +'</td>' +
            +'</tr>');
        });
      }

      popup.append(header);
      popup.append(select);
      popup.append(translateTable);
      popup.append(dictTable);
      if (settings.isAuth) {
        popup.append(btn);
      }

      // add popup to shadow root
      memorizingApp.shadowRoot.appendChild(popup[0]);
      // set select lang value
      memorizingApp.shadowRoot.querySelector('.lang-select').value = translate.src;

      // new value event binding
      memorizingApp.shadowRoot.querySelector('.memorizing-popup').addEventListener('click', function(e) {
        if (!e.target.classList.contains('change-translation')) return;
        const newVal = $(e.target).text();
        memorizingApp.shadowRoot.querySelector('.current-translate').innerText = newVal;
        translate.sentences[0].trans = newVal;
      });
    });

  }

  /* CREATE CLOSE POPUP BTN */
  function createClosePopupBtn() {
    let btn = $('<button class="close">X</button>');
    btn.on('click', () => {
      clearMemorizingElements();
    });
    return btn;
  }

  /* DELETE UI */
  function clearMemorizingElements() {
    const btn = memorizingApp.shadowRoot.querySelector('.memorizing-popup-btn');
    const popup = memorizingApp.shadowRoot.querySelector('.memorizing-popup');
    if (btn) {
      btn.remove();
    }
    if (popup) {
      popup.remove();
    }
  }

  /* STYLES */
  function getStyles() {
    return '<style>\
      .memorizing-popup-btn{position:absolute;z-index:999999999999999999999999999;margin-top:5px;transform:translateX(-100%)}\
      .memorizing-popup-btn button{overflow:hidden;width:30px;margin:0;padding:0;border:0;border-radius:7px;outline:0;cursor:pointer}\
      .memorizing-popup-btn button:disabled{animation-name:spinner;animation-duration:.5s;animation-iteration-count:infinite;animation-direction:alternate}\
      .memorizing-logo{display:block;width:100%;height:100%;background:linear-gradient(to bottom,#40ff05 10%,#000 87%);background-repeat:no-repeat;background-position:0 50%;background-size:100% 90%}\
      @keyframes spinner{from{transform:scale(1)}to{transform:scale(.8)}}\
      .memorizing-popup{font-family:Arial;position:fixed;z-index:999999999999999999999999999;top:50%;left:50%;padding:15px;transform:translate(-50%,-50%);border:1px solid #000;border-radius:7px;background:#fff;box-shadow:0 0 14px 3px rgba(0,0,0,.5);min-width:280px;max-width:500px;max-height:90vh;overflow:auto}\
      .memorizing-popup h1{font-size:20px;text-align:center;margin-top:20px;margin-bottom:30px}\
      .close{position:absolute;right:10px;top:10px;background-color:transparent;color:#000;outline:0;border:0;cursor:pointer}\
      .result,.dict-table{width:100%;border-collapse:collapse}\
      .dict-table{margin:40px 0}\
      .result th,.dict-table th{text-align:center;background:#000;color:#40ff05;font-weight:400}\
      .result td,.dict-table td,.result th,.dict-table th{vertical-align:top;border:1px solid #000;padding:5px 15px}\
      .dict-table td:first-child{background:rgba(0,0,0,.8);color:#40ff05}\
      .save-btn{border:0;text-align:center;padding:10px 20px;background:#000;color:#40ff05;border-radius:7px;max-width:150px;margin:20px auto 0;display:block;cursor:pointer}\
      .memorizing-popup::-webkit-scrollbar{width:5px}\
      .memorizing-popup::-webkit-scrollbar-track{background:#000}\
      .memorizing-popup::-webkit-scrollbar-thumb{background-color:#40ff05}\
      .lang-select{margin-bottom:30px}\
      .change-translation{cursor:pointer}\
      .change-translation:hover{text-decoration:underline}\
      .lang-select{width: 100%;font-size:inherit;color:#40ff05;padding:10px 15px;border:1px solid #000;background:#000;border-radius:5px;}\
    </style>'
  }

/*------------------------------- MESSAGING ---------------------------------*/
  function getSettings(callback) {
    chrome.runtime.sendMessage({
      msg: 'SETTINGS_REQUEST'
    }, resp => {
      settings = {...resp};
      if (callback) {
        callback();
      }
    });
  }
});