'use strict';

const button = (link, elem) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'tcWrapper';
    wrapper.style.textAlign = 'center';
    wrapper.style.borderBottom = '1px solid rgba(125,125,125,0.3)';
    wrapper.style.marginBottom = '1em';
    wrapper.appendChild(link);

    elem.insertBefore(wrapper, elem.firstChild);

    return true;
};

const descriptionSelector = () => {
    try {
        const ticketCode = document.querySelector('.CodeLabel').textContent.trim();
        const ticketSubject = document.querySelector('.ConversationHeaderSubject').textContent.trim();
        return '[' + ticketCode + '] ' + ticketSubject;
    } catch (e) {
        return '';
    }
};

tcbutton.render(
    '.ConversationDetailsView:not(.tc)', { observe: true }, (elem) => {
        const link = tcbutton.createTimerLink({
            className: 'liveagent',
            description: descriptionSelector
        });

        return button(link, elem);
    }
);

const knowledgeBaseName = () => {
    try {
        return document.querySelector('.ArticleContentView .DialogTitle').textContent.trim();
    } catch (e) {
        return '';
    }
};
tcbutton.render('.ArticleDetails:not(.tc)', { observe: true }, (articleDetails) => {
    const link = tcbutton.createTimerLink({
        className: 'liveagent',
        description: knowledgeBaseName
    });

    return button(link, articleDetails);
});
