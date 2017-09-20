import React from 'react'
import PropTypes from 'prop-types'

const LoadingOverlay = (props) =>
  <div style={{
    display: props.show ? `flex` : `none`,
    position: `absolute`,
    top: 0, left: 0, right: 0, bottom: 0,
    background: `rgba(255,255,255,0.8)`,
    alignItems: `center`,
    justifyContent: `center`
  }}>
    <div style={{textAlign: `center`}}>
      <p>Loading, please wait...</p>
      <img src={require(`./svg/flask-loader.svg`)}/>
      <p><small>Powered by <a href={`https://loading.io`}>loading.io</a></small></p>
    </div>
  </div>

LoadingOverlay.propTypes = {
  show: PropTypes.bool.isRequired
}

export default LoadingOverlay
