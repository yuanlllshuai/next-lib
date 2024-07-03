'use client'
import { useContext } from 'react';
import { ThemeContext } from '@/app/store/provider';

const Out = ({ children }: { children: React.ReactNode }) => {
    const theme = useContext(ThemeContext);
    console.log(theme)
    return <>{children}</>
}

export default Out;