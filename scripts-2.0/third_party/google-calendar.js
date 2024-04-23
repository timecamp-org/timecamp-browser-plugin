'use strict';

const GOOGLE_CALENDAR = 'googlecalendar';

//Table view
tcbutton.render(
    '.i5a7ie:not(.tc)',
    { observe: true },
    (elem) => {
        function createTimecampElements() {
            const getDescription = () => {
                const descriptionSelector = $('[role="heading"]', elem);
                if (descriptionSelector) {
                    return descriptionSelector.textContent;
                }

                return '';
            };

            let cardHeader = $(".wv9rPe");
    
            if (cardHeader) {
                const link = tcbutton.createTimerLink({
                    className: GOOGLE_CALENDAR,
                    additionalClasses: [GOOGLE_CALENDAR + '__entry'],
                    description: getDescription(),
                    isBackendIntegration: true
                });

                const timecampContainer = createTag("div", "tc-widget-container");

                timecampContainer.appendChild(link);
                cardHeader.appendChild(timecampContainer);
            }
        }
        if (!$(".tc-widget-container")) {
            createTimecampElements();
        }
        $$('[role="button"][data-opens-details="true"]').forEach((item) => {
            item.addEventListener("click", (event) => {
                createTimecampElements();
            });
        });
    });
