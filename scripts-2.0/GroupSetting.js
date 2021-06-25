const CHANGE_BILLING_FLAG = 'changeBillingFlag';
const HOURS_AND_MINUTES_FORMAT = 'hoursAndMinutesFormat';
const DONT_SHOW_BE_INTEGRATION_AD = 'dont_show_backend_integration_browser_plugin_ad';

export default class GroupSetting {
    static get CHANGE_BILLING_FLAG() {
        return CHANGE_BILLING_FLAG;
    }

    static get HOURS_AND_MINUTES_FORMAT() {
        return HOURS_AND_MINUTES_FORMAT;
    }

    static get DONT_SHOW_BE_INTEGRATION_AD() {
        return DONT_SHOW_BE_INTEGRATION_AD;
    }
}
