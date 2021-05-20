import * as React from "react";
import Button from "../common/Button";
import './styles.scss';
import translate from "../../Translator";
import {useEffect, useState} from "react";

export interface LoginFormInterface {
    login: string,
    password: string,
    onLoginClick(login: string, password: string): any
}

const LoginForm: React.FC<LoginFormInterface> = (props) => {
    const [login, setLogin] = useState(props.login);
    const [password, setPassword] = useState(props.password);

    useEffect(() => {
        setLogin(props.login);
        setPassword(props.password);
    }, [props]);
    
    return (
        <div className={'loginForm'}>
            <input 
                type='email'
                placeholder={translate('email')}
                value={login}
                className={'loginForm__login'}
                onChange={e => setLogin(e.target.value)}
            />
            <input
                type='password'
                placeholder={translate('password')}
                value={password}
                className={'loginForm__password'}
                onChange={e => setPassword(e.target.value)}
            />
            <Button
                class={'loginForm__button-login'} 
                onClick={() => props.onLoginClick(login, password)}
            >
                {translate('log_in')}
            </Button>
        </div>
    );
};

export default LoginForm;
