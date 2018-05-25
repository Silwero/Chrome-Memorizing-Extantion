$(function() {
/*--------------------SHOW DICTIONARY------------------------*/
// Show/hide dictionary block if present
/*------------------------------------------------------------*/
/*--------------------GET TRANSLATIONS------------------------*/
// Get translations from server and call the createResultTable function on success
/*------------------------------------------------------------*/
/*--------------------CREATE RESULT TABLE------------------------*/
// Create structure of results
/*------------------------------------------------------------*/
  let settings = {
    isAuth: false
  }
  let currentTranslate = {};
  let updateTimer;
  const spinner = $('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');

  // start updating timer
  getSettings(() => {
    updateTimer = setInterval(() => {
      getSettings();
    }, 3000);
    // create nav after getting isAuth
    createNav();
  });

  // stop updating timer
  $(window).on('beforeunload ', () => {
    clearInterval(updateTimer);
  });

  $('body').on('click', (e) => {
      if ($(e.target).hasClass('show-dictionary')) {
        showDictionary($(e.target));
      }
      if ($(e.target).hasClass('delete-word')) {
        deleteWord($(e.target).parent().attr('id'), );
      }
  });

  getTranslations();
  switchAuth();
  logout();


/*--------------------GET TRANSLATIONS------------------------*/
  function getTranslations() {
    $('.result').empty();
    $('.result').append(spinner);

    chrome.storage.local.get(['memorizing'], function(result) {
      createResultTable(result.memorizing);
    });
  }


  function createResultTable(translationsList) {
    $('.result').empty();

    if (!translationsList || !Object.keys(translationsList).length) {
      $('.result').append('<p class="empty">No words!</p>');
      return;
    }

    const table = $('<div class="table"></div>');

    for (key  in translationsList) {
      let tr = $('<div class="tr" id="' + key + '">' +
          '<div class="td">' + translationsList[key].sentences[0].orig + '</div>' +
          '<div class="td">' + translationsList[key].sentences[0].trans + '</div>' +
        '</tdivr>');

      tr.append('<button class="delete-word">X</button>');

      if (translationsList[key].dict) {
        tr.append('<button class="show-dictionary"></button>')
        translationsList[key].dict.forEach(el => {
          tr.append('<div class="dictionary">' +
              '<div>' + el.pos + '</div>' +
              '<div>' + el.terms.join(', ') + '</div>' +
            '</div>')
        });
      }

      table.append(tr);
    }

    $('.result').append(table);
  }

/*--------------------CREATE GOTED TRANSLATION TABLE------------------------*/
  /* TRANSLATE WORD */
  $('body').on('click', '.translate-text-btn', (e) => {
    e.preventDefault();
    const lang = 'auto';
    const lang2 = 'ru';

    const text = $('#translate-text').val();

    if (!text) return;

    $.ajax({
      type: 'POST',
      url: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + lang + '&tl=' + lang2 + '&hl=ru&dt=t&dt=bd&dj=1&q=' + text,
      success: resp => {
        currentTranslate = {...resp};
        createTranslate(currentTranslate);
      },
      error: err => {
        console.log(err);
        alert('Error: More info in console!')
      }
    });
  });

  /* CREATE GOTED TRANSLATION TABLE */
  function createTranslate(translate) {
    const parent = $('.translate-result');
    clearTranslation();
    currentTranslate = translate;


    const text = {
      header: 'Translation',
      btnText: 'Save translate'
    }

    // translate header
    const header = $('<h2>').text(text.header);
    // translate save btn
    const btn = $('<button class="btn save-btn">' + text.btnText + '</button>');
    btn.on('click', e => {
      saveTranslation();
    });

    // translation table
    const translateTable = $('<table class="translate-result-table"></table>');
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

    let dictionaryToggle = null;
    // dictionary table
    let dictTable = null;
    if (translate.dict) {
      dictionaryToggle = $('<div class="toggle-dictionary">').text('Other variants');
      dictTable = $('<table class="dict-table"></table>');
      dictTable.append('<tr><th colspan="2">Other variants</th></tr>');
      if (settings.isAuth) {
        translate.dict.forEach((el, dictNum) => {
          let dict = el.terms.map((el, arrNum) => {
            return '<span data-arr-number="' + arrNum + '" data-dict-number="' + dictNum + '" class="change-translation">' + el + '</span>';
          });
          dictTable.append('<tr>'+
              '<td>' + el.pos +'</td>' +
              '<td>' + dict.join(', ') +'</td>' +
            +'</tr>');
        });
      } else {
        translate.dict.forEach((el, dictNum) => {
          dictTable.append('<tr>'+
              '<td>' + el.pos +'</td>' +
              '<td>' + el.terms.join(', ') +'</td>' +
            +'</tr>');
        });
      }
      }

      parent.append(header);
      // parent.append(select);
      parent.append(translateTable);
      parent.append(dictionaryToggle);
      parent.append(dictTable);
      if (settings.isAuth) {
        $('#translate .btn-wrapper').append(btn);
      }
  }

  /* TOGGLE VARIANTS */
  $('body').on('click', '.toggle-dictionary', e => {
    $(e.target).toggleClass('active');
    $('.dict-table').toggle();
  });

  /* SAVE TRANSLATE */
  $('body').on('click', '.save-btn', e => {
    e.preventDefault();
    $(e.target).attr('disabled', 'disabled');
  });

  /* CLEAR TRANSLATION */
  $('.clear-translation-input').on('click', e => {
    e.preventDefault();

    $(e.target).prev().val('');
    clearTranslation();
  });

  /* CLEAR CURRENT TRANSLATION */
  function clearTranslation() {
    $('.translate-result').empty();
    $('.save-btn').remove();
    currentTranslate = {};
  }

/*--------------------SHOW DICTIONARY------------------------*/
  function showDictionary(target) {
    if (!target.parent().find('.showed').length) {
      $('.dictionary.showed').removeClass('showed');
    }
    target.parent().find('.dictionary').toggleClass('showed');
  }

/*--------------------DELETE WORD------------------------*/
  function deleteWord(target) {
    $.ajax({
      type: 'DELETE',
      url: 'https://memorizing-bc6a4.firebaseio.com/words/' + target + '.json',
      success: result => {
        chrome.storage.local.get(['memorizing'], function(result) {
          delete result.memorizing[target];
          chrome.storage.local.set({memorizing: result.memorizing}, () => {
            $('#' + target).remove();
          });
        });
      }
    })
  }

/*------------------------------- CREATE NAV ---------------------------------*/
  /* CREATE NAVIGATION ITEMS */
  function createNav() {
    const nav = $('.navigation ul');
    nav.html('');

    nav.append('<li class="nav-link translate" data-target="#translate">Translate</li>');
    if (settings.isAuth) {
      nav.append(
        '<li class="nav-link words-list" data-target="#results">My Words</li>' +
        '<li class="logout">Logout</li>'
      )
    } else {
      nav.append('<li class="nav-link auth" data-target="#auth-form">Authentication</li>');
    }

    $('.nav-link.active').removeClass('active');
    $('.active-tab').removeClass('active-tab');
    $('.translate').addClass('active');
    $('#translate').addClass('active-tab');
  }

  /* NAVIGATION FUNCTION */
  $('body').on('click', '.nav-link', (e) => {
    const link = $(e.target);
    if (link.hasClass('active')) return;

    const target = $(link.attr('data-target'));
    if (target) {
      $('.nav-link.active').removeClass('active');
      link.addClass('active');
      $('.active-tab').removeClass('active-tab');
      target.addClass('active-tab');
    }
  });

/*------------------------------- AUTH ---------------------------------*/
  $('body').on('click', '.register, .login', (e) => {
    e.preventDefault();

    if ($(e.target).hasClass('register')) {
      sendAuthRequest();
    } else {
      sendAuthRequest('login');
    }
  });

  /* SEND AUTH REQUEST */
  function sendAuthRequest(isLogin) {
    let url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyAQGCNngi5zGARnGq1JXCD2GHrcuL8vVXA';
    let messageSuccess = 'Authorized!';

    if (isLogin) {
      url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyAQGCNngi5zGARnGq1JXCD2GHrcuL8vVXA';
    }

    let data = {
      email: $('#login').val(),
      password: $('#password').val(),
      returnSecureToken: true
    }

    $('.auth-form').append(spinner);
    $('.auth-form input, .auth-form .btn').attr('disabled', 'disabled');
    $.ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function(result) {
        $('.auth-form input, .auth-form .btn').removeAttr('disabled');
        $('.auth-form .lds-ring').remove();
        saveUser(result);
        setMessage(messageSuccess);
        clearTranslation();
        $('#login').val('');
      },
      error: (err) => {
        $('.auth-form input, .auth-form .btn').removeAttr('disabled');
        $('.auth-form .lds-ring').remove();
        setMessage(err.responseJSON.error.code + ': ' + err.responseJSON.error.message, 'error');
      }
    });
  }

  /* SET MESSAGE */
  function setMessage(message, type) {
    let messageBox = $('.message');

    if (type === 'error') {
      messageBox.addClass('error');
    } else {
      messageBox.removeClass('error');
    }

    messageBox.text(message);
    messageBox.slideDown();

    setTimeout(() => {
      messageBox.slideUp(300, () => {
        messageBox.removeClass('error')
      });
    }, 3000);
  }

  /* SWITCH REGISTER/LOGIN */
  function switchAuth() {
    $('body').on('click', '.switch', (e) => {
      e.preventDefault();
      const btn = $('.auth-form .btn');
      const header = $('.auth-form h2');

      if (btn.hasClass('register')) {
        btn.removeClass('register').addClass('login');
        btn.text('Login');
        $(e.target).text('Switch to Sign Up');
        header.text('Login');
      } else {
        btn.removeClass('login').addClass('register');
        btn.text('Sign Up');
        $(e.target).text('Switch to Login');
        header.text('Sign Up');
      }
    });
  }

  /* SAVE USER */
  function saveUser(info) {

    let userInfo = {...info}
    userInfo.expiresIn = new Date(new Date().getTime() + info.expiresIn * 1000);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    getSettings(createNav, userInfo);
    sendMessageLogin(userInfo);
  }

  /* LOGOUt */
  function logout() {
    $('body').on('click', '.logout', (e) => {
      localStorage.removeItem('userInfo');
      chrome.storage.local.clear();
      getSettings(createNav, 'logout');
      sendMessageLogin();
      clearTranslation();
    });
  }

