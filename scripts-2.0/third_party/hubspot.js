'use strict';

const SERVICE = 'hubspot';

tcbutton.render(
    'td[data-table-external-id*="name-"] [data-test-id="truncated-object-label"]:not(.tc)',
    { observe: true, debounceInterval: 500 },
    elem => {
        const getDescription = () => {
            return elem.textContent?.trim();
        }

        const link = tcbutton.createTimerLink({
            className: SERVICE,
            description: getDescription,
            buttonType: "minimal",
        });

        elem.insertAdjacentElement("beforeend", link);

        return true;
});

tcbutton.render(
    '[data-selenium-test="highlightTitle"]:not(.tc)',
    { observe: true },
    elem => {
        const container = elem.parentElement;
        const ticketId = window.location.href.split('/')[6].replace("/", "");
        let description = '';
        if (document.querySelector(".width-100 a.private-link.uiLinkWithoutUnderline.uiLinkDark")) {
            let contact = document.querySelector(".width-100 a.private-link.uiLinkWithoutUnderline.uiLinkDark").textContent;
            description = "[#" + ticketId + "] " + elem.textContent + " (" + contact + ")";
        } else {
            description = "[#" + ticketId + "] " + elem.textContent;
        }

        const link = tcbutton.createTimerLink({
            className: SERVICE,
            description: description,
        });

        link.style.display = 'block';

        container.appendChild(link);

        return true;
});
