import React from 'react';
import { Link } from 'react-router';

import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

import { Button } from '@gi/athena';
import { PATHS } from '@/constants/paths';

import bear404 from '@/assets/icons/bear-404.svg';

export const Error404: React.FC = () => {
    return (
        <div>
            <h1>
                <Trans>To jest błąd 404 <span className="text-primary">na miarę naszych możliwości</span>!</Trans>
            </h1>

            <p>
                <Trans>
                    My tym błędem otwieramy oczy niedowiarkom! Mówimy: to jest nasz błąd, przez nas zrobiony,
                    i to nie jest nasze ostatnie słowo!
                </Trans>
            </p>

            <img src={bear404} alt={t`Ilustracja misia — błąd 404`} />

            <Button aria-label='Strona Główna'/>
        </div>
    );
}