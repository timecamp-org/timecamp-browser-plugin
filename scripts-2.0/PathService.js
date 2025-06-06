import DateTime from "./helpers/DateTime";
import StorageManager from "./StorageManager";

const LOGIN_GET_KEY = 'loginToBrowserPlugin';

export default class PathService {
    serverUrl = process.env.SERVER_PROTOCOL + '://' + process.env.SERVER_DOMAIN + '/';
    nextServerUrl =  process.env.SERVER_PROTOCOL + '://' + process.env.NEXT_SERVER_DOMAIN + '/';
    marketingPageUrl = process.env.SERVER_PROTOCOL + '://' + process.env.MARKETING_PAGE_DOMAIN + '/';

    constructor() {
        if (PathService.instance) {
            return PathService.instance;
        }

        this.storageManager = new StorageManager();

        this.init();

        PathService.instance = this;
    }

    init() {
        this.storageManager.get(StorageManager.STORAGE_KEY_DOMAIN).then((value) => {
            console.log('Loaded domain:', value);
            if (value) {
                this.changeBaseUrl(value);
            }
        }).catch((e) => {
            console.error('Failed to load domain:', e);
        });
    }


    changeBaseUrl(url) {
        if (!url || url === '') {
            this.serverUrl = process.env.SERVER_PROTOCOL + '://' + process.env.SERVER_DOMAIN + '/';

            return;
        }

        this.serverUrl = url;
    }

    getBaseUrl() {
        return this.serverUrl;
    }

    getLoginUrl() {
        return this.serverUrl + 'auth/login?' + LOGIN_GET_KEY + '=true';
    }

    getRegisterUrl() {
        return this.serverUrl + 'auth/register';
    }

    getTokenUrl() {
        return this.serverUrl + 'auth/token';
    }

    getOpenIdTokenUrl() {
        return this.serverUrl + 'openid/id_token';
    }

    getNextOpenIdTokenAuthUrl() {
        return this.nextServerUrl + 'authenticate/oidc';
    }

    getAccessUrl() {
        return this.serverUrl + 'auth/access';
    }

    getSignInUrl() {
        return this.serverUrl + 'auth/login';
    }

    getStatusUrl() {
        return this.serverUrl + 'chrome_plugin/api' + '/timer';
    }

    getStartUrl() {
        return this.serverUrl + 'chrome_plugin/api' + '/timer';
    }

    getStopUrl() {
        return this.serverUrl + 'chrome_plugin/api' + '/timer';
    }

    getEditEntryUrl() {
        return this.serverUrl + 'chrome_plugin/api' + '/entries';
    }

    getAddEntryUrl() {
        return this.serverUrl + 'chrome_plugin/api' + '/entries';
    }

    getDiscoveryUrl() {
        return this.serverUrl + 'chrome_plugin/api' + '/discovery';
    }

    getMeUrl() {
        return this.serverUrl + 'chrome_plugin/api' + '/me/service/chrome-plugin';
    }

    getSettingUrl(groupId, name) {
        return this.serverUrl + 'chrome_plugin/api/group/' + groupId + '/setting/name/' + name;
    }

    getUserSettingUrl(userId) {
        return this.serverUrl + 'chrome_plugin/api/user/' + userId + '/setting';
    }

    getTagListsUrl(tags, archived, useRestrictions, taskId, sortedArray) {
        return this.serverUrl + "chrome_plugin/api/tag_list?tags=" + tags + "&archived=" + archived + "&use_restrictions=" + useRestrictions + "&task_id=" + taskId + "&alphabetically_sorted_array=" + sortedArray;
    }

    getRecentlyUsedUrl() {
        return this.serverUrl + "chrome_plugin/api/task/user/recently_used";
    }

    getTasksUrl() {
        return this.serverUrl + "chrome_plugin/api/tasks";
    }

    getGraphQlUrl() {
        return this.nextServerUrl + "graphql";
    }

    getAssignTagsToEntryUrl(entryId) {
        return this.serverUrl + "chrome_plugin/api/entries/" + entryId + "/tags";
    }

    getFeatureFlagUrl() {
        return this.serverUrl + 'chrome_plugin/api/feature_flag';
    }

    hasIntegration() {
        return this.serverUrl + 'chrome_plugin/api/has_integration';
    }

    getIntegrationUrl(service) {
        switch (service) {
            case 'googlecalendar':
                return this.serverUrl + 'app#/settings/users/me#google-calendar-box';
        }
        return this.serverUrl + 'addons/' + this.getIntegrationNameFromTimeCampApp(service) + '/';
    }

    getIntegrationMarketingWebsiteUrl(service) {
        switch(service) {
            case 'zoho':
                return this.marketingPageUrl + 'kb/zoho-crm-integration/';
            default:
                return this.marketingPageUrl + 'integrations/' + this.getIntegrationNameFromWebsite(service) + '-time-tracking/';
        }
    }

    getIntegrationNameFromTimeCampApp(service) {
        switch(service) {
            case 'wrike':
                return 'wrike_v4';
            default:
                return service;
        }
    }

    getIntegrationNameFromWebsite(service) {
        switch(service) {
            case 'dropboxpaper':
                return 'dropbox-paper';
            case 'googlecalendar':
                return 'google-calendar';
            default:
                return service;
        }
    }

    getIntegrationNameFromMessage(service) {
        switch (service) {
            case 'googlecalendar':
                return 'Google Calendar';
            default:
                return service;
        }
    }
    getAnalyticsUrl(){
        return `https://www.google-analytics.com/j/collect`
    }
    getReportDetailedUrl(){
        return this.serverUrl + 'api/v2/reports';
    }
    getReportsStatusUrl(id){
        return `${this.serverUrl}api/v2/reports/${id}/status`;
    }
    getReportsResultUrl(id){
        return `${this.serverUrl}api/v2/reports/${id}/raw`;
    }
    getUsersUrl(){
        return this.serverUrl + "third_party/api/users?active_only=true";
    }
}
