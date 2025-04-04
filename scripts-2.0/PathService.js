import DateTime from "./helpers/DateTime";
const browser = require('webextension-polyfill');

const LOGIN_GET_KEY = 'loginToBrowserPlugin';
const DOMAIN_STORAGE_KEY = 'timecamp_domain';
const DEFAULT_DOMAIN = process.env.SERVER_DOMAIN;

// Include the local domain in the available domains
const AVAILABLE_DOMAINS = [
    DEFAULT_DOMAIN,
    'ue2.timecamp.com'
];

// Make sure local dev domain is also included if it's different
if (DEFAULT_DOMAIN && DEFAULT_DOMAIN !== 'app.timecamp.com' && !AVAILABLE_DOMAINS.includes(DEFAULT_DOMAIN)) {
    AVAILABLE_DOMAINS.push(DEFAULT_DOMAIN);
}

export default class PathService {
    serverUrl = '';
    nextServerUrl = '';
    marketingPageUrl = process.env.SERVER_PROTOCOL + '://' + process.env.MARKETING_PAGE_DOMAIN + '/';
    initialized = false;

    constructor() {
        // Set default domain immediately so methods work before initialization completes
        this.setDomain(DEFAULT_DOMAIN);
        this.initDomain();
    }

    async initDomain() {
        try {
            const data = await browser.storage.local.get(DOMAIN_STORAGE_KEY);
            const domain = data[DOMAIN_STORAGE_KEY] || DEFAULT_DOMAIN;
            this.setDomain(domain);
            this.initialized = true;
        } catch (error) {
            console.error('Error loading domain setting:', error);
            this.setDomain(DEFAULT_DOMAIN);
            this.initialized = true;
        }
    }

    setDomain(domain) {
        console.log('Setting domain to:', domain);
        this.serverUrl = process.env.SERVER_PROTOCOL + '://' + domain + '/';
        this.nextServerUrl = process.env.SERVER_PROTOCOL + '://' + process.env.NEXT_SERVER_DOMAIN + '/';
        // Save the domain to storage
        browser.storage.local.set({[DOMAIN_STORAGE_KEY]: domain});
        return this.serverUrl;
    }

    getAvailableDomains() {
        return AVAILABLE_DOMAINS;
    }

    getCurrentDomain() {
        const url = new URL(this.serverUrl);
        return url.hostname;
    }

    changeBaseUrl(url) {
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
