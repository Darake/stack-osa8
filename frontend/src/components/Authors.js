import React, { useState } from 'react'

const Authors = (props) => {
  if (!props.show) {
    return null
  }
  if (props.authors.loading) {
    return <div>loading...</div>
  }
  
  const authors = props.authors.data.allAuthors
  const authorsWithoutYear = authors.filter(a => a.born === null)
  
  const [name, setName] = useState(authorsWithoutYear[0] ? authorsWithoutYear[0].name : '')
  const [born, setBorn] = useState('')

  const handleUpdate = async e => {
    e.preventDefault()
    await props.addYear({
      variables: { name, setBornTo: Number(born) }
    })
    setName('')
    setBorn('')
  }

  const handleChange = e => {
    setName(e.target.value)
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
        <select onChange={handleChange} value={name}>
          {authorsWithoutYear.map(a => 
            <option key={a.name} value={a.name}>{a.name}</option>
          )}
        </select>
        <br/>
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