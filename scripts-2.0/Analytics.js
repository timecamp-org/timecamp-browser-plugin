import StorageManager from "./StorageManager";

const GOOGLE_ANALYTICS_ID = 'UA-244842172-1'
const SUFFIX = '_timecamp_plugin'
const TRACKING_ID_KEY = 'analyticsId'

export default class AnalyticsService {

    constructor() {
        this.storageManager = new StorageManager();
    }
    trackEvent(eventCategory, eventAction) {
        return this.storageManager.get(TRACKING_ID_KEY).then(id => {
            if (!id) return
            eventCategory = eventCategory + SUFFIX
            const endpoint = `https://www.google-analytics.com/j/collect?v=1&t=event&ec=${eventCategory}&ea=${eventAction}&cid=${id}&tid=${GOOGLE_ANALYTICS_ID}`

            fetch(endpoint, {
                method: "POST"
            })
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