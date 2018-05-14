$(function() {
  getTranslations();

  $('#test').on('click', function() {
    getTranslations()
  });

  function getTranslations() {

    const xhr = new XMLHttpRequest();

    xhr.open('GET', 'https://memorizing-f0cb4.firebaseio.com/words.json', true);
    xhr.send();

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
        alert(xhr.status + ': ' + xhr.statusText);
      } else {
        createResultTable(JSON.parse(xhr.responseText));
      }
    }
  }


  function createResultTable(translationsList) {

    const table = $('<div class="table"></div>');

    for (key  in translationsList) {
      console.log(translationsList[key]);
      let tr = $('<div class="tr">' +
          '<div class="td">' + translationsList[key].sentences[0].orig + '</div>' +
          '<div class="td">' + translationsList[key].sentences[0].trans + '</div>' +
        '</tdivr>');

      translationsList[key].dict.forEach(el => {
        tr.append('<div class="dictionary">' +
            '<div>' + el.pos + '</div>' +
            '<div>' + el.terms.join(', ') + '</div>' +
          '</div>')
      });

      table.append(tr);
    }

    $('.result').append(table);
  }
});