import { ApolloClient, InMemoryCache, ApolloLink, } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';

const uploadLink = createUploadLink({
  uri: 'http://localhost:4000/graphql', 
});

const client = new ApolloClient({
  link: ApolloLink.from([uploadLink]), 
  cache: new InMemoryCache(),
});

export default client;
