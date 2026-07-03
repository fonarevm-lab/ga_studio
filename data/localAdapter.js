// ══════════════════════════════════════
// LOCAL ADAPTER — Локальные данные (текущий источник)
// ══════════════════════════════════════
// Используется когда YandexConfig.enabled === false
// Читает данные из window.DATA_* (загруженных из JS-файлов)
// ══════════════════════════════════════

const LocalAdapter = {

  // ─── READ ───
  async loadClients() {
    return window.DATA_clients || [];
  },

  async loadServices() {
    return window.DATA_services || [];
  },

  async loadAppointments(mkTimeFn) {
    if (window.DATA_appointments_generator) {
      return window.DATA_appointments_generator(mkTimeFn);
    }
    return window.DATA_appointments || [];
  },

  async loadSettings() {
    return window.DATA_settings || {};
  },

  // ─── WRITE ───
  async saveAppointment(appt) {
    const appts = window.DATA_appointments || [];
    const maxId = appts.reduce((max, a) => Math.max(max, a.id), 0);
    const newAppt = { ...appt, id: maxId + 1 };
    appts.push(newAppt);
    return newAppt;
  },

  async updateAppointment(id, updates) {
    const appts = window.DATA_appointments || [];
    const idx = appts.findIndex(a => a.id === id);
    if (idx >= 0) {
      Object.assign(appts[idx], updates);
      return appts[idx];
    }
    return null;
  },

  async deleteAppointment(id) {
    const appts = window.DATA_appointments || [];
    const idx = appts.findIndex(a => a.id === id);
    if (idx >= 0) {
      return appts.splice(idx, 1)[0];
    }
    return null;
  },

  // ─── CONNECTION ───
  async checkConnection() {
    return { success: true, message: 'Локальный режим (Яндекс Таблицы отключены)' };
  },
};
