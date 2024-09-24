import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloProvider} from "@apollo/client";

import { clientA, clientB } from './components/clients';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
        <ApolloProvider client={clientA}>
            <ApolloProvider client={clientB}>
                <App />
            </ApolloProvider>
        </ApolloProvider>
);

reportWebVitals();
