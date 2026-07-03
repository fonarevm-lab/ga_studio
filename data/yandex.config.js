// ══════════════════════════════════════
// YANDEX CONFIG — Конфигурация Яндекс Таблиц
// ══════════════════════════════════════
// Для подключения:
// 1. Вставьте токен Яндекс API (IAM или OAuth)
// 2. Вставьте ID таблицы из URL
//    https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
// 3. Установите enabled: true
// ══════════════════════════════════════

window.YandexConfig = {
  // API-токен Яндекс (IAM-токен или OAuth)
  // Получить: https://cloud.yandex.ru/docs/iam/operations/create/token
  token: '',

  // ID таблицы (из URL: https://docs.google.com/spreadsheets/d/{ID}/edit)
  spreadsheetId: '',

  // Включить интеграцию (true = Яндекс Таблицы, false = локальные данные)
  enabled: false,

  // Названия листов (должны совпадать с листами в таблице)
  sheets: {
    clients: 'Клиенты',
    services: 'Услуги',
    appointments: 'Записи',
    settings: 'Настройки',
  },

  // Таймаут запросов (мс)
  timeout: 10000,
};
