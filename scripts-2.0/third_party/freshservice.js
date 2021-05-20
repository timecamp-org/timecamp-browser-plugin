'use strict';

const SERVICE = 'freshservice';

tcbutton.render(
    "#sticky_header.tkt-details-sticky .sticky_right:not(.tc)",
    { observe: true },
    function (elem) {
        const desc = $("#ticket_original_request_section .subject").innerText;
        const ticket = $(".ticket_header span").innerText;
        
        const link = tcbutton.createTimerLink({
            className: SERVICE,
            description: "[" + ticket + "] " + desc,
        });
        
        link.style.marginRight = "12px";
        link.style.marginLeft = "10px";
        link.style.marginTop = "5px";
        var container = document.createElement("div");
        container.className = "ticket-actions";
        container.prepend(link);
        const placeholder = elem.querySelector(".ticket-actions");
        if (placeholder) {
            placeholder.insertAdjacentElement("afterEnd", container);
        } else {
            elem.append(container);
        }
    }
);

tcbutton.render(
    "#ticket-sidebar:not(.tc)",
    { observe: true },
    function (elem) {
        const desc = $("#ticket-show h2.heading>span").innerText;
        const nodes = $("#ticket-show h2.heading").childNodes;
        let ticket = '';
        for (const node of nodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                ticket = node.textContent;
                break;
            }
        }
        
        const link = tcbutton.createTimerLink({
            className: SERVICE,
            description: "[" + ticket + "] " + desc,
        });
        
        link.style.marginLeft = "18px";
        link.style.marginTop = "10px";
        link.style.marginBottom = "20px";
        link.style.display = "inline-flex";
        link.style.verticalAlign = "middle";
        elem.prepend(link);
    }
);
