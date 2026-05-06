import {Button} from '@gi/athena';

export const Header: React.FC = () => { 

    function buttonClick()
    {
        typeof Button; "primary";
    }

    return (
        <div className='flex justify-around m-8'>
            <img src='src\assets\images\logo.svg'></img>
            <nav>
                <Button type="ghost" onClick={buttonClick}>
                    <img src='src\assets\images\debaty_icon.svg'></img>
                    Debaty
                </Button>
                <Button type="primary" onClick={buttonClick}>
                    <img src='src\assets\images\sondaze_icon.svg'></img>
                    Sondaże
                </Button>
                <Button type="ghost" onClick={buttonClick}>
                    <img src='src\assets\images\quizy_icon.svg'></img>
                    Quizy
                </Button>
            </nav>
        </div>
    );
};

