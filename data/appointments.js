// ══════════════════════════════════════
// APPOINTMENTS — Записи на сегодня
// ══════════════════════════════════════
// Данные загружаются динамически (через DataProvider)
// Тестовые данные генерируются на основе текущей даты
window.DATA_appointments_generator = function(mkTime) {
  return [
    {id:1, clientId:1, serviceId:1, time:mkTime(9,30),  duration:60,  status:'done',      startedAt:null,  completedAt:null, comment:''},
    {id:2, clientId:2, serviceId:2, time:mkTime(10,30), duration:60,  status:'done',      startedAt:null,  completedAt:null, comment:''},
    {id:3, clientId:3, serviceId:3, time:mkTime(11,30), duration:90,  status:'done',      startedAt:null,  completedAt:null, comment:''},
    {id:4, clientId:4, serviceId:4, time:mkTime(13,0),  duration:120, status:'current',   startedAt:mkTime(13,0), completedAt:null, comment:''},
    {id:5, clientId:5, serviceId:5, time:mkTime(15,0),  duration:60,  status:'pending',   startedAt:null,  completedAt:null, comment:''},
    {id:6, clientId:6, serviceId:6, time:mkTime(16,0),  duration:60,  status:'pending',   startedAt:null,  completedAt:null, comment:''},
    {id:7, clientId:7, serviceId:7, time:mkTime(17,0),  duration:90,  status:'confirmed', startedAt:null,  completedAt:null, comment:''},
    {id:8, clientId:8, serviceId:8, time:mkTime(18,30), duration:60,  status:'pending',   startedAt:null,  completedAt:null, comment:''},
  ];
};
