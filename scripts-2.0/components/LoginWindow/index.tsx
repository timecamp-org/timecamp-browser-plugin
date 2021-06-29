import * as React from "react";
import Header from "../Header";
import {useEffect, useState, useRef} from "react";
import './styles.scss';
import translate from "../../Translator";
import LoginForm from "../LoginForm";
const browser = require('webextension-polyfill');

export interface LoginWindowInterface {
    position: object,
    onCorrectLoginCallback: Function,
}

const LoginWindow: React.FC<LoginWindowInterface> = (props) => {
    const node = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(true);
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessageVisible, setErrorMessageVisible] = useState(false);
    const onCorrectLoginCallback = props.onCorrectLoginCallback;

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
        if (!open) {
            clearForm();
        }
    };

    const onLoginClick = (login, password) => {
        browser.runtime.sendMessage({
            type: 'logIn',
            login: login,
            password: password,
        }).then(() => {
            onCorrectLoginCallback();
            setOpen(false);
            clearForm();
        }).catch(() => {
            setErrorMessageVisible(true);
        });
    };

    const clearForm = () => {
        setLogin('');
        setPassword('');
        setErrorMessageVisible(false);
    }

    return (
        <div ref={node} className={`loginWindow ${!open ? "loginWindow--hidden" : ""}`} style={props.position} data-elevation='2'>
            <Header/>
            <div className='loginWindow__top-info'>Log in to your account</div>
            <div className={`loginWindow__error-div  ${!errorMessageVisible ? "loginWindow__error-div--hidden" : ""}`}>
                {translate('incorrect_login_or_password')}
            </div>
            <LoginForm
                login={login}
                password={password}
                onLoginClick={onLoginClick}
            />
            <div className='loginWindow__bottom-info'>
                New here?&nbsp;
                <a href="https://www.timecamp.com/auth/register" target="_blank" className='loginWindow__bottom-info-link'>Sign up</a>
                &nbsp;for a free account!
            </div>
        </div>
    );
};

export default LoginWindow;
