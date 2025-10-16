import axios from "axios";

export class expenseService {
  static FREQUENT_URL = "http://localhost:6100/frequentRecords";
  static DAILY_URL = "http://localhost:6100/dailyRecords";

  static getFrequentRecords() {
    return axios.get(this.FREQUENT_URL);
  }

  static addFrequentRecord(record) {
    return axios.post(this.FREQUENT_URL, record);
  }

  static updateFrequentRecord(id, record) {
    return axios.put(`${this.FREQUENT_URL}/${id}`, record);
  }

  static deleteFrequentRecord(id) {
    return axios.delete(`${this.FREQUENT_URL}/${id}`);
  }

  // frequent records over
  // daily records begins
  

  static getDailyRecords() {
    return axios.get(this.DAILY_URL);
  }

  static addDailyRecord(record) {
    return axios.post(this.DAILY_URL, record);
  }

  static updateDailyRecord(id, record) {
    return axios.put(`${this.DAILY_URL}/${id}`, record);
  }

  static deleteDailyRecord(id) {
    return axios.delete(`${this.DAILY_URL}/${id}`);
  }
}
