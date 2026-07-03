// ══════════════════════════════════════
// YANDEX ADAPTER — Интеграция с Яндекс Таблицами
// ══════════════════════════════════════
// Используется когда YandexConfig.enabled === true
// Все запросы через Яндекс Sheets API v4
// ══════════════════════════════════════

const YandexAdapter = {

  _baseUrl: 'https://api.sheets.googleapis.com/v4/spreadsheets',
  _token: null,

  _getHeaders() {
    return {
      'Authorization': 'Bearer ' + (this._token || YandexConfig.token),
      'Content-Type': 'application/json',
    };
  },

  _getSpreadsheetId() {
    return YandexConfig.spreadsheetId;
  },

  async _fetch(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), YandexConfig.timeout);
    try {
      const resp = await fetch(url, {
        ...options,
        headers: { ...this._getHeaders(), ...options.headers },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!resp.ok) {
        const err = await resp.text();
        throw new Error('HTTP ' + resp.status + ': ' + err);
      }
      return await resp.json();
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  },

  async _readSheet(sheetName) {
    const url = this._baseUrl + '/' + this._getSpreadsheetId() + '/values/' + encodeURIComponent(sheetName) + '?majorDimension=ROWS';
    const data = await this._fetch(url);
    const rows = data.values || [];
    if (rows.length < 2) return [];
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
  },

  async _writeSheet(sheetName, rows) {
    const url = this._baseUrl + '/' + this._getSpreadsheetId() + '/values/' + encodeURIComponent(sheetName) + '?valueInputOption=USER_ENTERED';
    await this._fetch(url, {
      method: 'PUT',
      body: JSON.stringify({ values: rows }),
    });
  },

  async _appendSheet(sheetName, rows) {
    const url = this._baseUrl + '/' + this._getSpreadsheetId() + '/values/' + encodeURIComponent(sheetName) + ':append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';
    await this._fetch(url, {
      method: 'POST',
      body: JSON.stringify({ values: rows }),
    });
  },

  // ─── READ (using mapping.js) ───
  async loadClients() {
    const rows = await this._readSheet(YandexConfig.sheets.clients);
    const mapping = YandexMapping.clients.columns;
    return rows.map(row => {
      const obj = {};
      Object.entries(mapping).forEach(([col, def]) => {
        let val = row[col] || '';
        if (def.type === 'number') val = Number(val) || 0;
        if (def.type === 'boolean') val = val === 'Да' || val === 'true';
        if (def.field === 'allergies' || def.field === 'tags') val = strToArray(val);
        obj[def.field] = val;
      });
      return obj;
    });
  },

  async loadServices() {
    const rows = await this._readSheet(YandexConfig.sheets.services);
    const mapping = YandexMapping.services.columns;
    return rows.map(row => {
      const obj = {};
      Object.entries(mapping).forEach(([col, def]) => {
        let val = row[col] || '';
        if (def.type === 'number') val = Number(val) || 0;
        if (def.type === 'boolean') val = val === 'Да' || val === 'true';
        obj[def.field] = val;
      });
      return obj;
    });
  },

  async loadAppointments(mkTimeFn) {
    const rows = await this._readSheet(YandexConfig.sheets.appointments);
    const mapping = YandexMapping.appointments.columns;
    return rows.map(row => {
      const obj = {};
      Object.entries(mapping).forEach(([col, def]) => {
        let val = row[col] || '';
        if (def.type === 'number') val = Number(val) || 0;
        if (def.type === 'date') val = yandexDateTimeToDate(val, row['Время'] || '');
        if (def.type === 'time') return; // обрабатывается вместе с date
        if (def.type === 'datetime') val = isoToDate(val);
        obj[def.field] = val;
      });
      // Преобразуем date + time → time (Date object)
      if (row['Дата'] && row['Время']) {
        obj.time = yandexDateTimeToDate(row['Дата'], row['Время']);
      }
      return obj;
    });
  },

  async loadSettings() {
    const rows = await this._readSheet(YandexConfig.sheets.settings);
    const s = {
      salon: { name:'', address:'', phone:'' },
      master: { name:'', surname:'', role:'', cabinet:0 },
      workHours: { start:9, end:20 },
      features: {},
    };
    rows.forEach(row => {
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
      else if (key.startsWith('features.')) s.features[key.slice(9)] = val === 'true';
    });
    return s;
  },

  // ─── WRITE ───
  async saveAppointment(appt) {
    const mapping = YandexMapping.appointments.columns;
    const row = {};
    Object.entries(mapping).forEach(([col, def]) => {
      let val = appt[def.field];
      if (def.type === 'date') val = dateToYandexDate(val);
      else if (def.type === 'time') val = ''; // время встроено в date
      else if (def.type === 'datetime') val = dateToISO(val);
      else if (def.type === 'number') val = String(val || '');
      row[col] = val || '';
    });
    // Записи: дата и время в отдельных столбца
    row['Дата'] = dateToYandexDate(appt.time);
    row['Время'] = dateToYandexTime(appt.time);
    await this._appendSheet(YandexConfig.sheets.appointments, [Object.values(row)]);
    return appt;
  },

  async updateAppointment(id, updates) {
    // Читаем все записи, обновляем нужную, перезаписываем
    const rows = await this._readSheet(YandexConfig.sheets.appointments);
    const mapping = YandexMapping.appointments.columns;
    const headers = Object.keys(mapping);
    const idCol = headers.findIndex(h => mapping[h].field === 'id');

    let found = false;
    const updatedRows = rows.map(row => {
      if (Number(row[headers[idCol]]) === id) {
        found = true;
        const newRow = { ...row };
        Object.entries(mapping).forEach(([col, def]) => {
          if (updates[def.field] !== undefined) {
            let val = updates[def.field];
            if (def.type === 'date') val = dateToYandexDate(val);
            else if (def.type === 'datetime') val = dateToISO(val);
            else if (def.type === 'number') val = String(val || '');
            else if (def.type === 'boolean') val = val ? 'Да' : 'Нет';
            else if (def.field === 'allergies' || def.field === 'tags') val = arrayToStr(val);
            newRow[col] = val || '';
          }
        });
        if (updates.time) {
          newRow['Дата'] = dateToYandexDate(updates.time);
          newRow['Время'] = dateToYandexTime(updates.time);
        }
        return newRow;
      }
      return row;
    });

    if (found) {
      const values = [headers, ...updatedRows.map(r => headers.map(h => r[h] || ''))];
      await this._writeSheet(YandexConfig.sheets.appointments, values);
    }
    return found;
  },

  async deleteAppointment(id) {
    // Помечаем как deleted или удаляем строку
    return this.updateAppointment(id, { status: 'deleted' });
  },

  // ─── CONNECTION CHECK ───
  async checkConnection() {
    try {
      const url = this._baseUrl + '/' + this._getSpreadsheetId() + '/sheets/0';
      const data = await this._fetch(url);
      const sheetName = data.properties?.title || 'unknown';
      return {
        success: true,
        message: 'Подключено к: ' + sheetName,
        spreadsheetId: this._getSpreadsheetId(),
      };
    } catch (e) {
      return {
        success: false,
        message: 'Ошибка подключения: ' + e.message,
      };
    }
  },
};
