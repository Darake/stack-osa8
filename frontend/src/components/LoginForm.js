import React from 'react'
import { useField } from '../hooks'

const LoginForm = props => {
  if (!props.show) {
    return null
  }

  const [username, resetUsername] = useField('text')
  const [password, resetPassword] = useField('password')
  const handleSubmit = async e => {
    e.preventDefault()

    const result = await props.login({
      variables: {
        username: username.value,
        password: password.value
      }
    })
    const token = result.data.login.value
    props.setToken(token)
    localStorage.setItem('user-token', token)
    resetPassword()
    resetUsername()

    props.setPage('authors')
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          username
          <input {...username}/>
        </div>
        <div>
          password
          <input {...password}/>
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm