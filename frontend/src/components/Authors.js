import React, { useState } from 'react'

const Authors = (props) => {
  if (!props.show) {
    return null
  }
  if (props.authors.loading) {
    return <div>loading...</div>
  }
  
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const authors = props.authors.data.allAuthors

  const handleUpdate = async e => {
    e.preventDefault()
    await props.addYear({
      variables: { name, setBornTo: Number(born) }
    })
    setName('')
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h3>Set birthyear</h3>
      <form onSubmit={handleUpdate}>
        Name:
        <input
          value={name}
          onChange={({ target }) => setName(target.value)}
        /> <br/>
        Born:
        <input
          value={born}
          onChange={({ target }) => setBorn(target.value)}
        /> <br/>
        <button type="submit">Update author</button>
      </form>
    </div>
  )
}

export default Authors