/*------------------------- MESSAGING ---------------------------*/
  chrome.runtime.onMessage.addListener(req => {
    if (req.msg === 'TRANSLATIONS_RECEIVED') {
      getTranslations();
    }
  });

  function sendMessageLogin(data) {

    chrome.runtime.sendMessage({
      msg: 'LOGIN',
      data: data
    });
  }

  function getSettings(callback, data) {
    chrome.runtime.sendMessage({
      msg: 'SETTINGS_REQUEST',
      data: data
    }, resp => {
      settings = resp;
      if (callback) {
        callback();
      }
    });
  }

/*------------------------- SAVE TRANSLATION ---------------------------*/
  function saveTranslation() {
    currentTranslate.userId = settings.userInfo.localId;

    $.ajax({
      type: 'POST',
      url: 'https://memorizing-bc6a4.firebaseio.com/words.json',
      contentType: "application/json",
      data: JSON.stringify(currentTranslate),
      success: resp => {
        chrome.runtime.sendMessage({
          msg: 'WORD_SAVED',
          name: resp.name,
          data: currentTranslate
        });
        $('#translate-text').val('');
        clearTranslation();
        setMessage('Saved!')
      },
      error: err => {
        console.log(err);
        alert('Not saved! More info in console.');
      }
    });
  }

  $('body').on('click', '.change-translation', e => {
    const newVal = $(e.target).text();
    $('.current-translate').text(newVal);
    currentTranslate.sentences[0].trans = newVal;
  });
});