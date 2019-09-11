import React, { useState, useEffect } from 'react';
import { Model } from "../../helpers/Model";
import { SelectionManager } from '../../helpers/SelectionManager';
import { closestElement } from '../../utils';

export const SelectionTooltip = (props) => {

    const { delay } = props;

    const supported = SelectionManager.Supported();
    const [ active, setActive ] = useState(false);
    const [ data, setData ] = useState({
        url: '',
        top: 0,
        left: 0,
        text: '',
        file: false
    });

    let timeoutDelay;

    useEffect(() => {

        if ( supported ) {

            document.addEventListener('click',  () => {

                clearTimeout(delay);

                timeoutDelay = setTimeout(() => {

                    const selection = SelectionManager.GetSelection();

                    if (selection) {

                        let file = false;
                        let url = selection.url;
                        const { top, left, text, node } = selection;

                        const repo = closestElement(node, 'repo');

                        if (repo) {
                            const repoData = Model.repos[ repo.dataset.repo ];
                            if (
                                repoData &&
                                repoData['pattern-link-reg'] &&
                                repoData['pattern-link-reg'].test(text)
                            ) {
                                repoData['pattern-links'].some((item) => {
                                    if (item.reg.test(text)) {
                                        url = text.replace(item.reg, item.link);
                                        file = true;
                                        return true;
                                    }
                                });
                            }

                        }

                        setData({
                            url: url,
                            top: top,
                            left: left,
                            text: text,
                            file
                        });

                        setActive(true);

                    } else {
                        setActive(false);
                    }

                }, delay);

            });

        }

    }, []);

    const onClickTooltip = (e) => {
        e.stopPropagation();
        setTimeout( () => {
            SelectionManager.clearSelection();
            setActive(false);
        }, 100);
    };

    const element = supported
        ? (
            <a
                className={ `selection-tooltip octicon ${ data.file && ' octicon-code' || ' octicon-search' }${ active && ' active' || ''}` }
                href={ data.url }
                style={{ top: data.top, left: data.left }}
                onClick={ onClickTooltip }
                target='_blank'
                rel="noopener noreferrer"
            >
                <span className="selection-tooltip-text">
                    { data.text }
                </span>
            </a>
        )
        : ''

    return element;

};
