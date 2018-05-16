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
  const spinner = $('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>');
  $('body').on('click', (e) => {

      if ($(e.target).hasClass('show-dictionary')) {
        showDictionary($(e.target));
      }
      if ($(e.target).hasClass('delete-word')) {
        deleteWord($(e.target).parent().attr('id'), );
      }
  });
  getTranslations();


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

    if (!translationsList) {
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
});