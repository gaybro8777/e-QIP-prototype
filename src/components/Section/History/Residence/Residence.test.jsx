import React from 'react'
import { shallow } from 'enzyme'
import { Residence } from './Residence'

describe('The Residence component', () => {
  it('renders without errors', () => {
    const component = shallow(<Residence />)

    expect(component.exists()).toBe(true)
    expect(component).toMatchSnapshot()
  })
})
