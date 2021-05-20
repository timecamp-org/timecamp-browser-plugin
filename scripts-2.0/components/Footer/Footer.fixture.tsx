import * as React from 'react';
import Footer from '.';

export default <Footer
    onClickSave={() => {console.log('Save');}}
    onClickCancel={() => {console.log('Cancel');}}
    idDisabled={false}
/>;
