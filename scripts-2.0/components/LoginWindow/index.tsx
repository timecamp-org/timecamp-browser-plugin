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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setOpen(true);
        document.addEventListener("click", onClickOutside);
        
        // Initialize asynchronously
        const initDomains = async () => {
            setIsLoading(true);
            
            // Wait for pathService to initialize
            if (!pathService.initialized) {
                await pathService.initDomain();
            }
            
            // Get available domains and currently selected domain
            const availableDomains = pathService.getAvailableDomains();
            setDomains(availableDomains);
            setSelectedDomain(pathService.getCurrentDomain());
            setIsLoading(false);
        };
        
        initDomains();

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
        
        // Make sure we're using the current selected domain
        pathService.setDomain(selectedDomain);
        const loginUrl = pathService.getLoginUrl();
        console.log('Opening login URL:', loginUrl);
        window.open(loginUrl, '_blank');
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
                disabled={isLoading}
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
                    disabled={isLoading}
                >
                    {domains.map(domain => (
                        <option key={domain} value={domain}>{domain}</option>
                    ))}
                </select>
            </div>
            
            <div className='loginWindow__bottom-info'>
                No account?&nbsp;
                <a 
                    href={pathService.getRegisterUrl()} 
                    target="_blank" 
                    className='loginWindow__bottom-info-link'
                    onClick={(e) => {
                        // Ensure the current domain is used for the sign-up URL too
                        e.preventDefault();
                        window.open(pathService.getRegisterUrl(), '_blank');
                    }}
                >
                    {translate('sign_up')}
                </a>
            </div>
        </div>
    );
};

export default LoginWindow;
