import React, { useState } from 'react'
import { useApolloClient } from 'react-apollo-hooks'
import BookTable from './BookTable'

const Books = (props) => {
  if (!props.show) {
    return null
  }
  if (props.books.loading) {
    return <div>loading...</div>
  }

  const client = useApolloClient()

  const [books, setBooks] = useState(props.books.data.allBooks)
  const [genres, setGenres] = useState([])
  
  props.books.data.allBooks.forEach(b => {
    b.genres.forEach(g => {
      if (!genres.includes(g)) setGenres(genres.concat(g))
    })
  })

  const showGenre = async genre => {
    const { data } = await client.query({
      query: props.ALL_BOOKS,
      variables: { genre }
    })
    setBooks(data.allBooks)
  }

  return (
    <div>
      <h2>books</h2>

      <BookTable books={books} />
      <div>
        {genres.map(g =>
          <button key={g} onClick={() => showGenre(g)}>{g}</button>
        )}
        <button onClick={() => setBooks(props.books.data.allBooks)}>all genres</button>
      </div>
    </div>
  )
}

export default Books