// import { render, screen } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
// import { MemoryRouter } from 'react-router';
// import { describe, expect, it } from 'vitest';
// import { PATHS } from '@/constants/paths';
// import Header from './Header';

// describe('<Header />', () => {
//   describe('on desktop', () => {
//     it('renders the myPolitics logo linking to home', () =>{
//         render(
//             <MemoryRouter>
//                 <Header/>
//             </MemoryRouter>
//         )
//         const img = screen.getByAltText(/logo/i);
//     });
//     it('renders all three nav items', () => {
//         render(
//             <MemoryRouter>
//                 <Header/>
//             </MemoryRouter>
//         )
//     });
//     it('applies the active style to the current route', ...);
//     it('does not show the hamburger button', ...);
//   });

//   describe('on mobile', () => {
//     it('shows the hamburger button and hides nav items', ...);
//     describe('when the hamburger is clicked', () => {
//       it('opens the mobile navigation menu', ...);
//       it('closes the menu when a nav item is clicked', ...);
//       it('closes the menu when clicking outside', ...);
//     });
//   });
// });