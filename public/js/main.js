const t = new Date();
t.setDate(t.getDate() - t.getDay());
const currentWeek = 'Since ' + t.toLocaleDateString();
document.getElementById('currentWeek').innerHTML = currentWeek;
