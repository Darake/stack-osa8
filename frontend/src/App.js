import React, { useState } from 'react'
import { gql } from 'apollo-boost'
import { Subscription } from 'react-apollo'
import { useQuery, useMutation, useApolloClient } from 'react-apollo-hooks'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'

const BOOK_DETAILS = gql`
fragment BookDetails on Book {
  id
  title
  published 
  genres
  author {
    name
  }
}
`

const BOOK_ADDED = gql`
subscription {
  bookAdded {
    ...BookDetails
  }
}
${BOOK_DETAILS}
`

const ALL_AUTHORS = gql`
{
  allAuthors {
    name
    born
    bookCount
  }
}
`

const ALL_BOOKS = gql`
query filteredBooks($genre: String) {
  allBooks(
    genre: $genre
  ) {
    title
    published
    genres
    author {
      name
    }
  }
}
`

const USER = gql`
{
  me {
    username
    favoriteGenre
  }
}
`

const CREATE_BOOK = gql`
mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
    title
    author {
      name
    }
    published
    genres
    id
  }
}
`

const ADD_YEAR = gql`
mutation addYear($name: String!, $setBornTo: Int!) {
  editAuthor(
    name: $name,
    setBornTo: $setBornTo
  ) {
    name
    born
    bookCount
  }
}
`

const LOGIN = gql`
mutation login($username: String!, $password: String!) {
  login(
    username: $username,
    password: $password
  ) {
    value
  }
}
`

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const user = useQuery(USER)
  const addBook = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }]
  })
  const addYear = useMutation(ADD_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })
  const login = useMutation(LOGIN)

  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <span style={{display: token ? '' : 'none'}}>
          <button onClick={() => setPage('add')}>add book</button>
          <button onClick={() => setPage('recommendations')}>recommendations</button>
          <button onClick={() => logout()}>logout</button>
        </span>
        <span style={{display: token ? 'none' : ''}}>
          <button onClick={() => setPage('login')}>login</button>
        </span>
      </div>

      <Authors
        show={page === 'authors'}
        authors={authors}
        addYear={addYear}
      />

      <Books
        show={page === 'books'}
        books={books}
        ALL_BOOKS={ALL_BOOKS}
      />

      <NewBook
        show={page === 'add'}
        addBook={addBook}
      />

      <LoginForm
        show={page === 'login'}
        setPage={setPage}
        login={login}
        setToken={(token) => setToken(token)}
      />

      <Recommendations 
        show={page === 'recommendations'}
        user={user}
        ALL_BOOKS={ALL_BOOKS}
      />

      <Subscription
        subscription={BOOK_ADDED}
        onSubscriptionData={({subscriptionData}) => {
          window.alert(`a new book ${subscriptionData.data.bookAdded.title} added`)
        }}
      > 
        {() => null}
      </Subscription>

    </div>
  )
}

export default App
