'use strict';

var reqwest = require('reqwest');

var input = document.querySelector("#employeeForm input[name='medewerker']");
if (!input) {
    input = document.querySelector("#employeeForm select[name='medewerker']");
    if (!input) {
        alert('Go to the timesheet page so the script could get your details');
        return;
    }
}

var userId = input.value,
    overlay = document.createElement('div'),
    today = new Date(Date.now()),
    dateDefault = [
        today.getFullYear(),
        today.getMonth() < 9 ?
        ('0' + today.getMonth()) :
        (today.getMonth() + 1),
        today.getDate() < 10 ?
        ('0' + today.getDate()) :
        today.getDate()
    ].join('-');

overlay.setAttribute('style',
    'position: fixed; top: 50px; left: 50%; margin-left: -250px;' +
    'background: #fff; padding: 30px; color: #333;' +
    'width: 500px; min-height: 200px; display: block; ' +
    'box-shadow: 0 0 20px rgba(0,0,0,0.8); border-radius: 4px;');

overlay.innerHTML = '<h2>' +
    document.querySelector('.teamNameLogInOutBox .loginfo .name').innerHTML +
    '(' + input.value + ')</h2>' +
    '<form id="hack-form" style="margin-top: 20px;"><table>' +
    '<tr><td><label for="hack-start">Start date</label></td><td>' +
    '<input id="hack-start" name="dateStart" type="date" value="' + dateDefault + '"></td>' +
    '<td><label for="hack-end">End date</label></td>' +
    '<td><input id="hack-end" name="dateEnd" type="date" value="' + dateDefault + '"></td></tr>' +
    '<tr><td><label for="hack-hours">Hours per day</label></td>' +
    '<td><input id="hack-hours" name="hours" type="text" value="8"></td>' +
    '<td><label for="hack-proj">Project</label></td>' +
    '<td id="hack-proj-select-placeholder"></td></tr>' +
    '<tr><td></td><td></td><td><label for="hack-cat">Category</label></td>' +
    '<td id="hack-cat-select-placeholder"></td></tr>' +
    '<tr><td colspan="4" align="center">' +
    '<input type="submit" value="Go" style="font-size: 2em;"></td></tr>' +
    '<tr><td colspan="4" align="center">' +
    '<div class="progress" style="font-size: 3em; font-weight: bold; ' +
    'text-align: center"></div></td></tr></table></form>';

// put project select in
(function(projPlaceholder, catPlaceholder) {
    var select = document.querySelector('.tsRegelTr .projectenTitel[name^=projectId]');
    select = select.cloneNode(true);
    select.setAttribute('name', 'projectId');
    projPlaceholder.appendChild(select);

    select = document.querySelector('.tsRegelTr .projectenTitel[name^=categorieId]');
    select = select.cloneNode(true);
    select.setAttribute('name', 'catId');
    catPlaceholder.appendChild(select);
})(overlay.querySelector('#hack-proj-select-placeholder'),
    overlay.querySelector('#hack-cat-select-placeholder'));

function getDateFromInput(value) {
    value = value.split('-').map(function(n, i) {
        return i === 1 ? parseInt(n) - 1 : parseInt(n);
    });
    return new Date(value[0], value[1], value[2]);
};

var form = overlay.querySelector('#hack-form');
form.addEventListener('submit', function(evt) {
    evt.preventDefault();

    var data = [],
        urls = [],
        progress = overlay.querySelector('.progress'),
        dateStart = getDateFromInput(this['dateStart'].value),
        dateEnd = getDateFromInput(this['dateEnd'].value),
        hours = this['hours'].value,
        projectId = this['projectId'].value,
        catId = this['catId'].value,
        days = (dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24),
        date = new Date(dateStart.getTime()),
        url = document.getElementById('employeeForm').getAttribute('action'),
        total = 0;

    if (days <= 0) {
        alert('Check the dates');
        return;
    }

    for (var i = 0; i < days; i++) {
        date.setDate(date.getDate() + 1);
        var day = date.getDay();

        // sat, su
        if (date.getDay() % 6 === 0) {
            continue;
        }

        data.push({
            ajax: "insertRegel",
            medewerker: userId,
            datumDag: date.getDate(),
            datumMaand: date.getMonth() + 1,
            datumJaar: date.getFullYear(),
            projectId: projectId,
            categorieId: catId,
            omschrijving: "Update",
            uren: hours
        });
    }

    total = data.length;

    function post() {
        progress.innerHTML = data.length > 0 ?
            ((((total - data.length) / total) * 100).toFixed(2) + '%') : '100%';
        var requestData = data.pop();
        if (!requestData) return;
        reqwest({
            url: url,
            data: requestData,
            method: 'POST',
            complete: function(response) {
                console.log(response);
                post();
            }
        });
    }
    post();
});

document.body.appendChild(overlay);
