import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import browsee from '@browsee/web-sdk';

browsee.init({ apiKey: '85fdc35745de9780b98d14445b14a0c15dff71646ccae766' });

const container = document.getElementById('root');
createRoot(container).render(<App />);
