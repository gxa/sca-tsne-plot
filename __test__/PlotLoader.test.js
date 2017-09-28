import React from 'react'
import renderer from 'react-test-renderer'
import fetchMock from 'fetch-mock'
import Enzyme from 'enzyme'
import {shallow} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

import PlotLoader from '../src/PlotLoader'

describe(`PlotLoader`, () => {
  const defaultProps = {
    atlasUrl: `https://www.ebi.ac.uk/gxa_sc/`,
    sourceUrl: `json/experiments/E-MTAB-4388/clusters/2`
  }

  beforeEach(() => {
    fetchMock.restore()
  })

  test(`displays an unspecific error message if fetch fails`, async () => {
    fetchMock.get(defaultProps.atlasUrl + defaultProps.sourceUrl, { throws: `Server unreachable` })
    const wrapper = shallow(<PlotLoader {...defaultProps} />)

    await wrapper.instance().componentDidMount()
    expect(wrapper.state(`errorMessage`)).not.toBe(null)
    wrapper.update()
    expect(wrapper.find(`.scxa-error`)).toHaveLength(1)
  })

  test(`displays a fetch error if non-JSON data is returned`, async () => {
    fetchMock.get(defaultProps.atlasUrl + defaultProps.sourceUrl, `<html></html>`)
    const wrapper = shallow(<PlotLoader {...defaultProps} />)

    await wrapper.instance().componentDidMount()
    expect(wrapper.state(`errorMessage`)).toMatch(/^FetchError:.*$/)
    wrapper.update()
    expect(wrapper.find(`.scxa-error`)).toHaveLength(1)
  })

  // Indirectly we’re testing the error boundary, I don’t know how to do this with Enzyme, or if it’s possible
  test(`throws an error if JSON payload is not an array`, async () => {
    console.error = jest.fn()
    fetchMock.get(defaultProps.atlasUrl + defaultProps.sourceUrl, JSON.stringify({Rick: `I turned myself into a pickle, Morty!`}))
    const wrapper = shallow(<PlotLoader {...defaultProps}/>)

    await wrapper.instance().componentDidMount()
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  // Uncomment if in componentWillReceiveProps to make this test fail
  test(`changes in props unrelated to the queried endpoint don’t fetch new data`, async () => {
    fetchMock.get(defaultProps.atlasUrl + defaultProps.sourceUrl, JSON.stringify([]))
    const wrapper = shallow(<PlotLoader {...defaultProps}/>)

    await wrapper.instance().componentDidMount()
    const fetchCount = fetchMock.calls().matched.length + fetchMock.calls().unmatched.length

    wrapper.setProps({
      highchartsConfig: {
        height: 1500
      }
    })

    const newFetchCount = fetchMock.calls().matched.length + fetchMock.calls().unmatched.length
    expect(newFetchCount).toBe(fetchCount)
  })

  test(`changes in props that change the queried endpoint fetch new data`, async () => {
    fetchMock.get(defaultProps.atlasUrl + defaultProps.sourceUrl, JSON.stringify([]))
    const wrapper = shallow(<PlotLoader {...defaultProps}/>)

    await wrapper.instance().componentDidMount()
    const fetchCount = fetchMock.calls().matched.length + fetchMock.calls().unmatched.length

    wrapper.setProps({
      sourceUrl: `json/experiments/E-MTAB-4388/clusters/3`
    })

    const newFetchCount = fetchMock.calls().matched.length + fetchMock.calls().unmatched.length
    expect(newFetchCount).toBeGreaterThan(fetchCount)
  })

  // The test above can be thought of liek this:
  // test(`changes in props that change the queried endpoint fetch new data`, async () => {
  //   const wrapper = shallow(<PlotLoader {...defaultProps}/>)
  //   wrapper.instance()._fetchAndSetState = jest.fn()
  //
  //   wrapper.setProps({
  //     sourceUrl: `json/experiments/E-MTAB-4388/clusters/3`
  //   })
  //
  //   expect(wrapper.instance()._fetchAndSetState).toHaveBeenCalledTimes(1)
  // })
})