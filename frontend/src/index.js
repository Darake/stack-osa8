import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { ApolloProvider } from 'react-apollo-hooks'
import client from './config/client'

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
)