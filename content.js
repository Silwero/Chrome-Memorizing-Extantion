$(function() {
/*---------------------------------------- EVENTS --------------------------------- */
// CLEAR APP UI ON CLICK OUT
// DETECT SELECTED TEXT END SHOW BTN
/*----------------------------------------------------------------------------------- */

/*---------------------------------------- CLEAR UI --------------------------------- */
// CREATE BTN
// CREATE POPUP
// DELETE UI
/*----------------------------------------------------------------------------------- */

/*---------------------------------RQUESTS--------------------------------------- */
// GET TRANSLATE FROM GOOGLE
// SAVE TRANSLATE TO FIREBASE
/*----------------------------------------------------------------------------------- */


/*---------------------------------------- EVENTS --------------------------------- */
  /* CLEAR APP UI ON CLICK OUT */
  $('body').on('mousedown', (e) => {
    if ($(e.target).closest('.memorizing-popup-btn, .memorizing-popup').length) {
      return;
    }
    clearMemorizingElements();
  });

  /* DETECT SELECTED TEXT END SHOW BTN */
  $('body').on('mouseup', (e) => {
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

      if (!$('.memorizing-popup-btn').length) {
        createBtn(x, y);
      }
    }
  });



/*---------------------------------------- REQUESTS --------------------------------- */

  /* GET TRANSLATE FROM GOOGLE */
  function getTranslate(text) {
    // START SPINNER
    $('.memorizing-popup-btn button').attr('disabled', true);


    // REQUEST
    let request = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ru&hl=ru&dt=t&dt=bd&dj=1&q=' + text;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', request, true);
    xhr.send();
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;

      if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
        alert(xhr.status + ': ' + xhr.statusText);
      } else {
        createPopup(JSON.parse(xhr.responseText));
      }
    }
  }

  /* SAVE TRANSLATE TO FIREBASE */
  function saveTranslate(translate) {

    const xhr = new XMLHttpRequest();

    xhr.open('POST', 'https://memorizing-f0cb4.firebaseio.com/words.json', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(translate));

    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;
      if (this.status != 200) {
        console.log(this.status + ': ' + this.statusText);
        return;
      }

      alert('saved');
    }
  }

/*---------------------------------------- CREATE UI --------------------------------- */

  /* CREATE BTN */
  function createBtn(left, top) {
    let logo = '<svg class="logo" xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256.5 256.5"><path d="m0.2 251.2v-244c0.3-0.1 0.8-0.2 0.8-0.4 0.6-3.3 2.6-5.2 5.8-5.8 0.2 0 0.2-0.5 0.4-0.8h243c0.6 1.5 2.3 1.3 3.3 2 1 0.8 1.8 2 2.7 3v244c-0.3 0.1-0.8 0.2-0.8 0.4-0.6 3.3-2.6 5.2-5.8 5.8-0.2 0-0.2 0.5-0.4 0.8h-243c-0.6-1.5-2.3-1.3-3.3-2-1-0.8-1.8-2-2.7-3zm223-98.6v-44-9s-0.1-6 0-9c0.2-3.1-0.7-6.1-0.9-9.1-0.2-2.9-0.5-5.7-1.1-8.6-1-5.1-2.2-10-4.5-14.6-1.5-3.1-3.2-6-5.4-8.8-3.7-4.8-7.9-8.8-13.1-11.9-7.7-4.5-16.2-5.9-24.8-6.4-1.8-0.1-3.7-0.1-5.5 0-1.7 0.2-3.4 0.9-5.1 0.9-5.3 0-10.1 2-14.9 3.9-4.7 1.8-8.4 5-12.1 8.2-3.6 3-6.4 6.8-8.9 10.8-1.1 1.7-2.6 1.7-3.4-0.1-2.3-5.1-6.7-8.3-10.3-12.2-2-2.1-4.5-3.5-7-4.9-3.9-2.3-8-4.2-12.3-5.2-3.2-0.7-6.6-1-10-1.3-2-0.2-4-0.2-6 0-2 0.2-4.1 0.9-6.1 0.9-2.6 0-5.1 0.7-7.4 1.5-6.4 2.1-12.5 5-17.5 9.5-5.4 4.8-10.1 10.2-13.2 17-3.2 7-5.5 14-5.5 21.7 0 2 0.6 4.2-0.8 6 1.8 2 0.8 4.5 0.8 6.7 0.1 28.8 0.1 57.7 0.1 86.5 0 12.2 0 24.3 0 36.5 0 2.6-0.6 2.7 2.6 2.7 16.3 0 32.7 0 49 0 0.7 0 1.3 0 2 0 1.1 0.1 1.5-0.3 1.4-1.4-0.1-1.2 0-2.3 0-3.5 0-39.3 0-78.7 0-118 0-3.6 0.1-4 2-7.7 1.4-2.7 4.1-4 7-3.4 2.5 0.5 4.8 3 5 5.6 0.4 6.2 1 12.4 1 18.6 0.1 35 0 70 0 105 0 1.2 0.1 2.3 0 3.5-0.1 1.1 0.4 1.5 1.5 1.4 0.7-0.1 1.3 0 2 0 16 0 32 0 48 0 3.5 0 3.5 0 3.6-3.7 0-0.5 0-1 0-1.5 0-39.2 0-78.3 0-117.5 0-2.8 0.5-5.3 1.9-7.7 1.6-2.6 4-4 7-3.5 2.5 0.4 5.3 3 5 5.4-0.5 5 1.1 9.7 1.1 14.6 0 37 0 74 0 111 0 3 0 3 2.8 3 16.3 0 32.7 0 49 0 3.2 0 3.2 0 3.2-3.1 0-21.5 0-43 0-64.5z"/></svg>';

    let btn = $('<div class="memorizing-popup-btn" style="left: ' + left + 'px; top: ' + top + 'px;"><button>' +
      logo + '</button></div>');
    btn.on('click', function() {
      let text = document.getSelection().toString();
      getTranslate(text);
    });

    $('body').append(btn);
  }

  /* CREATE POPUP */
  function createPopup(translate) {
    // remove btn
    clearMemorizingElements();

    const text = {
      header: 'Translate',
      btnText: 'Save translate'
    }

    const popup = $('<div class="memorizing-popup"></div>');
    const header = $('<h1>').text(text.header);
    const btn = $('<button>' + text.btnText + '</button>');

    btn.on('click', e => {
      saveTranslate(translate);
    });

    const translateTable = $('<table class="result"></table>');
    translateTable.append('<tr>' +
        '<th> Source language ' + translate.src + '</th>'
     +'</tr>');
    translateTable.append('<tr>' +
        '<td>' + translate.sentences[0].orig + '</td>' +
        '<td>' + translate.sentences[0].trans + '</td>' +
     +'</tr>');

    let dictTable = null;
    if (translate.dict) {
      dictTable = $('<table class="dict-table"></table>');
      translate.dict.forEach((el) => {
        dictTable.append('<tr>'+
            '<td>' + el.pos +'</td>' +
            '<td>' + el.terms.join(', ') +'</td>' +
          +'</tr>');
      });
    }


    popup.append(header);
    popup.append(translateTable);
    popup.append(dictTable);
    popup.append(btn);

    $('body').append(popup);
  }

  /* DELETE UI */
  function clearMemorizingElements() {
    if ($('[class*="memorizing"]').length) {
      $('[class*="memorizing"]').remove();
    }
  }

});