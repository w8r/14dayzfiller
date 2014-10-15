var projectNumber= '133662' //fastnet;
var category= '49117' //Development;
var time= '8' // hours

$(function(){
	var tables = $('table.timeSheet');

	for (var i = 0; i < 6; i++) {
		
		$('#' + tables[i].id).find('tr:nth-child(2) [id^=projectenSelectboxnew]').val(projectNumber);
		$('#' + tables[i].id).find('tr:nth-child(2) [id^=catsSelectboxnew]').val(category);

		$('#' + tables[i].id).find('tr:nth-child(2) [id^=urenInputnew]').focus();
		$('#' + tables[i].id).find('tr:nth-child(2) [id^=urenInputnew]').val(time);
		$('#' + tables[i].id).find('tr:nth-child(2) [id^=urenInputnew]').blur();
	};
});
