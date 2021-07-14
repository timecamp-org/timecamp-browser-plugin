import md5 from 'crypto-js/md5';

const AVATAR_URL = 'https://www.gravatar.com/avatar/';

export default class Gravatar {
    constructor() {
    }

    getGravatarUrlForEmail = (email, s = 120) => {
        let url = AVATAR_URL;
        url += md5(email.trim().toLowerCase());
        url += '?s=' + s + '&d=mm';

        return url;
    }

    getDefaultImageUrl = () => {
        return AVATAR_URL + 'aaa?s=120&d=mm';
    }
}
