
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

const httpLink = createHttpLink({
    uri: 'http://127.0.0.1:8000/graphql/',
    credentials: 'same-origin', 
});

const httpLinkB = createHttpLink({
    uri: 'http://127.0.0.1:8001/graphql/',
    credentials: 'same-origin',  
});

const httpLinkC = createHttpLink({
    uri: 'http://127.0.0.1:8002/graphql/',
    credentials: 'same-origin',  
});

const getToken = () => {
    return Cookies.get('token');
  };

const authLink = setContext((_, { headers }) => {
    const token = getToken(); 

    return {
        headers: {
        ...headers,
        Authorization: token ? `${token}` : '', 
        },
    };
});

export const clientA = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export const clientB = new ApolloClient({
    link: authLink.concat(httpLinkB),
    cache: new InMemoryCache(),
});

export const clientC = new ApolloClient({
    link: authLink.concat(httpLinkC),
    cache: new InMemoryCache(),
});
