import md5 from 'crypto-js/md5';

export default class Gravatar {
    constructor() {
    }

    getGravatarUrlForEmail = (email, s = 120) => {
        let url = 'https://www.gravatar.com/avatar/';
        url += md5(email.trim().toLowerCase());
        url += '?s=' + s + '&d=mm';

        return url;
    }

    getDefaultImageUrl = () => {
        return 'https://www.gravatar.com/avatar/aaa?s=120&d=mm';
    }
}
