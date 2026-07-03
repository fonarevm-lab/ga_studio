// ══════════════════════════════════════
// DATA PROVIDER — Абстракция над данными
// ══════════════════════════════════════
// Выбирает адаптер в зависимости от YandexConfig.enabled:
//   true  → YandexAdapter (Яндекс Таблицы)
//   false → LocalAdapter  (локальные JS-файлы)
//
// Интерфейс НЕ знает, откуда приходят данные.
// Для замены источника данных достаточно переключить enabled.
// ══════════════════════════════════════

const DataProvider = {

  // ─── Выбор адаптера ───
  _adapter: null,

  _getAdapter() {
    if (this._adapter) return this._adapter;
    // Если включены Яндекс Таблицы и есть токен → YandexAdapter
    if (window.YandexConfig && YandexConfig.enabled && YandexConfig.token) {
      this._adapter = window.YandexAdapter || LocalAdapter;
    } else {
      this._adapter = window.LocalAdapter || LocalAdapter;
    }
    return this._adapter;
  },

  /** Переключить адаптер вручную */
  setAdapter(adapter) {
    this._adapter = adapter;
  },

  /** Получить текущий адаптер */
  getAdapter() {
    return this._getAdapter();
  },

  // ─── CLIENTS ───
  async getClientsAsync() {
    return this._getAdapter().loadClients();
  },
  getClients() {
    return window.DATA_clients || [];
  },
  getClientById(id) {
    return this.getClients().find(c => c.id === id) || null;
  },
  getClientName(appointment) {
    const c = this.getClientById(appointment.clientId);
    return c ? c.name : '—';
  },

  // ─── SERVICES ───
  async getServicesAsync() {
    return this._getAdapter().loadServices();
  },
  getServices() {
    return window.DATA_services || [];
  },
  getServiceById(id) {
    return this.getServices().find(s => s.id === id) || null;
  },
  getServiceName(appointment) {
    const s = this.getServiceById(appointment.serviceId);
    return s ? s.name : '—';
  },
  getServicePrice(appointment) {
    const s = this.getServiceById(appointment.serviceId);
    return s ? s.price : 0;
  },
  getServiceDuration(appointment) {
    const s = this.getServiceById(appointment.serviceId);
    return s ? s.duration : 60;
  },

  // ─── APPOINTMENTS ───
  async getAppointmentsAsync(mkTimeFn) {
    return this._getAdapter().loadAppointments(mkTimeFn);
  },
  getAppointments() {
    return window.DATA_appointments || [];
  },
  setAppointments(data) {
    window.DATA_appointments = data;
  },
  getAppointmentById(id) {
    return this.getAppointments().find(a => a.id === id) || null;
  },

  // ─── SETTINGS ───
  async getSettingsAsync() {
    return this._getAdapter().loadSettings();
  },
  getSettings() {
    return window.DATA_settings || {};
  },
  getFeatures() {
    return this.getSettings().features || {};
  },
  getSalon() {
    return this.getSettings().salon || {};
  },
  getMaster() {
    return this.getSettings().master || {};
  },

  // ─── MUTATIONS ───
  async saveAppointment(appt) {
    const result = await this._getAdapter().saveAppointment(appt);
    // Обновляем локальный кэш
    const appts = this.getAppointments();
    appts.push(result);
    return result;
  },

  async updateAppointment(id, updates) {
    const result = await this._getAdapter().updateAppointment(id, updates);
    // Обновляем локальный кэш
    const appts = this.getAppointments();
    const idx = appts.findIndex(a => a.id === id);
    if (idx >= 0) Object.assign(appts[idx], updates);
    return result;
  },

  async deleteAppointment(id) {
    const result = await this._getAdapter().deleteAppointment(id);
    // Обновляем локальный кэш
    const appts = this.getAppointments();
    const idx = appts.findIndex(a => a.id === id);
    if (idx >= 0) appts.splice(idx, 1);
    return result;
  },

  // ─── CONNECTION ───
  async checkConnection() {
    return this._getAdapter().checkConnection();
  },
};
