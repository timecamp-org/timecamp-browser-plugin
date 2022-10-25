import ApiService from "./ApiService";
import StorageManager from "./StorageManager";

//change this in production
const GOOGLE_ANALYTICS_ID = 'UA-244842172-1'
const SUFFIX = '_timecamp_plugin'
const TRACKING_ID_KEY = 'analyticsId'

export default class AnalyticsService {

    constructor() {
        this.storageManager = new StorageManager();
        this.apiService = new ApiService();
    }
    trackEvent(eventCategory, eventAction) {
        return this.storageManager.get(TRACKING_ID_KEY).then(id => {
            if (!id) {
                return;
            }
            this.apiService.logEvent(id, eventCategory, eventAction)
        })
    }
    logEvent(request, sender, sendResponse) {
        try {
            switch (request.type) {
                case 'view':
                    this.trackEvent('popupView', 'view'); break;
                case 'timerStart':
                    this.trackEvent('popupTimerStart', 'click'); break;
                case 'timerStop':
                    this.trackEvent('popupTimerStop', 'click'); break;

            }
        } catch (e) {

        }
    }
    generateTrackingId() {
        return this.storageManager.get(TRACKING_ID_KEY).then(id => {
            if (id) return
            let uid = `1743699829.${Date.now() / 1000 | 0}`
            return this.storageManager.set(TRACKING_ID_KEY, uid)
        })
    }
}