/**
 * Created by mdybizbanski on 15.09.15.
 */
var serverUrl = 'https://app.timecamp.local/';

var customDomain = {
    73065: 'https://enterprise.timecamp.local/',
    1208: 'https://app.timecamp.local/',
}

//var serverUrl = 'https:/c3666ee3.ngrok.io/';
// używając adres lokalny, dodaj go do wzorca w manifest.json, sekcja "permissions"  (https://*.ngrok.io/*")

var restUrl = serverUrl + 'chrome_plugin/api';
var tokenUrl = serverUrl + 'auth/token';
var signInUrl = serverUrl + 'auth/login';
var accessUrl = serverUrl + "auth/access";

var errorLogNoticeCounter = 0;
