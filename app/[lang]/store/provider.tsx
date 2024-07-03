'use client'

import { createContext, useReducer } from 'react'

export const ThemeContext = createContext({})

const Context = createContext({});

export default function Provider({ children }: { children: React.ReactNode }) {
    const store = useReducer(
        reducer,
        initialTasks
    );

    return (
        <Context.Provider value={store}>
            <ThemeContext.Provider value={store[0].theme}>
                {children}
            </ThemeContext.Provider>
        </Context.Provider>
    );
}


function reducer(state: any, action: any) {
    switch (action.type) {
        case 'theme': {
            return { ...state, theme: action.theme };
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

const initialTasks = {
    theme: 'light'
};

// export default function ThemeProvider({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>
// }