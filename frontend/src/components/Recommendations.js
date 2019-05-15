import React, { useState } from 'react'
import { useApolloClient } from 'react-apollo-hooks'
import BookTable from './BookTable'

const Recommendations = props => {
  if (!props.show) {
    return null
  }
  if (props.user.loading) {
    return <div>loading...</div>
  }

  const client = useApolloClient()

  const [books, setBooks] = useState([])

  const showGenre = async () => {
    const { data } = await client.query({
      query: props.ALL_BOOKS,
      variables: { genre: props.user.data.me.favoriteGenre }
    })
    setBooks(data.allBooks)
  }

  showGenre()

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre <b>patterns</b></p>
      <BookTable books={books} />
    </div>
  )
}

export default Recommendations