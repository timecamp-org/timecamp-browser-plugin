'use strict';

tcbutton.render('.IZ65Hb-TBnied:not(.tc)', { observe: true }, function (
  elem
) {
  const toolbar = $('.IZ65Hb-INgbqf', elem);
  const description = $('.IZ65Hb-YPqjbf:not(.LwH6nd)', elem).textContent;
  const link = tcbutton.createTimerLink({
    className: 'google-keep',
    buttonType: 'minimal',
    description: description,
  });
  toolbar.appendChild(link);
});

tcbutton.render(
  '.IZ65Hb-TBnied .gkA7Yd-sKfxWe .CmABtb.RNfche:not(.tc)',
  { observe: true },
  function (elem) {
    const position = $('.IZ65Hb-MPu53c-haAclf', elem);
    const description = elem.textContent;

    const link = tcbutton.createTimerLink({
      className: 'google-keep',
      buttonType: 'minimal',
      description: description
    });
    position.appendChild(link);
  }
);
