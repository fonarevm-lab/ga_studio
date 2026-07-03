// ══════════════════════════════════════
// IMPORT — Импорт данных из формата Яндекс Таблиц
// ══════════════════════════════════════
// Принимает данные в формате Яндекс Таблиц
// и преобразует их обратно в объекты проекта.
// Без API. Только преобразование данных.
// ══════════════════════════════════════

function importFromYandexFormat(data) {
  if (!data) return null;

  const result = {
    clients: [],
    services: [],
    appointments: [],
    settings: {},
  };

  // ─── Клиенты ───
  if (Array.isArray(data.clients)) {
    result.clients = data.clients.map(row => ({
      id:        Number(row['ID']) || 0,
      name:      String(row['Имя'] || ''),
      phone:     String(row['Телефон'] || ''),
      notes:     String(row['Заметки'] || ''),
      allergies: strToArray(row['Аллергии']),
      tags:      strToArray(row['Теги']),
    }));
  }

  // ─── Услуги ───
  if (Array.isArray(data.services)) {
    result.services = data.services.map(row => ({
      id:       Number(row['ID']) || 0,
      name:     String(row['Название'] || ''),
      category: String(row['Категория'] || ''),
      duration: Number(row['Длительность']) || 60,
      price:    Number(row['Цена']) || 0,
      active:   row['Активна'] === 'Да' || row['Активна'] === true,
    }));
  }

  // ─── Записи ───
  if (Array.isArray(data.appointments)) {
    result.appointments = data.appointments.map(row => ({
      id:          Number(row['ID']) || 0,
      clientId:    Number(row['Клиент ID']) || 0,
      serviceId:   Number(row['Услуга ID']) || 0,
      time:        yandexDateTimeToDate(row['Дата'], row['Время']),
      duration:    Number(row['Длительность']) || 60,
      status:      String(row['Статус'] || 'pending'),
      startedAt:   isoToDate(row['Начало']),
      completedAt: isoToDate(row['Завершение']),
      comment:     String(row['Комментарий'] || ''),
    }));
  }

  // ─── Настройки (key-value → объект) ───
  if (Array.isArray(data.settings)) {
    const s = {
      salon: { name:'', address:'', phone:'' },
      master: { name:'', surname:'', role:'', cabinet:0 },
      workHours: { start:9, end:20 },
      features: {},
    };
    data.settings.forEach(row => {
      const key = row['Ключ'] || '';
      const val = row['Значение'] || '';
      if (key === 'salon.name') s.salon.name = val;
      else if (key === 'salon.address') s.salon.address = val;
      else if (key === 'salon.phone') s.salon.phone = val;
      else if (key === 'master.name') s.master.name = val;
      else if (key === 'master.surname') s.master.surname = val;
      else if (key === 'master.role') s.master.role = val;
      else if (key === 'master.cabinet') s.master.cabinet = Number(val) || 0;
      else if (key === 'workHours.start') s.workHours.start = Number(val) || 9;
      else if (key === 'workHours.end') s.workHours.end = Number(val) || 20;
      else if (key.startsWith('features.')) {
        s.features[key.slice(9)] = val === 'true';
      }
    });
    result.settings = s;
  }

  return result;
}
