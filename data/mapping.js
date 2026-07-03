// ══════════════════════════════════════
// MAPPING — Соответствие полей проекта и столбцов Яндекс Таблиц
// ══════════════════════════════════════
// Не выполняет сетевых запросов.
// Только описывает структуру будущих таблиц.
// ══════════════════════════════════════

const YandexMapping = {

  // ─── ТАБЛИЦА «Клиенты» ───
  clients: {
    sheetName: 'Клиенты',
    columns: {
      'ID':         { field: 'id',         type: 'number',  required: true,  unique: true },
      'Имя':        { field: 'name',       type: 'string',  required: true  },
      'Телефон':    { field: 'phone',      type: 'string',  required: false },
      'Заметки':    { field: 'notes',      type: 'string',  required: false },
      'Аллергии':   { field: 'allergies',  type: 'string',  required: false }, // массив → строка через запятую
      'Теги':       { field: 'tags',       type: 'string',  required: false }, // массив → строка через запятую
    },
  },

  // ─── ТАБЛИЦА «Услуги» ───
  services: {
    sheetName: 'Услуги',
    columns: {
      'ID':         { field: 'id',         type: 'number',  required: true,  unique: true },
      'Название':   { field: 'name',       type: 'string',  required: true  },
      'Категория':  { field: 'category',   type: 'string',  required: false },
      'Длительность':{ field: 'duration',  type: 'number',  required: true  }, // минуты
      'Цена':       { field: 'price',      type: 'number',  required: true  },
      'Активна':    { field: 'active',     type: 'boolean', required: false },
    },
  },

  // ─── ТАБЛИЦА «Записи» ───
  appointments: {
    sheetName: 'Записи',
    columns: {
      'ID':         { field: 'id',          type: 'number',  required: true,  unique: true },
      'Клиент ID':  { field: 'clientId',    type: 'number',  required: true  }, // FK → Клиенты.ID
      'Услуга ID':  { field: 'serviceId',   type: 'number',  required: true  }, // FK → Услуги.ID
      'Дата':       { field: 'date',        type: 'date',    required: true  },
      'Время':      { field: 'startTime',   type: 'time',    required: true  },
      'Длительность':{ field: 'duration',   type: 'number',  required: true  }, // минуты
      'Статус':     { field: 'status',      type: 'string',  required: true  },
      'Начало':     { field: 'startedAt',   type: 'datetime', required: false },
      'Завершение': { field: 'completedAt', type: 'datetime', required: false },
      'Комментарий':{ field: 'comment',     type: 'string',  required: false },
    },
  },

  // ─── ТАБЛИЦА «Настройки» ───
  settings: {
    sheetName: 'Настройки',
    columns: {
      'Ключ':       { field: 'key',         type: 'string',  required: true,  unique: true },
      'Значение':   { field: 'value',       type: 'string',  required: true  },
    },
    // Настройки хранятся как пары ключ-значение (key-value store)
    // Пример: salon.name = "GA Studio"
    //         master.name = "Алина"
    //         features.calendar = "true"
  },
};

// ══════════════════════════════════════
// Вспомогательные функции маппинга
// ══════════════════════════════════════

/** Преобразовать массив в строку для Яндекс Таблиц */
function arrayToStr(arr) {
  return Array.isArray(arr) ? arr.join(', ') : String(arr || '');
}

/** Преобразовать строку обратно в массив */
function strToArray(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

/** Преобразовать Date/null в строку ISO для Яндекс Таблиц */
function dateToISO(d) {
  if (!d) return '';
  return d instanceof Date ? d.toISOString() : String(d);
}

/** Преобразовать строку ISO обратно в Date */
function isoToDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/** Преобразовать Date в строку даты "YYYY-MM-DD" */
function dateToYandexDate(d) {
  if (!d) return '';
  if (!(d instanceof Date)) return String(d);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Преобразовать Date в строку времени "HH:MM" */
function dateToYandexTime(d) {
  if (!d) return '';
  if (!(d instanceof Date)) return String(d);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

/** Преобразовать строку даты "YYYY-MM-DD" + время "HH:MM" в Date */
function yandexDateTimeToDate(dateStr, timeStr) {
  if (!dateStr) return null;
  const full = timeStr ? dateStr + 'T' + timeStr : dateStr + 'T00:00:00';
  const d = new Date(full);
  return isNaN(d.getTime()) ? null : d;
}
