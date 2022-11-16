import ApiService from "./ApiService";
import StorageManager from "./StorageManager";

const TRACKING_ID_KEY = 'analyticsId'

export default class AnalyticsService {

    constructor() {
        this.storageManager = new StorageManager();
        this.apiService = new ApiService();
    }
    trackEvent(eventCategory, eventAction) {
        this.getOrGenerateTrackingId().then((trackingId) => {
            this.apiService.logEvent(trackingId, eventCategory, eventAction)
        });
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
    getOrGenerateTrackingId() {
        return new Promise((resolve) => {
            this.storageManager.get(TRACKING_ID_KEY).then(trackingId => {
                if (trackingId) {
                    resolve(trackingId);
                    return;
                }

                let newTrackingId = `1743699829.${Date.now() / 1000 | 0}`
                this.storageManager.set(TRACKING_ID_KEY, newTrackingId);
                resolve(newTrackingId);
            })
        });
    }
}