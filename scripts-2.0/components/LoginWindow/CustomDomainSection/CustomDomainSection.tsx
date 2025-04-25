const browser = require('webextension-polyfill');
import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import StorageManager from "../../../StorageManager";
import PathService from '../../../PathService';
import translate from "../../../Translator";
import './styles.scss';

const storageManager = new StorageManager();
const pathService = new PathService();
pathService.init();

const CustomDomain = () => {
    const [showInput, setShowInput] = useState(false);
    const [domain, setDomain] = useState('');
    const [loadedDomain, setLoadedDomain] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleEditClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowInput(true);
        setDomain(stripProtocolAndSlash(loadedDomain));
    }, [loadedDomain]);

    const stripProtocolAndSlash = (url: string) => {
        if (!url) return '';
        return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    };

    const validateUrl = (url: string) => {
        let validatedUrl = url.trim();
        if (!validatedUrl.startsWith('http://') && !validatedUrl.startsWith('https://')) {
            validatedUrl = 'https://' + validatedUrl;
        }
        if (!validatedUrl.endsWith('/')) {
            validatedUrl += '/';
        }
        return validatedUrl;
    };

    const validateDomainPattern = (domain: string) => {
        //this is externally_connectable.matches from manifest
        const matchPatterns = ["*://*.timecamp.com/*", "*://*.tcstaging.dev/*"];

        try {
            const url = new URL(domain);
            const hostname = url.hostname;
            const protocol = url.protocol;

            return matchPatterns.some(pattern => {
                const [patternProtocol, patternHost] = pattern.split('://');

                if (patternProtocol !== '*' && patternProtocol !== protocol.slice(0, -1)) {
                    return false;
                }

                const baseHost = patternHost.replace('*.', '').replace('/*', '');
                return hostname === baseHost || hostname.endsWith(`.${baseHost}`);
            });
        } catch (error) {
            console.error('Invalid URL:', domain, error);
            return false;
        }
    };

    const updateDomain = useCallback(async (newDomain: string) => {
        try {
            await storageManager.set(StorageManager.STORAGE_KEY_DOMAIN, newDomain);
            console.log('Domain updated:', newDomain);
            pathService.changeBaseUrl(newDomain);
            browser.runtime.sendMessage({ type: 'reloadDomainInWorker' });
            setLoadedDomain(newDomain);
            setDomain('');
            setShowInput(false);
        } catch (err) {
            console.error('Failed to update domain:', err);
        }
    }, []);

    const saveDomain = useCallback(async () => {
        if (!domain.trim()) {
            setErrorMessage(translate('domain_empty_error'));
            return;
        }

        try {
            const validatedDomain = validateUrl(domain);
            if (!validateDomainPattern(validatedDomain)) {
                setErrorMessage(translate('domain_invalid_pattern_error'));
                return;
            }
            await updateDomain(validatedDomain);
            setErrorMessage('');
        } catch (err) {
            console.error('Failed to validate and save domain:', err);
        }
    }, [domain, updateDomain]);

    const clearDomain = useCallback(async () => {
        await updateDomain('');
    }, [updateDomain]);

    useEffect(() => {
        const loadDomain = async () => {
            try {
                const value = await storageManager.get(StorageManager.STORAGE_KEY_DOMAIN);
                console.log('Loaded domain:', value);
                if (value) {
                    setLoadedDomain(value);
                }
            } catch (e) {
                console.error('Load domain error:', e);
            }
        };

        loadDomain();
    }, []);

    return (
        <div className="CustomDomain">
            {showInput ? (
                <div className="inner-container">
                    <div className="input-wrapper">
                        <span className="prefix">https://</span>
                        <input
                            type="text"
                            placeholder={process.env.SERVER_DOMAIN}
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="input"
                        />
                        <span className="suffix">/</span>
                    </div>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    <div className="buttons-container">
                        <button onClick={saveDomain} className="button button__save">
                            {translate('save')}
                        </button>
                        <button onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowInput(false);
                        }} className="button">
                            {translate('cancel')}
                        </button>
                        <button onClick={clearDomain} className="button button__clear">
                            {translate('clear')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="inner-container">
                    {loadedDomain ? (
                        <React.Fragment>
                            <a
                                href={loadedDomain}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link"
                            >
                                {loadedDomain}
                            </a>
                            <div className="buttons-container">
                                <button onClick={handleEditClick} className="button">
                                    {translate('edit')}
                                </button>
                            </div>
                        </React.Fragment>
                    ) : (
                        <button onClick={handleEditClick} className="button">
                            {translate('set_custom_domain')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomDomain;
