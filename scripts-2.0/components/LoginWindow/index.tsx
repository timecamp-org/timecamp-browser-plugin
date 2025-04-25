import * as React from "react";
import Header from "../Header";
import {useEffect, useState, useRef} from "react";
import './styles.scss';
import translate from "../../Translator";
import Button from "../common/Button";
import PathService from '../../PathService';
import CustomDomainSection from './CustomDomainSection/CustomDomainSection';

const pathService = new PathService();

export interface LoginWindowInterface {
    position: object,
}

const LoginWindow: React.FC<LoginWindowInterface> = (props) => {
    const node = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(true);

    useEffect(() => {
        setOpen(true);
        document.addEventListener("click", onClickOutside);

        return () => {
            document.removeEventListener("click", onClickOutside);
        };
    }, [props]);

    const onClickOutside = e => {
        const open = node.current !== null && node.current.contains(e.target)
        setOpen(open);
    };

    const onLoginClick = (e) => {
        setOpen(false);
        e.stopPropagation();
        window.open(pathService.getLoginUrl(), '_blank');
    };

    return (
        <div ref={node} className={`loginWindow ${!open ? "loginWindow--hidden" : ""}`} style={props.position} data-elevation='2'>
            <Header/>
            <div className='loginWindow__main-info'>{translate('you_re_almost_there')}</div>
            <div className='loginWindow__desc'>{translate('click_the_button_below_to_login_to_your_timecamp_account')}</div>
            <Button
                class={'loginWindow__button-login'}
                onClick={(e) => {
                    onLoginClick(e);
                }}
            >
                {translate('log_in')}
            </Button>

            <CustomDomainSection />

            <div className='loginWindow__bottom-info'>
                No account?&nbsp;
                <a href={pathService.getRegisterUrl()} target="_blank" className='loginWindow__bottom-info-link'>{translate('sign_up')}</a>
            </div>
        </div>
    );
};

export default LoginWindow;
