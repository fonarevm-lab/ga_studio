// ══════════════════════════════════════
// EXPORT — Экспорт данных в формат Яндекс Таблиц
// ══════════════════════════════════════
// Преобразует текущие данные проекта в структуру,
// готовую для записи в Яндекс Таблицы.
// Без API. Только преобразование данных.
// ══════════════════════════════════════

function exportToYandexFormat() {
  const clients = DataProvider.getClients();
  const services = DataProvider.getServices();
  const appointments = DataProvider.getAppointments();
  const settings = DataProvider.getSettings();

  return {
    // ─── Клиенты ───
    clients: clients.map(c => ({
      'ID':        c.id,
      'Имя':       c.name,
      'Телефон':   c.phone || '',
      'Заметки':   c.notes || '',
      'Аллергии':  arrayToStr(c.allergies),
      'Теги':      arrayToStr(c.tags),
    })),

    // ─── Услуги ───
    services: services.map(s => ({
      'ID':          s.id,
      'Название':    s.name,
      'Категория':   s.category || '',
      'Длительность': s.duration,
      'Цена':        s.price,
      'Активна':     s.active !== false ? 'Да' : 'Нет',
    })),

    // ─── Записи ───
    appointments: appointments.map(a => ({
      'ID':          a.id,
      'Клиент ID':   a.clientId,
      'Услуга ID':   a.serviceId,
      'Дата':        dateToYandexDate(a.time),
      'Время':       dateToYandexTime(a.time),
      'Длительность': a.duration,
      'Статус':      a.status,
      'Начало':      dateToISO(a.startedAt),
      'Завершение':  dateToISO(a.completedAt),
      'Комментарий': a.comment || '',
    })),

    // ─── Настройки (key-value) ───
    settings: [
      { 'Ключ': 'salon.name',       'Значение': settings.salon?.name || '' },
      { 'Ключ': 'salon.address',    'Значение': settings.salon?.address || '' },
      { 'Ключ': 'salon.phone',      'Значение': settings.salon?.phone || '' },
      { 'Ключ': 'master.name',      'Значение': settings.master?.name || '' },
      { 'Ключ': 'master.surname',   'Значение': settings.master?.surname || '' },
      { 'Ключ': 'master.role',      'Значение': settings.master?.role || '' },
      { 'Ключ': 'master.cabinet',   'Значение': String(settings.master?.cabinet || '') },
      { 'Ключ': 'workHours.start',  'Значение': String(settings.workHours?.start || '') },
      { 'Ключ': 'workHours.end',    'Значение': String(settings.workHours?.end || '') },
      ...Object.entries(settings.features || {}).map(([k, v]) => ({
        'Ключ': 'features.' + k,
        'Значение': String(v),
      })),
    ],
  };
}
