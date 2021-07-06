import * as React from "react";
import {useEffect, useState} from "react";
import './styles.scss';
import Button from "../../common/Button";
import Icon from "../../Icon";
import {IconName} from "../../../icons/types";
import {User} from "../index";
import translate from "../../../Translator";

export interface FooterInterface {
    isUserWindowOpen: boolean,
    logoutCallback: Function,
    onPlusButtonClickCallback: Function,
    user: User
}

const Footer: React.FC<FooterInterface> = (props) => {
    const [isUserWindowOpen, setIsUserWindowOpen] = useState(props.isUserWindowOpen);
    const [user, setUser] = useState<User>(props.user);
    const logoutCallback = props.logoutCallback;
    const onPlusButtonClickCallback = props.onPlusButtonClickCallback;

    useEffect(() => {
        setUser(props.user);
    }, [props.user]);

    useEffect(() => {
        setIsUserWindowOpen(props.isUserWindowOpen);
    }, [props]);

    return (
        <div className='tc-popup-footer'>
            <div>
                <Button
                    class={'tc-popup-footer__button-add'}
                    onClick={onPlusButtonClickCallback}
                >
                    <Icon name={IconName.PLUS}/>
                </Button>

                <a href='https://app.timecamp.com/app#/reports/projects_and_tasks/projectsAndTasks' target='_blank'>
                    <Button class={'tc-popup-footer__button-show-reports'} onClick={() => {}}>
                        <Icon name={IconName.CHART_PIE} iconPrefix={'far'}/>
                        {translate('show_reports')}
                    </Button>
                </a>
            </div>

            <div className='tc-popup-footer__user-img' onClick={() => {setIsUserWindowOpen(!isUserWindowOpen)}}>
                <img className='user-img' src={user.gravatarUrl} />
            </div>

            <div className={`tc-popup-footer__user-slide-window ' ${isUserWindowOpen ? 'tc-popup-footer__user-slide-window--visible' : ''}`}>
                <div>
                    <div className='section-top user'>
                        <a href='https://app.timecamp.com/app#/settings/users/me' target='_blank'>
                            <img className='user__img user-img' src={user.gravatarUrl} />
                            <div>
                                <div className='user__display-name' style={user.displayName === null ? {marginTop: '10px'} : {}}>
                                    {user.displayName === null ? user.email : user.displayName }
                                </div>
                                {user.displayName && <div className='user__email'>{user.email}</div>}
                            </div>
                        </a>
                    </div>
                    <div className='section-bottom'>
                        <Button
                            class={'section-bottom__button-sign-out'}
                            onClick={logoutCallback}
                        >
                            <Icon name={IconName.SIGN_OUT_ALT} iconPrefix={'far'}/>
                            {translate('log_out')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
