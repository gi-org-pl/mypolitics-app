import {Button} from '@gi/athena';
import React, { useState } from 'react';
import { PATHS } from '@/constants/paths'


export const Header: React.FC = () => { 

    const [activeButton, setActiveButton] = useState('debaty');
    const [isMenuOpen, setMenuOpen] = useState(false);

    function buttonClick(buttonName: string) {
        setActiveButton(buttonName);
    }

    return (
        <div className='flex justify-around m-8'>
            <img src='src\assets\vectors\logo.svg'>
                {/* <Link to={PATHS.home}/> */}
            </img>

            <nav className='hidden md:flex gap-4'>

                <Button type = {activeButton === 'debaty' ? 'primary' : 'ghost'} onClick={() => buttonClick('debaty')}>
                    <img src='src\assets\vectors\debaty_icon.svg'
                        className={
                            activeButton === 'debaty' ? 'brightness-0 invert' : ''
                        }
                    />
                    Debaty
                </Button>

                <Button type = {activeButton === 'sondaze' ? 'primary' : 'ghost'} onClick={() => buttonClick('sondaze')}>
                    <img src='src\assets\vectors\sondaze_icon.svg'
                        className={
                            activeButton === 'sondaze' ? 'brightness-0 invert' : ''
                        }
                    />
                    Sondaże
                </Button>

                <Button  type = {activeButton === 'quizy' ? 'primary' : 'ghost'} onClick={() => buttonClick('quizy')}>
                    <img src='src\assets\vectors\quizy_icon.svg'
                        className={
                            activeButton === 'quizy' ? 'brightness-0 invert' : ''
                        }
                    />
                    Quizy
                </Button>
            </nav>

            <button className='md:hidden text-3xl' onClick={() => setMenuOpen(!isMenuOpen)}>
                    <img src='src\assets\vectors\hamburger-menu.svg'/>
            </button>

            

        </div>
    );
};

