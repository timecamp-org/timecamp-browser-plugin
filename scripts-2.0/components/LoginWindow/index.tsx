import * as React from "react";
import Header from "../Header";
import {useEffect, useState, useRef} from "react";
import './styles.scss';
import translate from "../../Translator";
import Button from "../common/Button";
import PathService from '../../PathService';

const pathService = new PathService();

export interface LoginWindowInterface {
    position: object,
}

const LoginWindow: React.FC<LoginWindowInterface> = (props) => {
    const node = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(true);
    const [domains, setDomains] = useState<string[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string>('');

    useEffect(() => {
        setOpen(true);
        document.addEventListener("click", onClickOutside);
        
        // Get available domains and currently selected domain
        const availableDomains = pathService.getAvailableDomains();
        setDomains(availableDomains);
        
        // Set the current domain as the selected domain
        pathService.initDomain().then(() => {
            setSelectedDomain(pathService.getCurrentDomain());
        });

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

    const handleDomainChange = (e) => {
        const domain = e.target.value;
        setSelectedDomain(domain);
        pathService.setDomain(domain);
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
            
            <div className="loginWindow__domain-selector">
                <label htmlFor="domain-select">{translate('select_domain')}:</label>
                <select 
                    id="domain-select"
                    value={selectedDomain}
                    onChange={handleDomainChange}
                    className="loginWindow__domain-select"
                >
                    {domains.map(domain => (
                        <option key={domain} value={domain}>{domain}</option>
                    ))}
                </select>
            </div>
            
            <div className='loginWindow__bottom-info'>
                No account?&nbsp;
                <a href={pathService.getRegisterUrl()} target="_blank" className='loginWindow__bottom-info-link'>{translate('sign_up')}</a>
            </div>
        </div>
    );
};

export default LoginWindow;
